// src/hooks/useWebSocket.ts - React Hook for CXE WebSocket Gateway

import { useEffect, useState, useRef, useCallback } from "react";

export interface PnLSnapshot {
  userId: string;
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

    // Establish WebSocket connection (relative to current host, environment variable, or fallback)
    const host = window.location.host;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const defaultWsUrl =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? `ws://localhost:3000/ws`
        : `${protocol}//${host}/ws`;

    const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;

    console.log(`[WS] Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Open. Sending authentication payload...");
      ws.send(
        JSON.stringify({
          type: "auth",
          token: activeToken,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "auth_ok") {
          console.log("[WS] Authentication confirmed:", message);
          setStatus("connected");
        } else if (message.type === "pnl_update") {
          const snapshot: PnLSnapshot = message.data;
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
          console.error("[WS] Server error:", message.message);
          if (
            message.message.includes("token") ||
            message.message.includes("Unauthorized")
          ) {
            setStatus("error");
          }
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Socket error:", err);
      setStatus("error");
    };

    ws.onclose = (event) => {
      console.log(`[WS] Closed (code: ${event.code})`);
      setStatus("disconnected");
      wsRef.current = null;

      // Retry with backoff if token is still valid
      if (tokenRef.current) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log("[WS] Attempting reconnect...");
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

  return {
    status,
    pnlUpdates,
    prices,
    lastUpdate,
  };
}
