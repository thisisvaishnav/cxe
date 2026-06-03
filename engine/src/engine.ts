// Engine.ts
import { createClient } from "redis";
// Import your dummy database and orderbook classes
import { db } from "./db";
import { OrderBook } from "./OrderBook";
import type { EngineMessage, UserBalance } from "./types";

export class Engine {
  // 1. In-Memory State
  private balances: Map<string, Map<string, UserBalance>> = new Map(); // Map<UserId, Map<Asset, Balance>>
  private orderBooks: Map<string, OrderBook> = new Map(); // Map<Market, OrderBook>

  // 2. Redis Clients
  private redisClient = createClient(); // For popping from the queue
  private redisPublisher = createClient(); // For sending responses/pub-sub

  constructor() {
    // Initialize order books for your supported markets
    this.orderBooks.set("BTC_USDT", new OrderBook("BTC_USDT"));
    this.orderBooks.set("ETH_USDT", new OrderBook("ETH_USDT"));
  }

  // --- PHASE 1: HYDRATION ---
  async init() {
    await this.redisClient.connect();
    await this.redisPublisher.connect();

    console.log("Hydrating engine state from database...");

    // This is the ONLY time the engine awaits the database!
    const dbBalances = await db.getAllBalances();
    const dbActiveOrders = await db.getActiveOrders();

    // Load database rows into the fast in-memory Maps
    this.loadBalancesIntoMemory(dbBalances);
    this.loadOrdersIntoMemory(dbActiveOrders);

    console.log("Hydration complete. Engine is live.");

    // Start the infinite processing loop
    this.startQueueListener();
  }
  private loadBalancesIntoMemory(dbBalances: any[]) {
    for (const row of dbBalances) {
      // 1. Check if the user already has a Map in our memory
      if (!this.balances.has(row.userId)) {
        // If not, create a fresh Map for their assets
        this.balances.set(row.userId, new Map());
      }

      // 2. Retrieve that user's Map
      const userBalances = this.balances.get(row.userId)!;

      // 3. Insert the specific asset (e.g., 'USDT' or 'BTC') and its values
      // We convert to Number() just in case the database driver returns strings for decimals
      userBalances.set(row.asset, {
        available: Number(row.available),
        locked: Number(row.locked),
      });
    }

    console.log(`Loaded balances for ${this.balances.size} users into RAM.`);
  }

  private loadOrdersIntoMemory(dbActiveOrders: any[]) {
    // Reconstruct the active order books from the database
    for (const order of dbActiveOrders) {
      const orderBook = this.orderBooks.get(order.market);
      if (orderBook) {
        orderBook.restoreOrder(order);
      }
    }
    console.log(`Loaded ${dbActiveOrders.length} active orders into RAM.`);
  }

  // --- PHASE 2: THE QUEUE LISTENER ---
  private async startQueueListener() {
    while (true) {
      try {
        // BRPOP blocks until a message arrives in 'backend-to-engine-broker'
        // It takes messages out in strict sequence (FIFO)
        const result = await this.redisClient.brPop(
          "backend-to-engine-broker",
          0,
        );

        if (result) {
          const message: EngineMessage = JSON.parse(result.element);
          // Pass the message to the synchronous router
          this.processMessage(message);
        }
      } catch (error) {
        console.error("Critical Queue Error:", error);
        // In production, add logic to handle/re-queue failed messages
      }
    }
  }

