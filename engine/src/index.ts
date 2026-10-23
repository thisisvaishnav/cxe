import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "redis";
import "dotenv/config";
import pg from "pg";
import { PriceOracle } from "./PriceOracle";
import { PaperEngine } from "./PaperEngine";

// ─── Database and Redis Connection ───────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});
const client = await createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

// ─── Hydrate balances from PostgreSQL → Redis on startup ─────────────────────
async function hydrateBalancesToRedis() {
  console.log("Hydrating balances from Postgres → Redis...");
  try {
    const dbBalances = await prisma.balance.findMany();
    for (const record of dbBalances) {
      await client.hSet(
        "balances",
        record.userId,
        record.usd.toString()
      );
    }
    console.log(`Cached ${dbBalances.length} user balances in Redis.`);
  } catch (error) {
    console.error("Failed to hydrate balances:", error);
  }
}

await hydrateBalancesToRedis();

// ─── Boot PriceOracle + PaperEngine ──────────────────────────────────────────
const oracle = new PriceOracle(client);
const engine = new PaperEngine(client, prisma, oracle);

async function hydratePositionsFromFills() {
  console.log("Hydrating positions by replaying database fills...");
  try {
    const dbFills = await prisma.fill.findMany({
      orderBy: { id: "asc" },
    });
    const tracker = engine.getPositionTracker();
    for (const record of dbFills) {
      tracker.addFill(
        record.userId,
        record.asset,
        record.side,
        record.qty,
        record.price ?? 0
      );
    }
    console.log(`Hydrated positions from ${dbFills.length} fills.`);
  } catch (error) {
    console.error("Failed to hydrate positions:", error);
  }
}

await hydratePositionsFromFills();

// Hydrate order book from DB on startup
async function hydrateOrderBook() {
  console.log("Hydrating OrderBook from Postgres...");
  try {
    const openOrders = await prisma.order.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
    });
    for (const order of openOrders) {
      if (order.type === "LIMIT") {
        engine.processOrder(order);
      }
    }
    console.log(`Hydrated ${openOrders.length} OPEN orders into OrderBook.`);
  } catch (error) {
    console.error("Failed to hydrate OrderBook:", error);
  }
}

await hydrateOrderBook();

