import type { PrismaClient, Order } from "./generated/prisma";
import type { createClient } from "redis";
import { OrderBook } from "./OrderBook";
import { PriceOracle } from "./PriceOracle";
import { PositionTracker, type Position } from "./PositionTracker";

type RedisClient = ReturnType<typeof createClient>;

export class PaperEngine {
  private orderBook: OrderBook;
  private positionTracker: PositionTracker;

  constructor(
    private readonly redis: RedisClient,
    private readonly prisma: PrismaClient,
    private readonly oracle: PriceOracle,
  ) {
    this.orderBook = new OrderBook();
    this.positionTracker = new PositionTracker();

    // TRIGGER 2: React to every Binance price tick
    this.oracle.on("tick", (symbol: string, price: number) => {
      this.onTick(symbol, price).catch((err) =>
        console.error("[PaperEngine] onTick error:", err),
      );
    });
  }

  getPositionTracker(): PositionTracker {
    return this.positionTracker;
  }

  getPositions(userId: string): Position[] {
    return this.positionTracker.getPositions(userId);
  }

  // ─── TRIGGER 1: Called from the brPop loop in index.ts ───────────────────

  async processOrder(order: Order): Promise<void> {
    if (order.type === "MARKET") {
      const currentPrice = this.oracle.getPrice(order.market);

      if (currentPrice === undefined) {
        console.error(
          `[PaperEngine] No price yet for ${order.market} — cannot fill MARKET order #${order.id}`,
        );
        return;
      }

      await this.fillOrder(order, currentPrice);
    } else {
      // LIMIT order
      const currentPrice = this.oracle.getPrice(order.market);

      // Can it fill right now? (price already crossed the limit)
      const canFillNow =
        currentPrice !== undefined &&
        ((order.side === "BUY" && currentPrice <= order.price!) ||
          (order.side === "SELL" && currentPrice >= order.price!));

      if (canFillNow) {
        await this.fillOrder(order, order.price!);
      } else {
        // Rest in the OrderBook until price crosses
        this.orderBook.addLimitOrder(order);
        console.log(
          `[PaperEngine] Resting LIMIT ${order.side} ${order.qty} ${order.market} @ $${order.price} (Order #${order.id})`,
        );
      }
    }
  }

  // ─── TRIGGER 2: Called from the PriceOracle tick event ───────────────────

  private async onTick(symbol: string, price: number): Promise<void> {
    const resting = this.orderBook.getOrdersForSymbol(symbol);

    for (const order of resting) {
      const shouldFill =
        (order.side === "BUY" && price <= order.price!) ||
        (order.side === "SELL" && price >= order.price!);

      if (shouldFill) {
        this.orderBook.removeLimitOrder(order.id);
        await this.fillOrder(order, order.price!);
      }
    }
  }

  // ─── Read-only helpers ───────────────────────────────────────────────────

