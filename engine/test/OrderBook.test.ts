import { expect, test, describe, beforeEach } from "bun:test";
import { OrderBook } from "../src/OrderBook";
import type { Order } from "../src/types";

describe("OrderBook", () => {
  let ob: OrderBook;

  beforeEach(() => {
    ob = new OrderBook("BTC_USDT");
  });

  describe("cancelOrder", () => {
    test("should successfully cancel a BUY order", () => {
      const buyOrder: Order = {
        id: "order1",
        userId: "user1",
        market: "BTC_USDT",
        side: "BUY",
        price: 60000,
        quantity: 1,
        filled: 0,
      };
      
      ob.restoreOrder(buyOrder);
      
      const cancelled = ob.cancelOrder("order1");
      expect(cancelled).not.toBeNull();
      expect(cancelled?.id).toBe("order1");
      
      // Second cancel should return null since it's already removed
      expect(ob.cancelOrder("order1")).toBeNull();
    });

    test("should successfully cancel a SELL order", () => {
      const sellOrder: Order = {
        id: "order2",
        userId: "user2",
        market: "BTC_USDT",
        side: "SELL",
        price: 61000,
        quantity: 1,
        filled: 0,
      };
      
      ob.restoreOrder(sellOrder);
      
      const cancelled = ob.cancelOrder("order2");
      expect(cancelled).not.toBeNull();
      expect(cancelled?.id).toBe("order2");
    });

    test("should return null for non-existent order", () => {
      expect(ob.cancelOrder("nonexistent")).toBeNull();
    });
  });

  describe("Sorting & Hydration (restoreOrder)", () => {
    test("should sort bids (BUY) with highest price first", () => {
      ob.restoreOrder({ id: "1", userId: "u1", market: "BTC_USDT", side: "BUY", price: 50000, quantity: 1, filled: 0 });
      ob.restoreOrder({ id: "2", userId: "u2", market: "BTC_USDT", side: "BUY", price: 52000, quantity: 1, filled: 0 });
      ob.restoreOrder({ id: "3", userId: "u3", market: "BTC_USDT", side: "BUY", price: 51000, quantity: 1, filled: 0 });
      
      // Accessing private array for testing purposes
      const bids = (ob as any).bids as Order[];
      expect(bids[0].price).toBe(52000);
      expect(bids[1].price).toBe(51000);
      expect(bids[2].price).toBe(50000);
    });

    test("should sort asks (SELL) with lowest price first", () => {
      ob.restoreOrder({ id: "1", userId: "u1", market: "BTC_USDT", side: "SELL", price: 50000, quantity: 1, filled: 0 });
      ob.restoreOrder({ id: "2", userId: "u2", market: "BTC_USDT", side: "SELL", price: 48000, quantity: 1, filled: 0 });
      ob.restoreOrder({ id: "3", userId: "u3", market: "BTC_USDT", side: "SELL", price: 49000, quantity: 1, filled: 0 });
      
      // Accessing private array for testing purposes
      const asks = (ob as any).asks as Order[];
      expect(asks[0].price).toBe(48000);
      expect(asks[1].price).toBe(49000);
      expect(asks[2].price).toBe(50000);
    });
  });
  
  describe("addOrder (Basic placeholder check)", () => {
    test("should process addOrder correctly and return base structure", () => {
      const order: Order = { id: "1", userId: "u1", market: "BTC_USDT", side: "BUY", price: 50000, quantity: 1, filled: 0 };
      const result = ob.addOrder(order);
      
      // The current logic is just a placeholder returning an empty array of trades 
      // and the unmutated order as remaining Order.
      expect(result.trades).toBeArray();
      expect(result.remainingOrder).toEqual(order);
    });
  });
});