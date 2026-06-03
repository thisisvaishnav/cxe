// engine/src/OrderBook.ts

import type { Order } from "./types";

export class OrderBook {
  public market: string;

  // Using standard arrays for now.
  // In ultra-HFT, these would be Red-Black Trees, but arrays are perfect to start.
  private bids: Order[] = []; // Buyers
  private asks: Order[] = []; // Sellers

  constructor(market: string) {
    this.market = market;
  }

  // ==========================================
  // HYDRATION: Restoring State
  // ==========================================

  public restoreOrder(order: Order) {
    if (order.side === "BUY") {
      this.bids.push(order);
      this.sortBids();
    } else {
      this.asks.push(order);
      this.sortAsks();
    }
  }

  // ==========================================
  // SORTING ALGORITHMS
  // ==========================================

  public cancelOrder(orderId: string): Order | null {
    // Look in bids
    const bidIndex = this.bids.findIndex(o => o.id === orderId);
    if (bidIndex !== -1) {
      const [order] = this.bids.splice(bidIndex, 1);
      return order || null;
    }

    // Look in asks
    const askIndex = this.asks.findIndex(o => o.id === orderId);
    if (askIndex !== -1) {
      const [order] = this.asks.splice(askIndex, 1);
      return order || null;
    }

    return null; // Not found
  }

  private sortBids() {
    // Sort bids HIGHEST price first.
    // If prices match, sort by OLDEST time first (time-priority).
    // (Assuming arrays are appended in chronological order)
    this.bids.sort((a, b) => b.price - a.price);
  }

  private sortAsks() {
    // Sort asks LOWEST price first.
    this.asks.sort((a, b) => a.price - b.price);
  }

  // ==========================================
  // LIVE TRADING: The Matching Engine
  // ==========================================

  public addOrder(order: Order) {
    // This is where the magic happens!
    // We will write the logic here to check if the new order crosses the spread.

    const tradesExecuted: any[] = [];

    // 1. If BUY, loop through this.asks looking for a price <= order.price
    // 2. If SELL, loop through this.bids looking for a price >= order.price
    // 3. Execute trades, update balances, and modify the arrays.

    return {
      trades: tradesExecuted,
      remainingOrder: order, // If partially filled, what's left?
    };
  }
}
