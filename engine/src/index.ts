import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma and Redis Client
const prisma = new PrismaClient();
const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

/**
 * HYDRATION FUNCTION
 * Pulls all balances from PostgreSQL and caches them in a Redis Hash ("balances")
 */
async function hydrateBalancesToRedis() {
  console.log("Hydrating bal from postgress to redis for faster quening..");
  try {
    const dbBalances = await prisma.balance.findMany();

    // if the dbBalance is 0 then there is no one in db

    // Write all balances to the Redis Hash 'balances'
    for (const record of dbBalances) {
      // Redis stores strings, so we cast userId and usd to string
      await client.hSet(
        "balances",
        record.userId.toString(),
        record.usd.toString(),
      );
    }

    console.log(
      `Successfully cached ${dbBalances.length} user balances in Redis.`,
    );
  } catch (error) {
    console.error("Failed to hydrate balances from database:", error);
  }
}

// Run the hydration once only when starting the engine
await hydrateBalancesToRedis();

console.log("Matching Engine started, listening for messages...");

// 3. ENGINE PROCESSING LOOP
while (1) {
  const response = await client.brPop("backend-to-engine-broker", 1);
  if (!response) continue;

  try {
    const message = JSON.parse(response.element);

    const userId = message.data.userId;
    const price = Number(message.data.price);
    const quantity = Number(message.data.quantity);
    const responseQueue = message.responseQueue;
    const correlationId = message.correlationId;

    const totalPriceOfOrder = price * quantity;

    // RETRIEVE CURRENT CACHED BALANCE FROM REDIS
    const cachedBalanceStr = await client.hGet("balances", userId.toString());
    const userBalance = cachedBalanceStr ? Number(cachedBalanceStr) : 0;

    // CHECK BALANCE
    if (userBalance < totalPriceOfOrder) {
      console.log(
        `Order rejected: Insufficient funds for User ${userId}. Cost: $${totalPriceOfOrder}`,
      );

      await client.lPush(
        responseQueue,
        JSON.stringify({
          correlationId,
          ok: false,
          error: "INSUFFICIENT_FUNDS",
        }),
      );
      continue;
    }

    // DEDUCT AND UPDATE CACHED BALANCE IN REDIS AND IN DATABASE
    const newBalance = userBalance - totalPriceOfOrder;
    await client.hSet("balances", userId.toString(), newBalance.toString());
    await prisma.balance.update({
      where: {
        userId: userId,
      },
      data: {
        usd: newBalance,
      },
    });
    console.log(`New cached balance for User ${userId}: $${newBalance}`);

    await client.lPush(
      `order-history:${userId}`,
      JSON.stringify({
        userId,
        price,
        quantity,
        status: "OPEN",
        createdAt: new Date().toISOString(),
      }),
    );
    // RESPOND TO BACKEND
    await client.lPush(
      responseQueue,
      JSON.stringify({
        correlationId,
        ok: true,
        data: {
          message: "Order placed, funds locked",
          remainingBalance: newBalance,
        },
      }),
    );
  } catch (error) {
    console.error("Error processing order balance check:", error);
  }
}