  // --- PHASE 3: THE ROUTER ---
  private processMessage(message: EngineMessage) {
    // Notice there is NO 'await' in this function.
    // Everything from here down is purely synchronous RAM manipulation.

    switch (message.type) {
      case "PLACE_ORDER":
        this.handlePlaceOrder(message);
        break;
      case "CANCEL_ORDER":
        this.handleCancelOrder(message);
        break;
      case "DEPOSIT":
        this.handleDeposit(message);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  private handlePlaceOrder(message: EngineMessage) {
    const payload = message.payload;
    const baseAsset = payload.market.split("_")[0]; // e.g., BTC
    const quoteAsset = payload.market.split("_")[1]; // e.g., USDT

    // 1. Identify which asset to check based on order side
    // If buying BTC with USDT, we need to check USDT balance.
    // If selling BTC for USDT, we need to check BTC balance.
    const assetToCheck = payload.side === "BUY" ? quoteAsset : baseAsset;
    const requiredAmount =
      payload.side === "BUY"
        ? payload.price * payload.quantity
        : payload.quantity;

    // 2. Fast RAM Balance Check
    const userBalances = this.balances.get(payload.userId) || new Map();
    const specificBalance = userBalances.get(assetToCheck) || {
      available: 0,
      locked: 0,
    };

    if (specificBalance.available < requiredAmount) {
      // Reject instantly via Redis
      this.sendResponse(message.replyTo, message.correlationId, {
        status: "REJECTED",
        reason: "Insufficient funds",
      });
      return;
    }

    // 3. Lock the funds in RAM
    specificBalance.available -= requiredAmount;
    specificBalance.locked += requiredAmount;
    userBalances.set(assetToCheck, specificBalance);
    this.balances.set(payload.userId, userBalances);

    // 4. Pass to the Order Book for matching
    const orderBook = this.orderBooks.get(payload.market);
    if (orderBook) {
      // The order book will return the match results (trades executed, etc.)
      const matchResult = orderBook.addOrder(payload);

      // 5. Send success response to the backend
      this.sendResponse(message.replyTo, message.correlationId, {
        status: "SUCCESS",
        data: matchResult,
      });

      // 6. Broadcast public trades to WebSockets
      if (matchResult.trades.length > 0) {
        this.redisPublisher.publish(
          "PUBLIC_TRADES",
          JSON.stringify(matchResult.trades),
        );
      }
    }
  }

  private handleCancelOrder(message: EngineMessage) {
    const { orderId, market, userId } = message.payload;

    const orderBook = this.orderBooks.get(market);
    if (!orderBook) {
      this.sendResponse(message.replyTo, message.correlationId, {
        status: "REJECTED",
        reason: "Market does not exist",
      });
      return;
    }

    // 1. Remove the order from the order book
    const cancelledOrder = orderBook.cancelOrder(orderId);

    if (!cancelledOrder) {
      this.sendResponse(message.replyTo, message.correlationId, {
        status: "REJECTED",
        reason: "Order not found or already filled",
      });
      return;
    }

    // 2. Security Check: Ensure the user cancelling it actually owns it
    if (cancelledOrder.userId !== userId) {
      this.sendResponse(message.replyTo, message.correlationId, {
        status: "REJECTED",
        reason: "Unauthorized",
      });
      return;
    }

    // 3. Calculate the Refund Amount
    const remainingQuantity = cancelledOrder.quantity - cancelledOrder.filled;

    const baseAsset = market.split("_")[0];
    const quoteAsset = market.split("_")[1];

    const assetToRefund =
      cancelledOrder.side === "BUY" ? quoteAsset : baseAsset;
    const refundAmount =
      cancelledOrder.side === "BUY"
        ? remainingQuantity * cancelledOrder.price
        : remainingQuantity;

    // 4. Update the RAM Balance
    const userBalances = this.balances.get(userId);
    if (userBalances) {
      const specificBalance = userBalances.get(assetToRefund);
      if (specificBalance) {
        specificBalance.locked -= refundAmount;
        specificBalance.available += refundAmount;
      }
    }

    // 5. Send Success Response to the Backend
    this.sendResponse(message.replyTo, message.correlationId, {
      status: "SUCCESS",
      data: {
        cancelledOrderId: orderId,
        refundedAsset: assetToRefund,
        refundedAmount: refundAmount,
      },
    });

    // 6. Broadcast the update to WebSockets
    this.redisPublisher.publish(
      "ORDER_BOOK_UPDATE",
      JSON.stringify({
        type: "CANCEL",
        market: market,
        orderId: orderId,
      })
    );
  }

  private handleDeposit(message: EngineMessage) {
    const { userId, asset, amount } = message.payload;

    let userBalances = this.balances.get(userId);
    if (!userBalances) {
      userBalances = new Map();
      this.balances.set(userId, userBalances);
    }

    const specificBalance = userBalances.get(asset) || { available: 0, locked: 0 };
    specificBalance.available += amount;
    userBalances.set(asset, specificBalance);

    this.sendResponse(message.replyTo, message.correlationId, {
      status: "SUCCESS",
      data: { userId, asset, newBalance: specificBalance.available },
    });
  }

  private sendResponse(queue: string, correlationId: string, data: any) {
    const response = JSON.stringify({ correlationId, ...data });
    // Push the result back to the specific backend instance that requested it
    this.redisPublisher.lPush(queue, response);
  }
}
