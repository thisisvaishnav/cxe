export interface Position {
  symbol: string;
  qty: number; // negative for short, positive for long
  avgCost: number; // weighted average entry price
  side: "LONG" | "SHORT";
}

export interface PositionUpdateResult {
  realizedPnL: number;
  position: Position | null; // null if closed
}

export class PositionTracker {
  // Map<userId, Map<symbol, Position>>
  private positions = new Map<number, Map<string, Position>>();

  /**
   * Get all active positions for a user.
   */
  getPositions(userId: number): Position[] {
    const userPositions = this.positions.get(userId);
    if (!userPositions) return [];
    return Array.from(userPositions.values()).filter((pos) => pos.qty !== 0);
  }

  /**
   * Get all userIds that currently hold a non-zero position for this symbol.
   * Used by PnLCalculator to find who needs a PnL update on each tick.
   */
  getUsersForSymbol(symbol: string): number[] {
    const result: number[] = [];
    for (const [userId, userPositions] of this.positions.entries()) {
      const pos = userPositions.get(symbol);
      if (pos && pos.qty !== 0) {
        result.push(userId);
      }
    }
    return result;
  }

  /**
   * Get the position for a user and symbol.
   */
  getPosition(userId: number, symbol: string): Position | null {
    const userPositions = this.positions.get(userId);
    if (!userPositions) return null;
    const pos = userPositions.get(symbol);
    return pos && pos.qty !== 0 ? pos : null;
  }

  /**
   * Update the user's position with a new fill and calculate realized PnL.
   * Supports:
   * - Position accumulation (increasing size and updating average cost).
   * - Position reduction (realizing PnL, maintaining average cost).
   * - Position closure (realizing PnL, clearing position).
   * - Position reversal (crossing zero to the opposite side).
   */
  addFill(
    userId: number,
    symbol: string,
    side: "BUY" | "SELL",
    qty: number,
    price: number,
  ): PositionUpdateResult {
    let userPositions = this.positions.get(userId);
    if (!userPositions) {
      userPositions = new Map<string, Position>();
      this.positions.set(userId, userPositions);
    }

    const currentPos = userPositions.get(symbol);
    let realizedPnL = 0;
    let newPos: Position | null = null;

    if (!currentPos || currentPos.qty === 0) {
      // ─── Case 1: No active position ────────────────────────────────────────
      if (side === "BUY") {
        newPos = {
          symbol,
          qty,
          avgCost: price,
          side: "LONG",
        };
      } else {
        newPos = {
          symbol,
          qty: -qty,
          avgCost: price,
          side: "SHORT",
        };
      }
      userPositions.set(symbol, newPos);
    } else if (currentPos.side === "LONG") {
      // ─── Case 2: Currently LONG ─────────────────────────────────────────────
      const oldQty = currentPos.qty;
      const oldAvgCost = currentPos.avgCost;

      if (side === "BUY") {
        // Adding to LONG position (accumulation)
        const newQty = oldQty + qty;
        const newAvgCost = (oldQty * oldAvgCost + qty * price) / newQty;
        newPos = {
          symbol,
          qty: newQty,
          avgCost: newAvgCost,
          side: "LONG",
        };
        userPositions.set(symbol, newPos);
      } else {
        // Selling to reduce, close, or reverse LONG position
        if (qty < oldQty) {
          // Reduction
          realizedPnL = (price - oldAvgCost) * qty;
          const newQty = oldQty - qty;
          newPos = {
            symbol,
            qty: newQty,
            avgCost: oldAvgCost,
            side: "LONG",
          };
          userPositions.set(symbol, newPos);
        } else if (qty === oldQty) {
          // Closure
          realizedPnL = (price - oldAvgCost) * qty;
          userPositions.delete(symbol);
          newPos = null;
        } else {
          // Reversal to SHORT
          realizedPnL = (price - oldAvgCost) * oldQty;
          const remainingQty = qty - oldQty;
          newPos = {
            symbol,
            qty: -remainingQty,
            avgCost: price,
            side: "SHORT",
          };
          userPositions.set(symbol, newPos);
        }
      }
    } else {
      // ─── Case 3: Currently SHORT (qty < 0) ──────────────────────────────────
      const oldQty = currentPos.qty; // negative
      const oldAbsQty = Math.abs(oldQty);
      const oldAvgCost = currentPos.avgCost;

      if (side === "SELL") {
        // Adding to SHORT position (accumulation)
        const newQty = oldQty - qty; // e.g. -0.5 - 0.3 = -0.8
        const newAbsQty = Math.abs(newQty);
        const newAvgCost = (oldAbsQty * oldAvgCost + qty * price) / newAbsQty;
        newPos = {
          symbol,
          qty: newQty,
          avgCost: newAvgCost,
          side: "SHORT",
        };
        userPositions.set(symbol, newPos);
      } else {
        // Buying to reduce, close, or reverse SHORT position
        if (qty < oldAbsQty) {
          // Reduction
          realizedPnL = (oldAvgCost - price) * qty;
          const newQty = oldQty + qty; // e.g. -0.5 + 0.2 = -0.3
          newPos = {
            symbol,
            qty: newQty,
            avgCost: oldAvgCost,
            side: "SHORT",
          };
          userPositions.set(symbol, newPos);
        } else if (qty === oldAbsQty) {
          // Closure
          realizedPnL = (oldAvgCost - price) * qty;
          userPositions.delete(symbol);
          newPos = null;
        } else {
          // Reversal to LONG
          realizedPnL = (oldAvgCost - price) * oldAbsQty;
          const remainingQty = qty - oldAbsQty;
          newPos = {
            symbol,
            qty: remainingQty,
            avgCost: price,
            side: "LONG",
          };
          userPositions.set(symbol, newPos);
        }
      }
    }

    return { realizedPnL, position: newPos };
  }
}
