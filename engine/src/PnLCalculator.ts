import type { createClient } from "redis";
import type { PriceOracle } from "./PriceOracle";
import type { PositionTracker } from "./PositionTracker";

type RedisClient = ReturnType<typeof createClient>;

export interface PnLSnapshot {
  userId: number;
  symbol: string;
  currentPrice: number;
  avgCost: number;
  qty: number;              // signed (negative = SHORT)
  side: "LONG" | "SHORT";
  unrealizedPnL: number;
  updatedAt: string;        // ISO timestamp
}

export class PnLCalculator {
  constructor(
    private readonly redis: RedisClient,
    private readonly oracle: PriceOracle,
    private readonly positionTracker: PositionTracker,
  ) {
    // Wire ourselves onto every price tick from the oracle
    this.oracle.on("tick", (symbol: string, price: number) => {
      this.onTick(symbol, price).catch((err) =>
        console.error("[PnLCalculator] onTick error:", err),
      );
    });

    console.log("[PnLCalculator] Initialised — listening for price ticks.");
  }

  // ─── Core tick handler ─────────────────────────────────────────────────────

  private async onTick(symbol: string, price: number): Promise<void> {
    // Ask the PositionTracker for every user that holds this symbol
    const usersWithPosition = this.positionTracker.getUsersForSymbol(symbol);

    if (usersWithPosition.length === 0) return;

    const pipeline = this.redis.multi();
    const snapshots: PnLSnapshot[] = [];

    for (const userId of usersWithPosition) {
      const position = this.positionTracker.getPosition(userId, symbol);
      if (!position) continue;

      // unrealizedPnL = (currentPrice - avgCost) × qty
      // qty is signed: negative for SHORT, so the sign naturally inverts the formula
      const unrealizedPnL = (price - position.avgCost) * position.qty;

      const snapshot: PnLSnapshot = {
        userId,
        symbol,
        currentPrice: price,
        avgCost: position.avgCost,
        qty: position.qty,
        side: position.side,
        unrealizedPnL,
        updatedAt: new Date().toISOString(),
      };

      snapshots.push(snapshot);

      // Write to Redis: "pnl:{userId}:{symbol}" → JSON string (with 5-minute TTL)
      pipeline.set(`pnl:${userId}:${symbol}`, JSON.stringify(snapshot), { EX: 300 });
    }

    // Flush all Redis SET commands in one round-trip
    await pipeline.exec();

    // Publish each snapshot to the pub/sub channel so the WebSocket server
    // can fan it out to the relevant browser connection.
    for (const snapshot of snapshots) {
      await this.redis.publish("pnl-updates", JSON.stringify(snapshot));
    }

    console.log(
      `[PnLCalculator] ${symbol} @ $${price} — published PnL for ${snapshots.length} user(s)`,
    );
  }

  // ─── On-demand snapshot (used by REST /pnl endpoint) ──────────────────────

  async getSnapshot(
    userId: number,
    symbol: string,
  ): Promise<PnLSnapshot | null> {
    const raw = await this.redis.get(`pnl:${userId}:${symbol}`);
    if (!raw) return null;
    return JSON.parse(raw) as PnLSnapshot;
  }
}
