import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import { PriceOracle } from "./PriceOracle";
import { PaperEngine } from "./PaperEngine";

// ─── Initialize clients ───────────────────────────────────────────────────────
const prisma = new PrismaClient();
const client = await createClient()
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
        record.userId.toString(),
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

oracle.on("tick", (symbol: string, price: number) => {
  console.log(`[tick] ${symbol} → $${price}`);
});

oracle.connect("BTCUSDT");

// ─── Graceful shutdown ────────────────────────────────────────────────────────
function shutdown() {
  console.log("Shutting down...");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Engine started — listening for messages...");

// ─── Main processing loop ─────────────────────────────────────────────────────
while (true) {
  const response = await client.brPop("backend-to-engine-broker", 1);
  if (!response) continue;

  let correlationId = "";
  let responseQueue = "";

  try {
    const message = JSON.parse(response.element);

    // FIX #1: Backend wraps data in "payload", not "data"
    const { type: commandType, payload } = message;
    correlationId = message.correlationId;
    responseQueue = message.responseQueue;

    // ── create_order ──────────────────────────────────────────────────────────
    if (commandType === "create_order") {
      // FIX #2: Normalize lowercase ("limit"/"buy") → Prisma uppercase enums
      const orderType = (payload.type as string).toUpperCase() as
        | "MARKET"
        | "LIMIT";
      const orderSide = (payload.side as string).toUpperCase() as
        | "BUY"
        | "SELL";
      const userId = Number(payload.userId);
      const symbol = payload.symbol as string;
      // FIX #3: field is "qty" not "quantity"
      const qty = Number(payload.qty);
      const price =
        payload.price != null ? Number(payload.price) : null;

      // Balance check — only for LIMIT BUY (we know the cost upfront)
      if (orderSide === "BUY" && orderType === "LIMIT") {
        const totalCost = price! * qty;
        const cachedBalanceStr = await client.hGet(
          "balances",
          userId.toString()
        );
        const userBalance = cachedBalanceStr ? Number(cachedBalanceStr) : 0;

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

        // Lock funds: deduct from Redis cache and persist to DB
        const newBalance = userBalance - totalCost;
        await client.hSet(
          "balances",
          userId.toString(),
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

    // ── get_user_balance ──────────────────────────────────────────────────────
    } else if (commandType === "get_user_balance") {
      const userId = Number(payload.userId);
      const cachedBalanceStr = await client.hGet("balances", userId.toString());
      const balance = cachedBalanceStr ? Number(cachedBalanceStr) : 0;

      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: true, data: { balance } })
      );

    // ── get_order ─────────────────────────────────────────────────────────────
    } else if (commandType === "get_order") {
      const userId = Number(payload.userId);
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

    // ── cancel_order ──────────────────────────────────────────────────────────
    } else if (commandType === "cancel_order") {
      const userId = Number(payload.userId);
      const orderId = Number(payload.orderId);

      // Remove from in-memory OrderBook (if it's still resting)
      engine.cancelOrder(orderId);

      // Mark as CANCELLED in the database
      const result = await prisma.order.updateMany({
        where: { id: orderId, userId, status: "OPEN" },
        data: { status: "CANCELLED" },
      });

      await client.lPush(
        responseQueue,
        JSON.stringify(
          result.count > 0
            ? { correlationId, ok: true, data: { message: "Order cancelled" } }
            : { correlationId, ok: false, error: "ORDER_NOT_FOUND_OR_ALREADY_FILLED" }
        )
      );

    // ── get_depth ─────────────────────────────────────────────────────────────
    } else if (commandType === "get_depth") {
      const symbol = payload.symbol as string;
      const orders = engine.getDepth(symbol);

      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: true, data: { orders } })
      );

    // ── unknown command ───────────────────────────────────────────────────────
    } else {
      await client.lPush(
        responseQueue,
        JSON.stringify({
          correlationId,
          ok: false,
          error: `UNKNOWN_COMMAND: ${commandType}`,
        })
      );
    }
  } catch (error) {
    console.error("Error processing message:", error);
    // Always send a response so the backend doesn't hang waiting
    if (responseQueue && correlationId) {
      await client.lPush(
        responseQueue,
        JSON.stringify({ correlationId, ok: false, error: "INTERNAL_ENGINE_ERROR" })
      ).catch(() => {});
    }
  }
}
