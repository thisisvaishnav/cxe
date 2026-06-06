import { PositionTracker } from "./PositionTracker";

console.log("Running PositionTracker tests...");

const tracker = new PositionTracker();
const userId = 1;
const symbol = "BTCUSDT";

// Helper helper to assert position properties
function assertPos(
  actualQty: number,
  expectedQty: number,
  actualCost: number,
  expectedCost: number,
  actualSide: string,
  expectedSide: string,
  actualPnL: number,
  expectedPnL: number,
  msg: string
) {
  // Use closeTo comparison for floats
  const qtyOk = Math.abs(actualQty - expectedQty) < 1e-9;
  const costOk = Math.abs(actualCost - expectedCost) < 1e-9;
  const pnlOk = Math.abs(actualPnL - expectedPnL) < 1e-9;
  const sideOk = actualSide === expectedSide;

  if (!qtyOk || !costOk || !pnlOk || !sideOk) {
    console.error(`FAIL: ${msg}`);
    console.error(`Expected: qty=${expectedQty}, cost=${expectedCost}, side=${expectedSide}, pnl=${expectedPnL}`);
    console.error(`Actual:   qty=${actualQty}, cost=${actualCost}, side=${actualSide}, pnl=${actualPnL}`);
    process.exit(1);
  }
}

// ─── 1. No position -> BUY fill (Create LONG) ────────────────────────────────
{
  const result = tracker.addFill(userId, symbol, "BUY", 0.5, 68000);
  console.assert(result.position !== null, "Position should be created");
  assertPos(
    result.position!.qty, 0.5,
    result.position!.avgCost, 68000,
    result.position!.side, "LONG",
    result.realizedPnL, 0,
    "1. Create LONG"
  );
}

// ─── 2. LONG position -> BUY fill (Accumulate LONG) ─────────────────────────
{
  const result = tracker.addFill(userId, symbol, "BUY", 0.5, 70000);
  console.assert(result.position !== null, "Position should exist");
  assertPos(
    result.position!.qty, 1.0,
    result.position!.avgCost, 69000, // (0.5 * 68000 + 0.5 * 70000) / 1.0
    result.position!.side, "LONG",
    result.realizedPnL, 0,
    "2. Accumulate LONG"
  );
}

// ─── 3. LONG position -> SELL fill (Reduce LONG) ─────────────────────────────
{
  const result = tracker.addFill(userId, symbol, "SELL", 0.4, 71000);
  console.assert(result.position !== null, "Position should exist");
  assertPos(
    result.position!.qty, 0.6,
    result.position!.avgCost, 69000, // Average cost does not change when reducing
    result.position!.side, "LONG",
    result.realizedPnL, 800, // (71000 - 69000) * 0.4 = 800
    "3. Reduce LONG"
  );
}

// ─── 4. LONG position -> SELL fill (Reverse LONG to SHORT) ────────────────────
{
  // Current LONG: qty=0.6, avgCost=69000. Sell 0.8 @ 72000.
  // Reversal:
  // - 0.6 long closed @ 72000. Realized PnL = (72000 - 69000) * 0.6 = 1800.
  // - 0.2 short opened @ 72000.
  const result = tracker.addFill(userId, symbol, "SELL", 0.8, 72000);
  console.assert(result.position !== null, "Position should exist");
  assertPos(
    result.position!.qty, -0.2,
    result.position!.avgCost, 72000,
    result.position!.side, "SHORT",
    result.realizedPnL, 1800,
    "4. Reverse LONG to SHORT"
  );
}

// ─── 5. SHORT position -> SELL fill (Accumulate SHORT) ────────────────────────
{
  // Current SHORT: qty=-0.2, avgCost=72000. Sell 0.3 @ 74000.
  // New size: -0.5. Avg cost: (0.2 * 72000 + 0.3 * 74000) / 0.5 = 73200.
  const result = tracker.addFill(userId, symbol, "SELL", 0.3, 74000);
  console.assert(result.position !== null, "Position should exist");
  assertPos(
    result.position!.qty, -0.5,
    result.position!.avgCost, 73200,
    result.position!.side, "SHORT",
    result.realizedPnL, 0,
    "5. Accumulate SHORT"
  );
}

// ─── 6. SHORT position -> BUY fill (Reduce SHORT) ────────────────────────────
{
  // Current SHORT: qty=-0.5, avgCost=73200. Buy 0.2 @ 71000.
  // Reduction:
  // - Realized PnL: (73200 - 71000) * 0.2 = 440.
  // - Remaining size: -0.3. Avg cost remains 73200.
  const result = tracker.addFill(userId, symbol, "BUY", 0.2, 71000);
  console.assert(result.position !== null, "Position should exist");
  assertPos(
    result.position!.qty, -0.3,
    result.position!.avgCost, 73200,
    result.position!.side, "SHORT",
    result.realizedPnL, 440,
    "6. Reduce SHORT"
  );
}

// ─── 7. SHORT position -> BUY fill (Close SHORT) ─────────────────────────────
{
  // Current SHORT: qty=-0.3, avgCost=73200. Buy 0.3 @ 70000.
  // Closure:
  // - Realized PnL: (73200 - 70000) * 0.3 = 960.
  // - Position is closed (null).
  const result = tracker.addFill(userId, symbol, "BUY", 0.3, 70000);
  console.assert(result.position === null, "Position should be closed");
  console.assert(Math.abs(result.realizedPnL - 960) < 1e-9, `Expected realized PnL 960, got ${result.realizedPnL}`);
}

// ─── 8. Empty position -> SELL fill (Create SHORT) ───────────────────────────
{
  const result = tracker.addFill(userId, symbol, "SELL", 0.5, 68000);
  console.assert(result.position !== null, "Position should exist");
  assertPos(
    result.position!.qty, -0.5,
    result.position!.avgCost, 68000,
    result.position!.side, "SHORT",
    result.realizedPnL, 0,
    "8. Create SHORT"
  );
}

// ─── 9. SHORT position -> BUY fill (Reverse SHORT to LONG) ────────────────────
{
  // Current SHORT: qty=-0.5, avgCost=68000. Buy 0.8 @ 66000.
  // Reversal:
  // - 0.5 short closed @ 66000. Realized PnL: (68000 - 66000) * 0.5 = 1000.
  // - 0.3 long opened @ 66000.
  const result = tracker.addFill(userId, symbol, "BUY", 0.8, 66000);
  console.assert(result.position !== null, "Position should exist");
  assertPos(
    result.position!.qty, 0.3,
    result.position!.avgCost, 66000,
    result.position!.side, "LONG",
    result.realizedPnL, 1000,
    "9. Reverse SHORT to LONG"
  );
}

console.log("All PositionTracker tests passed successfully!");
