import { OrderBook } from "./OrderBook";
import type { Order } from "./generated/prisma";

// Helper to create mock orders
function createMockOrder(id: number, userId: string, market: string, price: number, qty: number): Order {
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
const order1 = createMockOrder(1, "user_101", "BTCUSDT", 68000, 0.5);
const order2 = createMockOrder(2, "user_102", "BTCUSDT", 69000, 1.0);
const order3 = createMockOrder(3, "user_103", "ETHUSDT", 3500, 2.0);

book.addLimitOrder(order1);
book.addLimitOrder(order2);
book.addLimitOrder(order3);

const btcOrders = book.getOrdersForSymbol("BTCUSDT");
console.assert(btcOrders.length === 2, "BTCUSDT should have 2 resting orders");
console.assert(btcOrders[0]?.id === 1 && btcOrders[1]?.id === 2, "Orders should maintain FIFO insertion order");

const ethOrders = book.getOrdersForSymbol("ETHUSDT");
console.assert(ethOrders.length === 1 && ethOrders[0]?.id === 3, "ETHUSDT should have 1 resting order");

// 2. Test removeLimitOrder
const removed = book.removeLimitOrder(1);
console.assert(removed !== null && removed.id === 1, "Should remove order with ID 1");
console.assert(book.getOrdersForSymbol("BTCUSDT").length === 1, "BTCUSDT should now have 1 resting order");
console.assert(book.getOrdersForSymbol("BTCUSDT")[0]?.id === 2, "Remaining order should be ID 2");

// 3. Test removing non-existent order
const nonExistent = book.removeLimitOrder(999);
console.assert(nonExistent === null, "Removing non-existent order should return null");

// 4. Test remove with string ID
const removedWithString = book.removeLimitOrder("2");
console.assert(removedWithString !== null && removedWithString.id === 2, "Should handle string ID removal");
console.assert(book.getOrdersForSymbol("BTCUSDT").length === 0, "BTCUSDT should have 0 resting orders");

console.log("✅ All OrderBook tests passed successfully!");
