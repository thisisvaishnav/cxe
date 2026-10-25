import { createClient } from "redis";
import { env } from "./env.js";
import { prisma } from "../db.js";
import {
  resolveEngineResponse,
  waitForEngineResponse,
} from "../store/pending-responses.js";
import type {
  EngineCommandType,
  EngineRequest,
  EngineResponse,
} from "../types/engine.js";

type RedisClient = ReturnType<typeof createClient>;

let publisher: RedisClient | null = null;
let subscriber: RedisClient | null = null;
let redisAvailable = false;

if (env.redisUrl) {
  try {
    publisher = createClient({ url: env.redisUrl }).on("error", (error) => {
      console.warn("[Redis] Publisher error:", error?.message || error);
      redisAvailable = false;
    });

    subscriber = createClient({ url: env.redisUrl }).on("error", (error) => {
      console.warn("[Redis] Subscriber error:", error?.message || error);
      redisAvailable = false;
    });
  } catch (err) {
    console.warn("[Redis] Initialization skipped:", err);
  }
}

export async function connectRedis(): Promise<void> {
  if (!publisher || !subscriber) {
    console.log("[EngineClient] No REDIS_URL provided; running in direct serverless mode.");
    redisAvailable = false;
    return;
  }
  try {
    await Promise.all([publisher.connect(), subscriber.connect()]);
    redisAvailable = true;
    console.log("[EngineClient] Connected to Redis successfully.");
  } catch (err) {
    console.warn("[EngineClient] Redis connection failed, falling back to direct serverless mode:", (err as Error).message);
    redisAvailable = false;
  }
}

export async function pingRedis(): Promise<string> {
  if (redisAvailable && publisher) {
    return publisher.ping();
  }
  return "PONG (serverless-direct)";
}

export async function updateRedisBalance(userId: string, amount: number): Promise<void> {
  if (redisAvailable && publisher) {
    await publisher.hSet("balances", userId, amount.toString());
  }
  await prisma.balance.upsert({
    where: { userId },
    update: { usd: amount },
    create: { userId, usd: amount },
  });
}