  async getDepth(symbol: string): Promise<Order[]> {
    const localOrders = this.orderBook.getOrdersForSymbol(symbol);

    try {
      const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=50`);
      if (!res.ok) {
        throw new Error(`Binance depth returned status: ${res.status}`);
      }

      const data = (await res.json()) as {
        bids: [string, string][];
        asks: [string, string][];
      };

      const binanceBids: Order[] = (data.bids || []).map(([priceStr, qtyStr], index) => ({
        id: -10000 - index,
        userId: "system",
        market: symbol,
        price: parseFloat(priceStr),
        qty: parseFloat(qtyStr),
        type: "LIMIT" as const,
        side: "BUY" as const,
        filledQty: 0,
        status: "OPEN" as const,
        createdAt: new Date(),
      }));

      const binanceAsks: Order[] = (data.asks || []).map(([priceStr, qtyStr], index) => ({
        id: -20000 - index,
        userId: "system",
        market: symbol,
        price: parseFloat(priceStr),
        qty: parseFloat(qtyStr),
        type: "LIMIT" as const,
        side: "SELL" as const,
        filledQty: 0,
        status: "OPEN" as const,
        createdAt: new Date(),
      }));

      return [...localOrders, ...binanceBids, ...binanceAsks];
    } catch (err) {
      console.warn(`[PaperEngine] Failed to fetch Binance depth for ${symbol}:`, err);
      
      // Fallback to generating realistic order book depth based on PriceOracle's current price
      const currentPrice = this.oracle.getPrice(symbol) || 60000;
      
      const fallbackBids: Order[] = Array.from({ length: 50 }, (_, index) => {
        const step = 0.5 + Math.random() * 0.5;
        const price = currentPrice - 0.1 - index * step;
        const qty = 0.01 + Math.random() * 1.5;
        return {
          id: -10000 - index,
          userId: "system",
          market: symbol,
          price,
          qty,
          type: "LIMIT" as const,
          side: "BUY" as const,
          filledQty: 0,
          status: "OPEN" as const,
          createdAt: new Date(),
        };
      });

      const fallbackAsks: Order[] = Array.from({ length: 50 }, (_, index) => {
        const step = 0.5 + Math.random() * 0.5;
        const price = currentPrice + 0.1 + index * step;
        const qty = 0.01 + Math.random() * 1.5;
        return {
          id: -20000 - index,
          userId: "system",
          market: symbol,
          price,
          qty,
          type: "LIMIT" as const,
          side: "SELL" as const,
          filledQty: 0,
          status: "OPEN" as const,
          createdAt: new Date(),
        };
      });

      return [...localOrders, ...fallbackBids, ...fallbackAsks];
    }
  }

  cancelOrder(orderId: number): Order | null {
    return this.orderBook.removeLimitOrder(orderId);
  }

  // ─── Fill execution ──────────────────────────────────────────────────────

  private async fillOrder(order: Order, fillPrice: number): Promise<void> {
    console.log(
      `[PaperEngine] FILL: ${order.side} ${order.qty} ${order.market} @ $${fillPrice} (Order #${order.id})`,
    );

    try {
      const totalCost = order.qty * fillPrice;
      const currentBalance = await this.redis.hGet(
        "balances",
        order.userId,
      );
      let usdBalance = Number(currentBalance ?? 0);
      if (order.side === "BUY") {
        if (order.type === "MARKET") {
          usdBalance -= totalCost;
        }
      } else if (order.side === "SELL") {
        usdBalance += totalCost;
      }

      await this.redis.hSet(
        "balances",
        order.userId,
        usdBalance.toString(),
      );
      // 5. Update the balance in the PostgreSQL database
      await this.prisma.balance.update({
        where: { userId: order.userId },
        data: { usd: usdBalance },
      });

      console.log("USD Balance:", usdBalance);
      // 1. Create a Fill record in the database
      const fill = await this.prisma.fill.create({
        data: {
          qty: order.qty,
          side: order.side,
          type: order.type,
          userId: order.userId,
          price: fillPrice,
          asset: order.market,
          originalOrderId: order.id,
        },
      });

      // 2. Mark the original Order as FILLED
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: "FILLED", filledQty: order.qty },
      });

      // 3. Push a fill event to the fills queue for downstream consumers (capped at 100 items)
      await this.redis.lPush(
        "fills-to-persist",
        JSON.stringify({
          fillId: fill.id,
          orderId: order.id,
          userId: order.userId,
          market: order.market,
          side: order.side,
          qty: order.qty,
          price: fillPrice,
          filledAt: new Date().toISOString(),
        }),
      );
      await this.redis.lTrim("fills-to-persist", 0, 99);

      // 4. Update the Position Tracker and log the update
      const posResult = this.positionTracker.addFill(
        order.userId,
        order.market,
        order.side,
        order.qty,
        fillPrice,
      );
      console.log(
        `[PaperEngine] Position updated for User #${order.userId} (${order.market}): qty=${posResult.position?.qty ?? 0}, avgCost=${posResult.position?.avgCost ?? 0}, side=${posResult.position?.side ?? "NONE"}. Realized PnL: $${posResult.realizedPnL}`,
      );

      // If the position was fully closed, delete the PnL cache key in Redis
      if (posResult.position === null) {
        await this.redis.del(`pnl:${order.userId}:${order.market}`);
        console.log(`[PaperEngine] Deleted PnL cache key for User #${order.userId} (${order.market}) as position is closed.`);
      }
    } catch (err) {
      console.error(
        `[PaperEngine] fillOrder failed for Order #${order.id}:`,
        err,
      );
    }
  }
}
