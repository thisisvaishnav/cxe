import type { PrismaClient, Order } from "@prisma/client";
import type { createClient } from "redis";
import { OrderBook } from "./OrderBook";
import { PriceOracle } from "./PriceOracle";

type RedisClient = ReturnType<typeof createClient>;

export class PaperEngine {
  private orderBook: OrderBook;

  constructor(
    private readonly redis: RedisClient,
    private readonly prisma: PrismaClient,
    private readonly oracle: PriceOracle
  ) {
    this.orderBook = new OrderBook();

    // TRIGGER 2: React to every Binance price tick
    this.oracle.on("tick", (symbol: string, price: number) => {
      this.onTick(symbol, price).catch((err) =>
        console.error("[PaperEngine] onTick error:", err)
      );
    });
  }

  // ─── TRIGGER 1: Called from the brPop loop in index.ts ───────────────────

  async processOrder(order: Order): Promise<void> {
    if (order.type === "MARKET") {
      const currentPrice = this.oracle.getPrice(order.market);

      if (currentPrice === undefined) {
        console.error(
          `[PaperEngine] No price yet for ${order.market} — cannot fill MARKET order #${order.id}`
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
        // Fill at the limit price (not worse than what they asked)
        await this.fillOrder(order, order.price!);
      } else {
        // Rest in the order book and wait for the next tick
        this.orderBook.addLimitOrder(order);
        console.log(
          `[PaperEngine] Resting LIMIT ${order.side} ${order.qty} ${order.market} @ $${order.price} (Order #${order.id})`
        );
      }
    }
  }

  // ─── Cancel a resting order (removes from in-memory book) ────────────────

  cancelOrder(orderId: number): boolean {
    const removed = this.orderBook.removeLimitOrder(orderId);
    if (removed) {
      console.log(`[PaperEngine] Cancelled Order #${orderId} from OrderBook`);
    }
    return removed !== null;
  }

  // ─── Get resting orders for a symbol (for depth view) ────────────────────

  getDepth(symbol: string): Order[] {
    return this.orderBook.getOrdersForSymbol(symbol);
  }

  // ─── TRIGGER 2: Fires on every Binance price tick ────────────────────────

  private async onTick(symbol: string, price: number): Promise<void> {
    const restingOrders = this.orderBook.getOrdersForSymbol(symbol);
    if (restingOrders.length === 0) return;

    for (const order of restingOrders) {
      const shouldFill =
        (order.side === "BUY" && price <= order.price!) ||
        (order.side === "SELL" && price >= order.price!);

      if (shouldFill) {
        // Remove from book FIRST to prevent double-fills on rapid ticks
        this.orderBook.removeLimitOrder(order.id);
        // Fill at the limit price (not the tick price)
        await this.fillOrder(order, order.price!);
      }
    }
  }

  // ─── Shared fill logic ───────────────────────────────────────────────────

  private async fillOrder(order: Order, fillPrice: number): Promise<void> {
    console.log(
      `[PaperEngine] FILL: ${order.side} ${order.qty} ${order.market} @ $${fillPrice} (Order #${order.id})`
    );

    try {
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

      // 3. Push a fill event to the fills queue for downstream consumers
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
        })
      );
    } catch (err) {
      console.error(
        `[PaperEngine] fillOrder failed for Order #${order.id}:`,
        err
      );
    }
  }
}
