import { OrderBook } from "./OrderBook";
import type { Order } from "@prisma/client";

// Helper to create mock orders
function createMockOrder(id: number, userId: number, market: string, price: number, qty: number): Order {
  return {
    id,
    userId,
    market,
    price,
    qty,
    type: "LIMIT",
    side: "BUY",
    filledQty: 0,
    status: "OPEN",
    createdAt: new Date(),
  };
}

console.log("Running OrderBook tests...");

const book = new OrderBook();

// 1. Test addLimitOrder and getOrdersForSymbol
const order1 = createMockOrder(1, 101, "BTCUSDT", 68000, 0.5);
const order2 = createMockOrder(2, 102, "BTCUSDT", 69000, 1.0);
const order3 = createMockOrder(3, 103, "ETHUSDT", 3500, 2.0);

book.addLimitOrder(order1);
book.addLimitOrder(order2);
book.addLimitOrder(order3);

const btcOrders = book.getOrdersForSymbol("BTCUSDT");
const ethOrders = book.getOrdersForSymbol("ETHUSDT");
const solOrders = book.getOrdersForSymbol("SOLUSDT");

console.assert(btcOrders.length === 2, "BTCUSDT should have 2 orders");
console.assert(ethOrders.length === 1, "ETHUSDT should have 1 order");
console.assert(solOrders.length === 0, "SOLUSDT should have 0 orders");

// Verify shallow copy
btcOrders.push(createMockOrder(4, 104, "BTCUSDT", 70000, 1.5));
console.assert(book.getOrdersForSymbol("BTCUSDT").length === 2, "getOrdersForSymbol should return a copy of the array");

// 2. Test removeLimitOrder
// Remove using numeric ID
const removed1 = book.removeLimitOrder(1);
console.assert(removed1 !== null && removed1.id === 1, "Should successfully remove order 1");
console.assert(book.getOrdersForSymbol("BTCUSDT").length === 1, "BTCUSDT should now have 1 order");

// Remove using string ID
const removed2 = book.removeLimitOrder("2");
console.assert(removed2 !== null && removed2.id === 2, "Should successfully remove order 2 using string ID");
console.assert(book.getOrdersForSymbol("BTCUSDT").length === 0, "BTCUSDT should now have 0 orders");

// Try to remove non-existent order
const removedNonExistent = book.removeLimitOrder(999);
console.assert(removedNonExistent === null, "Should return null for non-existent order");

// Test key cleanup
console.assert(book.getOrdersForSymbol("BTCUSDT").length === 0, "BTCUSDT should be empty and cleaned up");
const ethRemaining = book.getOrdersForSymbol("ETHUSDT");
console.assert(ethRemaining.length === 1 && ethRemaining[0]?.id === 3, "ETHUSDT order should still exist");

console.log("All tests passed successfully!");
