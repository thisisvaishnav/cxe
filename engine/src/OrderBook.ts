import type { Order } from "@prisma/client";

export class OrderBook {
  // Map of symbol (e.g., "BTCUSDT") to list of resting limit orders
  private pendingLimits: Map<string, Order[]> = new Map();

  /**
   * Adds a resting limit order to the order book.
   * @param order The limit order to add
   */
  addLimitOrder(order: Order): void {
    const symbol = order.market;
    if (!this.pendingLimits.has(symbol)) {
      this.pendingLimits.set(symbol, []);
    }
    this.pendingLimits.get(symbol)!.push(order);
  }

  /**
   * Removes a resting limit order from the order book by its ID.
   * Supports both string and number IDs to avoid conversion mismatches.
   * @param orderId The ID of the order to remove
   * @returns The removed Order, or null if not found
   */
  removeLimitOrder(orderId: string | number): Order | null {
    const idToFind = String(orderId);

    for (const [symbol, orders] of this.pendingLimits.entries()) {
      let index = -1;

      for (let i = 0; i < orders.length; i++) {
        if (String(orders[i].id) === idToFind) {
          index = i;
          break;
        }
      }

      if (index !== -1) {
        const removedOrder = orders[index];

        orders.splice(index, 1);

        if (orders.length === 0) {
          this.pendingLimits.delete(symbol);
        }

        return removedOrder;
      }
    }

    return null;
  }

  /**
   * Returns a copy of the resting limit orders for the given symbol.
   * Returns a shallow copy to prevent mutation-while-iterating bugs in the caller.
   * @param symbol The symbol to get orders for (e.g., "BTCUSDT")
   * @returns Array of resting limit orders
   */
  getOrdersForSymbol(symbol: string): Order[] {
    const orders = this.pendingLimits.get(symbol);
    return orders ? [...orders] : [];
  }
}
