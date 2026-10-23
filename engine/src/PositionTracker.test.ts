import { PositionTracker } from "./PositionTracker";

console.log("Running PositionTracker tests...");

const tracker = new PositionTracker();
const userId = "user_test_1";
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

// ─── 2. Accumulate LONG (BUY more at higher price) ───────────────────────────
{
  const result = tracker.addFill(userId, symbol, "BUY", 0.5, 70000);
  // Expected new average cost = (0.5 * 68000 + 0.5 * 70000) / 1.0 = 69000
  assertPos(
    result.position!.qty, 1.0,
    result.position!.avgCost, 69000,
    result.position!.side, "LONG",
    result.realizedPnL, 0,
    "2. Accumulate LONG"
  );
}

// ─── 3. Partially reduce LONG (SELL some at profit) ──────────────────────────
{
  const result = tracker.addFill(userId, symbol, "SELL", 0.4, 71000);
  // Realized PnL = (71000 - 69000) * 0.4 = 800
  // Remaining qty = 0.6, avgCost remains 69000
  assertPos(
    result.position!.qty, 0.6,
    result.position!.avgCost, 69000,
    result.position!.side, "LONG",
    result.realizedPnL, 800,
    "3. Partially reduce LONG"
  );
}

// ─── 4. Reversal: Close LONG and open SHORT in one fill ─────────────────────
{
  // Current: LONG 0.6 @ 69000
  // SELL 0.8 @ 72000
  // Closes 0.6 -> Realized PnL = (72000 - 69000) * 0.6 = 1800
  // Opens SHORT 0.2 @ 72000
  const result = tracker.addFill(userId, symbol, "SELL", 0.8, 72000);
  assertPos(
    result.position!.qty, -0.2,
    result.position!.avgCost, 72000,
    result.position!.side, "SHORT",
    result.realizedPnL, 1800,
    "4. Reverse LONG to SHORT"
  );
}

// ─── 5. Accumulate SHORT (SELL more at higher price) ─────────────────────────
{
  // Current: SHORT 0.2 (qty: -0.2) @ 72000
  // SELL 0.3 @ 74000
  // New avgCost = (0.2 * 72000 + 0.3 * 74000) / 0.5 = (14400 + 22200) / 0.5 = 73200
  // New qty = -0.5
  const result = tracker.addFill(userId, symbol, "SELL", 0.3, 74000);
  assertPos(
    result.position!.qty, -0.5,
    result.position!.avgCost, 73200,
    result.position!.side, "SHORT",
    result.realizedPnL, 0,
    "5. Accumulate SHORT"
  );
}

// ─── 6. Partially reduce SHORT (BUY some at profit) ──────────────────────────
{
  // Current: SHORT 0.5 @ 73200
  // BUY 0.2 @ 71000
  // Realized PnL = (73200 - 71000) * 0.2 = 440
  // Remaining: SHORT 0.3 (qty: -0.3) @ 73200
  const result = tracker.addFill(userId, symbol, "BUY", 0.2, 71000);
  assertPos(
    result.position!.qty, -0.3,
    result.position!.avgCost, 73200,
    result.position!.side, "SHORT",
    result.realizedPnL, 440,
    "6. Partially reduce SHORT"
  );
}

// ─── 7. Close SHORT completely ───────────────────────────────────────────────
{
  // Current: SHORT 0.3 @ 73200
  // BUY 0.3 @ 70000
  // Realized PnL = (73200 - 70000) * 0.3 = 960
  // Position closed: null
  const result = tracker.addFill(userId, symbol, "BUY", 0.3, 70000);
  console.assert(result.position === null, "Position should be closed (null)");
  const pnlOk = Math.abs(result.realizedPnL - 960) < 1e-9;
  if (!pnlOk) {
    console.error(`FAIL: 7. Close SHORT. Expected PnL: 960, Actual: ${result.realizedPnL}`);
    process.exit(1);
  }
  console.assert(tracker.getPositions(userId).length === 0, "No active positions should remain");
}

// ─── 8. Open SHORT, then reverse to LONG ─────────────────────────────────────
{
  tracker.addFill(userId, symbol, "SELL", 0.5, 68000);
  // Current: SHORT 0.5 @ 68000
  // BUY 0.8 @ 66000
  // Closes SHORT 0.5 -> Realized PnL = (68000 - 66000) * 0.5 = 1000
  // Opens LONG 0.3 @ 66000
  const result = tracker.addFill(userId, symbol, "BUY", 0.8, 66000);
  assertPos(
    result.position!.qty, 0.3,
    result.position!.avgCost, 66000,
    result.position!.side, "LONG",
    result.realizedPnL, 1000,
    "8. Reverse SHORT to LONG"
  );
}

console.log("✅ All PositionTracker tests passed successfully!");
