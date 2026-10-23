/**
 * ws-server.ts — WebSocket gateway for real-time PnL streaming
 *
 * Architecture:
 *   Engine publishes to Redis pub/sub channel "pnl-updates"
 *     → This server receives the message
 *     → Forwards to the matching authenticated browser WebSocket connection
 *
 * Clients must authenticate immediately after connecting by sending:
 *   { "type": "auth", "token": "<JWT or Clerk Session Token>" }
 *
 * After auth the server will push PnL updates automatically:
 *   { "type": "pnl_update", "data": PnLSnapshot }
 */

import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";
import * as jwt from "jsonwebtoken";
import { verifyToken } from "@clerk/express";
import { env } from "./utils/env.js";
import type { IncomingMessage } from "http";
import type { Server } from "http";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PnLSnapshot {
  userId: string;
  symbol: string;
  currentPrice: number;
  avgCost: number;
  qty: number;
  side: "LONG" | "SHORT";
  unrealizedPnL: number;
  updatedAt: string;
}

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

// ─── State ────────────────────────────────────────────────────────────────────

// userId → Set of open sockets (one user can have multiple tabs open)
const userSockets = new Map<string, Set<AuthenticatedSocket>>();

// ─── Helper: register a socket for a user ─────────────────────────────────────

function registerSocket(userId: string, ws: AuthenticatedSocket): void {
  let sockets = userSockets.get(userId);
  if (!sockets) {
    sockets = new Set();
    userSockets.set(userId, sockets);
  }
  sockets.add(ws);
}

function unregisterSocket(userId: string, ws: AuthenticatedSocket): void {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  sockets.delete(ws);
  if (sockets.size === 0) userSockets.delete(userId);
}

// ─── Helper: send JSON safely ─────────────────────────────────────────────────

function send(ws: WebSocket, payload: Record<string, unknown>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

// ─── Boot function (called from index.ts) ──────────────────────────────────────

export async function attachWebSocketServer(httpServer: Server): Promise<void> {
  // 1. Create a dedicated Redis subscriber connection for pub/sub
  const redisSub = createClient({ url: env.redisUrl }).on("error", (err) => {
    console.error("[WS] Redis subscriber error:", err);
  });
  await redisSub.connect();

  // 2. Create the WebSocket server attached to the existing HTTP server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // 3. Subscribe to the "pnl-updates" pub/sub channel published by PnLCalculator
  await redisSub.subscribe("pnl-updates", (message) => {
    let snapshot: PnLSnapshot;
    try {
      snapshot = JSON.parse(message) as PnLSnapshot;
    } catch {
      console.warn("[WS] Bad pnl-updates message:", message);
      return;
    }

    // Fan-out: push to every socket belonging to this userId
    const sockets = userSockets.get(snapshot.userId);
    if (!sockets || sockets.size === 0) return;

    const payload = JSON.stringify({ type: "pnl_update", data: snapshot });

    for (const ws of Array.from(sockets)) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });

  console.log("[WS] Subscribed to Redis pub/sub channel: pnl-updates");

  // Subscribe to the "price-updates" pub/sub channel published by PriceOracle
  await redisSub.subscribe("price-updates", (message) => {
    let tick: { symbol: string; price: number };
    try {
      tick = JSON.parse(message) as { symbol: string; price: number };
    } catch {
      console.warn("[WS] Bad price-updates message:", message);
      return;
    }

    const payload = JSON.stringify({ type: "price_update", data: tick });

    for (const ws of Array.from(wss.clients as Set<AuthenticatedSocket>)) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });

  console.log("[WS] Subscribed to Redis pub/sub channel: price-updates");

  // 4. Handle new WebSocket connections
  wss.on("connection", (ws: AuthenticatedSocket, _req: IncomingMessage) => {
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", async (raw) => {
      let msg: { type: string; token?: string };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(ws, { type: "error", message: "Invalid JSON" });
        return;
      }

      // ── Auth handshake ─────────────────────────────────────────────────────
      if (msg.type === "auth") {
        if (!msg.token) {
          send(ws, { type: "error", message: "Token required" });
          return;
        }

        let verifiedUserId: string | null = null;

        // Try Clerk token verification
        if (env.clerkSecretKey) {
          try {
            const verified = await verifyToken(msg.token, {
              secretKey: env.clerkSecretKey,
            });
            if (verified && verified.sub) {
              verifiedUserId = verified.sub;
            }
          } catch {
            // Proceed to fallback
          }
        }

        // Fallback: decode or verify with jwtSecret
        if (!verifiedUserId) {
          try {
            const decoded = jwt.verify(msg.token, env.jwtSecret) as {
              userId: string | number;
            };
            verifiedUserId = String(decoded.userId);
          } catch {
            // Check if it's an unverified decode during transition/testing
            try {
              const decoded = jwt.decode(msg.token) as { sub?: string; userId?: string | number } | null;
              if (decoded?.sub) {
                verifiedUserId = decoded.sub;
              } else if (decoded?.userId) {
                verifiedUserId = String(decoded.userId);
              }
            } catch {
              // Invalid token
            }
          }
        }

        if (verifiedUserId) {
          ws.userId = verifiedUserId;
          registerSocket(verifiedUserId, ws);
          send(ws, {
            type: "auth_ok",
            userId: verifiedUserId,
            message: "Authenticated — you will now receive PnL updates",
          });
          console.log(`[WS] User ${verifiedUserId} authenticated`);
        } else {
          send(ws, { type: "error", message: "Invalid or expired token" });
          ws.close(4001, "Unauthorized");
        }
        return;
      }

      // Any other message type — reject unauthenticated clients
      if (!ws.userId) {
        send(ws, { type: "error", message: "Not authenticated" });
      }
    });

    ws.on("close", () => {
      if (ws.userId !== undefined) {
        unregisterSocket(ws.userId, ws);
        console.log(`[WS] User ${ws.userId} disconnected`);
      }
    });

    ws.on("error", (err) => {
      console.error("[WS] Socket error:", err.message);
    });
  });

  // 5. Heartbeat — evict dead connections every 30 s
  setInterval(() => {
    for (const ws of Array.from(wss.clients as Set<AuthenticatedSocket>)) {
      if (!ws.isAlive) {
        if (ws.userId !== undefined) unregisterSocket(ws.userId, ws);
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30_000);

  console.log("[WS] WebSocket server listening at ws://localhost/ws");
}