// ─── Background task: persist fills from Redis queue to DB ───────────────────
async function runFillPersistenceWorker() {
  const fillPersistenceClient = client.duplicate();
  await fillPersistenceClient.connect();

  console.log("Started Fill Persistence Worker, listening on fills-to-persist...");

  while (true) {
    try {
      const fillJob = await fillPersistenceClient.brPop("fills-to-persist", 0);
      if (fillJob) {
        const fillData = JSON.parse(fillJob.element);
        console.log("[fill-persistence-worker] Received fill event:", fillData);
      }
    } catch (err) {
      console.error("[fill-persistence-worker] Error in loop:", err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

runFillPersistenceWorker().catch((err) =>
  console.error("Fill Persistence Worker failed to start:", err)
);

console.log("CXE Matching Engine listening on backend-to-engine-broker...");

while (true) {
  try {
    const orderJob = await client.brPop("backend-to-engine-broker", 1);
    if (!orderJob) continue;

    const data = JSON.parse(orderJob.element);
    console.log("Received data from broker:", data);

    const { correlationId, responseQueue, type, payload } = data;

    // FIX #1: Support both top-level `type` and nested `payload.type` for command routing
    const commandType = type ?? payload?.type;

    // ── create_order ─────────────────────────────────────────────────────────
    if (commandType === "create_order") {
      // FIX #2: Normalize lowercase ("limit"/"buy") → Prisma uppercase enums
      const orderType = (payload.type as string).toUpperCase() as
        | "MARKET"
        | "LIMIT";
      const orderSide = (payload.side as string).toUpperCase() as
        | "BUY"
        | "SELL";
      const userId = String(payload.userId);
      const symbol = payload.symbol as string;
      const qty = Number(payload.qty);
      const price =
        payload.price != null ? Number(payload.price) : null;

      // Balance check — for LIMIT BUY and MARKET BUY
      if (orderSide === "BUY") {
        let totalCost = 0;
        if (orderType === "LIMIT") {
          totalCost = price! * qty;
        } else {
          // MARKET order
          const currentPrice = oracle.getPrice(symbol);
          if (currentPrice === undefined) {
            console.log(`Order rejected: No price oracle feed available for ${symbol} to execute MARKET order.`);
            await client.lPush(
              responseQueue,
              JSON.stringify({ correlationId, ok: false, error: "NO_PRICE_AVAILABLE" })
            );
            continue;
          }
          totalCost = currentPrice * qty;
        }

        const cachedBalanceStr = await client.hGet(
          "balances",
          userId
        );
        let userBalance: number;
        if (cachedBalanceStr) {
          userBalance = Number(cachedBalanceStr);
        } else {
          const dbBalance = await prisma.balance.findUnique({
            where: { userId }
          });
          userBalance = dbBalance ? dbBalance.usd : 0;
          await client.hSet("balances", userId, userBalance.toString());
        }

        if (userBalance < totalCost) {
          console.log(
            `Order rejected: Insufficient funds for User ${userId}. Cost: $${totalCost}, Balance: $${userBalance}`
          );
          await client.lPush(
            responseQueue,
            JSON.stringify({ correlationId, ok: false, error: "INSUFFICIENT_FUNDS" })
          );
          continue;
        }

        // Lock funds: deduct from Redis cache and persist to DB (only for LIMIT orders)
        if (orderType === "LIMIT") {
          const newBalance = userBalance - totalCost;
          await client.hSet(
            "balances",
            userId,
            newBalance.toString()
          );
          await prisma.balance.update({
            where: { userId },
            data: { usd: newBalance },
          });
          console.log(
            `Locked $${totalCost} for User ${userId}. Remaining: $${newBalance}`
          );
        }
      }

      // Create the order record in the database
      const newOrder = await prisma.order.create({
        data: {
          userId,
          market: symbol,
          price,
          qty,
          type: orderType,
          side: orderSide,
          status: "OPEN",
        },
      });

      // Hand off to PaperEngine (fills immediately or rests in OrderBook)
      await engine.processOrder(newOrder);

      await client.lPush(
        responseQueue,
        JSON.stringify({
          correlationId,
          ok: true,
          data: { message: "Order accepted", orderId: newOrder.id },
        })
      );

    // ── get_user_balance ─────────────────────────────────────────────────────
    } else if (commandType === "get_user_balance") {
      const userId = String(payload.userId);
      const cachedBalanceStr = await client.hGet("balances", userId);
      let balance: number;
      if (cachedBalanceStr) {
        balance = Number(cachedBalanceStr);
      } else {
        const dbBalance = await prisma.balance.findUnique({
          where: { userId }
        });
        balance = dbBalance ? dbBalance.usd : 0;
        await client.hSet("balances", userId, balance.toString());
      }

      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: true, data: { balance } })
      );

    // ── deposit ──────────────────────────────────────────────────────────────
    } else if (commandType === "deposit") {
      const userId = String(payload.userId);
      const amount = Number(payload.amount);

      const cachedBalanceStr = await client.hGet("balances", userId);
      let balance: number;
      if (cachedBalanceStr) {
        balance = Number(cachedBalanceStr);
      } else {
        const dbBalance = await prisma.balance.findUnique({
          where: { userId }
        });
        balance = dbBalance ? dbBalance.usd : 0;
      }
      
      const newBalance = balance + amount;
      await client.hSet("balances", userId, newBalance.toString());
      await prisma.balance.upsert({
        where: { userId },
        create: { userId, usd: newBalance },
        update: { usd: newBalance },
      });

      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: true, data: { balance: newBalance } })
      );

    // ── get_positions ────────────────────────────────────────────────────────
    } else if (commandType === "get_positions") {
      const userId = String(payload.userId);
      const positions = engine.getPositions(userId);

      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: true, data: { positions } })
      );

    // ── get_order ────────────────────────────────────────────────────────────
    } else if (commandType === "get_order") {
      const userId = String(payload.userId);
      const orderId = Number(payload.orderId);

      const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
      });

      await client.lPush(
        responseQueue,
        JSON.stringify(
          order
            ? { correlationId, ok: true, data: order }
            : { correlationId, ok: false, error: "ORDER_NOT_FOUND" }
        )
      );

    // ── cancel_order ─────────────────────────────────────────────────────────
    } else if (commandType === "cancel_order") {
      const userId = String(payload.userId);
      const orderId = Number(payload.orderId);

      // Find the order first to ensure it exists and is OPEN
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
      });

      if (!order || order.status !== "OPEN") {
        await client.lPush(
          responseQueue,
          JSON.stringify({
            correlationId,
            ok: false,
            error: "ORDER_NOT_FOUND_OR_ALREADY_FILLED",
          })
        );
        continue;
      }

      // Remove from in-memory OrderBook (if it's still resting)
      engine.cancelOrder(orderId);

      // Mark as CANCELLED in the database
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // If it was a BUY LIMIT order, refund the locked funds
      if (order.side === "BUY" && order.type === "LIMIT") {
        const refundAmount = order.price! * order.qty;
        const cachedBalanceStr = await client.hGet(
          "balances",
          userId
        );
        const userBalance = cachedBalanceStr ? Number(cachedBalanceStr) : 0;
        const newBalance = userBalance + refundAmount;

        await client.hSet(
          "balances",
          userId,
          newBalance.toString()
        );
        await prisma.balance.update({
          where: { userId },
          data: { usd: newBalance },
        });

        console.log(
          `[index] Refunded $${refundAmount} to User ${userId} for cancelled LIMIT BUY Order #${orderId}. New balance: $${newBalance}`
        );
      }

      await client.lPush(
        responseQueue,
        JSON.stringify({
          correlationId,
          ok: true,
          data: { message: "Order cancelled" },
        })
      );

    // ── get_depth ────────────────────────────────────────────────────────────
    } else if (commandType === "get_depth") {
      const symbol = payload.symbol as string;
      const orders = await engine.getDepth(symbol);

      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: true, data: { orders } })
      );

    // ── unknown command ──────────────────────────────────────────────────────
    } else {
      console.warn("Unknown command received:", commandType);
      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: false, error: "UNKNOWN_COMMAND" })
      );
    }
  } catch (err) {
    console.error("Error in engine loop:", err);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
