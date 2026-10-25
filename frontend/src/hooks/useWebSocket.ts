// src/hooks/useWebSocket.ts - React Hook for CXE WebSocket Gateway with Vercel Direct Fallback

import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../lib/api.js";

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

const BINANCE_WS_URL =
  "wss://stream.binance.com:9443/ws/btcusdt@trade/ethusdt@trade/solusdt@trade";

export function useWebSocket(token: string | null) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [pnlUpdates, setPnlUpdates] = useState<Record<string, PnLSnapshot>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const binanceWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const tokenRef = useRef<string | null>(token);
  const fallbackModeRef = useRef<boolean>(false);

  // Keep token ref updated
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Connect directly to Binance public WebSocket stream for live prices
  const connectBinanceFallback = useCallback(() => {
    if (binanceWsRef.current) return;

    try {
      console.log("[WS] Connecting to Binance direct stream...");
      const bws = new WebSocket(BINANCE_WS_URL);
      binanceWsRef.current = bws;

      bws.onopen = () => {
        console.log("[WS] Connected to direct Binance stream.");
        setStatus("connected");
      };

      bws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.s && data.p) {
            const sym = data.s.toUpperCase();
            const price = parseFloat(data.p);
            setPrices((prev) => ({
              ...prev,
              [sym]: price,
            }));
            setLastUpdate(new Date().toLocaleTimeString());
          }
        } catch {
          // ignore parsing error
        }
      };

      bws.onerror = () => {
        // keep status
      };

      bws.onclose = () => {
        binanceWsRef.current = null;
        if (tokenRef.current && fallbackModeRef.current) {
          window.setTimeout(connectBinanceFallback, 3000);
        }
      };
    } catch (err) {
      console.warn("[WS] Binance stream connection error:", err);
    }
  }, []);

  // Poll positions and balance when in serverless mode
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    const poll = async () => {
      if (!tokenRef.current) return;
      try {
        const [, positionsData] = await Promise.allSettled([
          api.getBalance(),
          api.getPositions(),
        ]);

        if (positionsData.status === "fulfilled") {
          const positions = positionsData.value.positions || [];
          for (const pos of positions) {
            setPrices((prevPrices) => {
              const currentP = prevPrices[pos.symbol] || pos.avgCost;
              const unrealized =
                pos.side === "LONG"
                  ? (currentP - pos.avgCost) * pos.qty
                  : (pos.avgCost - currentP) * pos.qty;

              const snapshot: PnLSnapshot = {
                userId: tokenRef.current || "",
                symbol: pos.symbol,
                currentPrice: currentP,
                avgCost: pos.avgCost,
                qty: pos.qty,
                side: pos.side,
                unrealizedPnL: unrealized,
                updatedAt: new Date().toISOString(),
              };

              setPnlUpdates((prev) => ({
                ...prev,
                [pos.symbol]: snapshot,
              }));
              return prevPrices;
            });
          }
        }
      } catch {
        // ignore polling errors
      }
    };

    void poll();
    pollingIntervalRef.current = window.setInterval(poll, 3000);
  }, []);

  const connect = useCallback(() => {
    const activeToken = tokenRef.current;
    if (!activeToken) {
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");

    // Establish WebSocket connection
    const host = window.location.host;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const defaultWsUrl =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? `ws://localhost:3000/ws`
        : `${protocol}//${host}/ws`;

    const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;

    // If VITE_WS_URL is explicitly set to "fallback" or "binance", go direct
    if (wsUrl === "binance" || wsUrl === "fallback") {
      fallbackModeRef.current = true;
      connectBinanceFallback();
      startPolling();
      return;
    }

    console.log(`[WS] Connecting to ${wsUrl}...`);
    try {
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
        console.warn("[WS] Backend socket error, falling back to Binance direct:", err);
        fallbackModeRef.current = true;
        connectBinanceFallback();
        startPolling();
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (tokenRef.current) {
          // Switch to Binance direct fallback so the UI remains connected
          fallbackModeRef.current = true;
          connectBinanceFallback();
          startPolling();
        }
      };
    } catch {
      fallbackModeRef.current = true;
      connectBinanceFallback();
      startPolling();
    }
  }, [connectBinanceFallback, startPolling]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (binanceWsRef.current) {
      binanceWsRef.current.close();
      binanceWsRef.current = null;
    }
    fallbackModeRef.current = false;
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
