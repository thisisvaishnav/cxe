// src/hooks/useWebSocket.ts - React Hook for CXE WebSocket Gateway

import { useEffect, useState, useRef, useCallback } from "react";

export interface PnLSnapshot {
  userId: number;
  symbol: string;
  currentPrice: number;
  avgCost: number;
  qty: number;
  side: "LONG" | "SHORT";
  unrealizedPnL: number;
  updatedAt: string;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export function useWebSocket(token: string | null) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [pnlUpdates, setPnlUpdates] = useState<Record<string, PnLSnapshot>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const tokenRef = useRef<string | null>(token);

  // Keep token ref updated
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const connect = useCallback(() => {
    const activeToken = tokenRef.current;
    if (!activeToken) {
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");

    // Establish WebSocket connection (relative to current host or absolute fallback)
    const host = window.location.host;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? `ws://localhost:3000/ws`
        : `${protocol}//${host}/ws`;

    console.log(`[WS] Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Open. Sending authentication payload...");
      ws.send(
        JSON.stringify({
          type: "auth",
          token: activeToken,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[WS] Message received:", message);

        if (message.type === "auth_ok") {
          setStatus("connected");
          console.log("[WS] Handshake successful, ready for PnL updates");
        } else if (message.type === "pnl_update") {
          const snapshot = message.data as PnLSnapshot;
          setPnlUpdates((prev) => ({
            ...prev,
            [snapshot.symbol]: snapshot,
          }));
          setLastUpdate(new Date().toLocaleTimeString());
        } else if (message.type === "price_update") {
          const tick = message.data as { symbol: string; price: number };
          setPrices((prev) => ({
            ...prev,
            [tick.symbol]: tick.price,
          }));
          setLastUpdate(new Date().toLocaleTimeString());
        } else if (message.type === "error") {
          console.error("[WS] Server error message:", message.message);
          if (
            message.message.includes("token") ||
            message.message.includes("Unauthorized")
          ) {
            setStatus("error");
            ws.close();
          }
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Connection error:", err);
      setStatus("error");
    };

    ws.onclose = (event) => {
      console.log(
        `[WS] Connection closed: Code=${event.code}, Reason=${event.reason}`,
      );
      setStatus((prev) => (prev === "error" ? "error" : "disconnected"));
      wsRef.current = null;

      // Retry with backoff if token is still valid
      if (tokenRef.current) {
        console.log("[WS] Reconnecting in 3 seconds...");
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      }
    };
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return { status, pnlUpdates, lastUpdate, reconnect: connect, prices };
}