// Direct serverless execution of engine commands
async function executeDirect(
  type: EngineCommandType,
  payload: Record<string, unknown>,
  correlationId: string = crypto.randomUUID()
): Promise<EngineResponse> {
  try {
    const userId = payload.userId ? String(payload.userId) : "";

    switch (type) {
      case "get_user_balance": {
        let userBalance = await prisma.balance.findUnique({ where: { userId } });
        if (!userBalance) {
          userBalance = await prisma.balance.create({
            data: { userId, usd: 50000 },
          });
        }
        return { correlationId, ok: true, data: { balance: userBalance.usd } };
      }

      case "deposit": {
        const amount = Number(payload.amount);
        const updated = await prisma.balance.upsert({
          where: { userId },
          update: { usd: { increment: amount } },
          create: { userId, usd: amount + 50000 },
        });
        return { correlationId, ok: true, data: { balance: updated.usd } };
      }

      case "get_positions": {
        const fills = await prisma.fill.findMany({
          where: { userId },
          orderBy: { id: "asc" },
        });

        const positionsMap = new Map<
          string,
          { qty: number; totalCost: number; side: "LONG" | "SHORT" }
        >();

        for (const fill of fills) {
          const current = positionsMap.get(fill.asset) || {
            qty: 0,
            totalCost: 0,
            side: "LONG" as const,
          };
          const fillQty = fill.side === "BUY" ? fill.qty : -fill.qty;
          const newQty = current.qty + fillQty;
          const price = fill.price ?? 0;
          if (newQty === 0) {
            positionsMap.delete(fill.asset);
          } else {
            const costChange =
              fill.side === "BUY" ? fill.qty * price : -fill.qty * price;
            positionsMap.set(fill.asset, {
              qty: newQty,
              totalCost: Math.max(0, current.totalCost + costChange),
              side: newQty >= 0 ? "LONG" : "SHORT",
            });
          }
        }

        const positions = Array.from(positionsMap.entries()).map(
          ([symbol, pos]) => ({
            symbol,
            qty: pos.qty,
            avgCost: pos.qty !== 0 ? Math.abs(pos.totalCost / pos.qty) : 0,
            side: pos.side,
          })
        );

        return { correlationId, ok: true, data: { positions } };
      }

      case "get_depth": {
        const symbol = String(payload.symbol || "BTCUSDT");
        const openOrders = await prisma.order.findMany({
          where: { market: symbol, status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        return { correlationId, ok: true, data: { orders: openOrders } };
      }

      case "get_order": {
        const orderId = Number(payload.orderId);
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
          return { correlationId, ok: false, error: "Order not found" };
        }
        return { correlationId, ok: true, data: order };
      }

      case "cancel_order": {
        const orderId = Number(payload.orderId);
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.status !== "OPEN") {
          return { correlationId, ok: false, error: "Order not found or not open" };
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });

        if (order.side === "BUY" && order.price) {
          const refund = (order.qty - order.filledQty) * order.price;
          await prisma.balance.update({
            where: { userId: order.userId },
            data: { usd: { increment: refund } },
          });
        }
        return {
          correlationId,
          ok: true,
          data: { message: "Order cancelled successfully", orderId },
        };
      }

      case "create_order": {
        const orderType = (payload.type as string).toUpperCase() as
          | "MARKET"
          | "LIMIT";
        const orderSide = (payload.side as string).toUpperCase() as
          | "BUY"
          | "SELL";
        const symbol = String(payload.symbol || "BTCUSDT");
        const qty = Number(payload.qty);
        let price = payload.price != null ? Number(payload.price) : null;

        // Fetch live market price from Binance REST or default fallback
        let currentMarketPrice = price ?? 65000;
        try {
          const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          const tickerRes = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`
          );
          if (tickerRes.ok) {
            const tickerData = (await tickerRes.json()) as { price: string };
            currentMarketPrice = parseFloat(tickerData.price);
          }
        } catch {
          // ignore network failure
        }

        const execPrice =
          orderType === "MARKET" ? currentMarketPrice : (price ?? currentMarketPrice);
        const totalCost = execPrice * qty;

        // Check user balance
        let userBalance = await prisma.balance.findUnique({ where: { userId } });
        if (!userBalance) {
          userBalance = await prisma.balance.create({
            data: { userId, usd: 50000 },
          });
        }

        if (orderSide === "BUY" && userBalance.usd < totalCost) {
          return { correlationId, ok: false, error: "INSUFFICIENT_FUNDS" };
        }

        const shouldFillImmediately =
          orderType === "MARKET" ||
          (orderType === "LIMIT" &&
            ((orderSide === "BUY" && price! >= currentMarketPrice) ||
              (orderSide === "SELL" && price! <= currentMarketPrice)));

        const order = await prisma.order.create({
          data: {
            userId,
            market: symbol,
            price,
            qty,
            type: orderType,
            side: orderSide,
            filledQty: shouldFillImmediately ? qty : 0,
            status: shouldFillImmediately ? "FILLED" : "OPEN",
          },
        });

        if (shouldFillImmediately) {
          await prisma.fill.create({
            data: {
              userId,
              asset: symbol,
              qty,
              price: execPrice,
              side: orderSide,
              type: orderType,
              originalOrderId: order.id,
            },
          });

          const balanceDelta = orderSide === "BUY" ? -totalCost : totalCost;
          await prisma.balance.update({
            where: { userId },
            data: { usd: { increment: balanceDelta } },
          });

          return {
            correlationId,
            ok: true,
            data: {
              message: "Order executed successfully",
              orderId: order.id,
              status: "FILLED",
              executedPrice: execPrice,
              executedQty: qty,
            },
          };
        }

        // Limit order stays open; lock buying power if BUY
        if (orderSide === "BUY") {
          await prisma.balance.update({
            where: { userId },
            data: { usd: { decrement: totalCost } },
          });
        }

        return {
          correlationId,
          ok: true,
          data: {
            message: "Limit order placed successfully",
            orderId: order.id,
            status: "OPEN",
          },
        };
      }

      default:
        return { correlationId, ok: false, error: `Unsupported command: ${type}` };
    }
  } catch (error) {
    console.error(`[EngineClient] Error in executeDirect (${type}):`, error);
    return {
      correlationId,
      ok: false,
      error: error instanceof Error ? error.message : "server_error",
    };
  }
}

export async function sendToEngine(
  type: EngineCommandType,
  payload: Record<string, unknown>
): Promise<EngineResponse> {
  // If Redis is active, attempt to dispatch through the queue
  if (redisAvailable && publisher) {
    try {
      const correlationId = crypto.randomUUID();
      const responsePromise = waitForEngineResponse(
        correlationId,
        env.engineTimeoutMs
      );

      const message: EngineRequest = {
        correlationId,
        responseQueue: env.responseQueue,
        type,
        payload,
      };

      await publisher.lPush(env.incomingQueue, JSON.stringify(message));
      return await responsePromise;
    } catch (err) {
      console.warn(
        `[EngineClient] Failed to dispatch via Redis queue, falling back to direct execution:`,
        (err as Error).message
      );
    }
  }

  // Fallback / Serverless direct execution
  return executeDirect(type, payload);
}

export async function listenForEngineResponses(): Promise<void> {
  if (!redisAvailable || !subscriber) {
    return;
  }
  console.log(`Listening for engine responses on ${env.responseQueue}`);

  while (redisAvailable) {
    try {
      const response = await subscriber.brPop(env.responseQueue, 0);
      if (!response) continue;

      const parsedResponse = JSON.parse(response.element) as EngineResponse;
      resolveEngineResponse(parsedResponse);
    } catch (error) {
      if (!redisAvailable) break;
      console.error("Invalid engine response", error);
    }
  }
}
