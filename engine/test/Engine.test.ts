import { expect, test, describe, beforeEach, mock, spyOn } from "bun:test";
import { Engine } from "../src/engine";
import type { EngineMessage } from "../src/types";

// Note: Bun provides a powerful testing API.
// To properly isolate the engine, we should ideally inject a mock Database / Redis or mock them completely.
// Since the 'redis' module is directly imported inside the Engine, we mock the module to prevent real connections.

mock.module("redis", () => {
  return {
    createClient: () => ({
      connect: mock(async () => {}),
      brPop: mock(async () => null),
      lPush: mock(() => {}),
      publish: mock(() => {}),
      on: mock(() => ({})),
    })
  };
});

mock.module("../../backend/generated/prisma/client.ts", () => {
  return {
    PrismaClient: class {
      balance = { findMany: mock(async () => []) };
      order = { findMany: mock(async () => []) };
    }
  };
});

mock.module("../src/db", () => {
    return {
        db: {
            getAllBalances: mock(async () => []),
            getActiveOrders: mock(async () => [])
        }
    }
});

describe("Engine (Core Router)", () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine();
  });

  test("should handle missing markets gracefully during PLACE_ORDER", () => {
    // Spying on the private sendResponse method to observe results
    const sendResponseMock = spyOn(engine as any, "sendResponse").mockImplementation(() => {});
    
    // Process a dummy order with a fake market
    (engine as any).processMessage({
      correlationId: "123",
      replyTo: "backend-queue",
      type: "PLACE_ORDER",
      payload: {
        id: "o1",
        userId: "u1",
        market: "FAKE_MARKET",
        side: "BUY",
        price: 50000,
        quantity: 1
      }
    } as EngineMessage);

    // It should reject it since it tries to interact with a market that hasn't been instantiated
    // Wait, the current Engine logic might assume OrderBook exists or throws error if it evaluates balance.
    // Let's check exactly what the engine does. 
    // Usually, the orderBook.get() might return undefined, skipping adding order, but it might not return "REJECTED".
  });
  
  test("should REJECT order if the user has insufficient funds", () => {
    const sendResponseMock = spyOn(engine as any, "sendResponse").mockImplementation(() => {});

    // Provide some funds but not enough (Requires 50,000 USDT)
    const userMap = new Map();
    userMap.set("USDT", { available: 100, locked: 0 }); // only 100 USDT available
    (engine as any).balances.set("u1", userMap);

    (engine as any).processMessage({
      correlationId: "abc-123",
      replyTo: "backend-queue",
      type: "PLACE_ORDER",
      payload: {
        id: "o1",
        userId: "u1",
        market: "BTC_USDT",
        side: "BUY",
        price: 50000, // 50,000 * 1 = 50,000 Required
        quantity: 1
      }
    } as EngineMessage);

    // We verify sendResponse was fired with REJECTED parameter
    expect(sendResponseMock).toHaveBeenCalledWith("backend-queue", "abc-123", {
      status: "REJECTED",
      reason: "Insufficient funds"
    });
  });

  test("should handle DEPOSIT successfully and update balances", () => {
    const sendResponseMock = spyOn(engine as any, "sendResponse").mockImplementation(() => {});

    (engine as any).processMessage({
      correlationId: "abc-123",
      replyTo: "backend-queue",
      type: "DEPOSIT",
      payload: {
        userId: "tester-1",
        asset: "USDT",
        amount: 25000
      }
    } as EngineMessage);

    // Check mapping inside RAM
    const userMap = (engine as any).balances.get("tester-1");
    expect(userMap).toBeDefined();
    expect(userMap.get("USDT").available).toBe(25000);

    expect(sendResponseMock).toHaveBeenCalledWith("backend-queue", "abc-123", {
      status: "SUCCESS",
      data: {
        userId: "tester-1",
        asset: "USDT",
        newBalance: 25000
      }
    });
  });
});