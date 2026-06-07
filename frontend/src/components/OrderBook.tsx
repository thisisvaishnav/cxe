// src/components/OrderBook.tsx - Interactive Order Book with Depth Chart Overlays

import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";

interface OrderBookProps {
  symbol: string;
  currentPrice: number | null;
  refreshTrigger: number; // Incrementing this forces refresh
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  symbol,
  currentPrice,
  refreshTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<"book" | "trades">("book");
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderBook = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const depthData = await api.getDepth(symbol);

      // Group by price and filter open limit orders
      const orderList = depthData.orders || [];
      const sellOrders = orderList.filter((o) => o.side === "SELL");
      const buyOrders = orderList.filter((o) => o.side === "BUY");

      // Aggregate sells (asks)
      const askMap = new Map<number, number>();
      sellOrders.forEach((o) => {
        const priceVal = o.price || 0;
        const remainingQty = o.qty - o.filledQty;
        if (remainingQty > 0) {
          askMap.set(priceVal, (askMap.get(priceVal) || 0) + remainingQty);
        }
      });

      // Aggregate buys (bids)
      const bidMap = new Map<number, number>();
      buyOrders.forEach((o) => {
        const priceVal = o.price || 0;
        const remainingQty = o.qty - o.filledQty;
        if (remainingQty > 0) {
          bidMap.set(priceVal, (bidMap.get(priceVal) || 0) + remainingQty);
        }
      });

      // Sort asks: ascending (lowest ask at bottom, closest to spread)
      const sortedAskPrices = Array.from(askMap.keys()).sort((a, b) => a - b);
      // Sort bids: descending (highest bid at top, closest to spread)
      const sortedBidPrices = Array.from(bidMap.keys()).sort((a, b) => b - a);

      // Compute cumulative sizes
      let askTotal = 0;
      const aggregatedAsks: OrderBookEntry[] = sortedAskPrices.map((price) => {
        const size = askMap.get(price) || 0;
        askTotal += size;
        return { price, size, total: askTotal };
      });

      let bidTotal = 0;
      const aggregatedBids: OrderBookEntry[] = sortedBidPrices.map((price) => {
        const size = bidMap.get(price) || 0;
        bidTotal += size;
        return { price, size, total: bidTotal };
      });

      // Keep standard sizes (up to 8 levels for vertical spacing)
      setAsks(aggregatedAsks.slice(0, 8).reverse()); // Reverse asks so highest is at the top of the UI
      setBids(aggregatedBids.slice(0, 8));
    } catch (err: any) {
      console.error(err);
      setError("Failed to load depth book");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for order book updates
  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(() => {
      fetchOrderBook();
    }, 2000);
    return () => clearInterval(interval);
  }, [symbol, refreshTrigger]);

  // Calculations for spread
  const highestBid = bids.length > 0 ? bids[0]?.price : null;
  const lowestAsk = asks.length > 0 ? asks[asks.length - 1]?.price : null;
  const spread =
    highestBid !== null && lowestAsk !== null ? lowestAsk - highestBid : 0;
  const spreadPercent =
    highestBid !== null && highestBid > 0 ? (spread / highestBid) * 100 : 0;

  // Max cumulative size for depth visual bars
  const maxCumulative = Math.max(
    bids.length > 0 ? bids[bids.length - 1]?.total || 0 : 0,
    asks.length > 0 ? asks[0]?.total || 0 : 0,
    1, // avoid division by zero
  );

  return (
    <div
      className="nes-container orderbook-container"
      style={{ height: "100%" }}
    >
      {/* Tabs */}
      <div
        className="nes-tabs-header"
        style={{ margin: "-24px -24px 15px -24px" }}
      >
        <div
          className={`nes-tab ${activeTab === "book" ? "active" : ""}`}
          onClick={() => setActiveTab("book")}
          style={{ flex: 1, textAlign: "center" }}
        >
          Order Book
        </div>
        <div
          className={`nes-tab ${activeTab === "trades" ? "active" : ""}`}
          onClick={() => setActiveTab("trades")}
          style={{ flex: 1, textAlign: "center" }}
        >
          Trades
        </div>
      </div>

      {activeTab === "book" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            fontSize: "14px",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              fontWeight: "bold",
              fontFamily: "var(--font-press-start)",
              fontSize: "var(--orderbook-header-font-size, 8px)",
              paddingBottom: "var(--orderbook-header-padding, 8px)",
              borderBottom: "2px solid #000000",
              opacity: 0.7,
            }}
          >
            <span>PRICE (USDT)</span>
            <span style={{ textAlign: "right" }}>SIZE (BTC)</span>
            <span style={{ textAlign: "right" }}>TOTAL (BTC)</span>
          </div>

          {isLoading && bids.length === 0 && (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              SYNCING DEPTH DATA...
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "20px 0",
                color: "var(--mario-red)",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Asks (Sells) - Red Bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            {asks.map((ask, idx) => {
              const widthPct = (ask.total / maxCumulative) * 100;
              return (
                <div
                  key={`ask-${idx}`}
                  className="orderbook-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr",
                    padding: "var(--orderbook-row-padding, 4px) 0",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--orderbook-row-font-size, 14px)",
                    background: `linear-gradient(to left, rgba(211, 47, 47, 0.15) ${widthPct}%, transparent ${widthPct}%)`,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <span className="text-red" style={{ fontWeight: "bold" }}>
                    {ask.price.toFixed(2)}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {ask.size.toFixed(4)}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {ask.total.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Spread / Mid Market Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "var(--orderbook-spread-padding, 10px 8px)",
              margin: "var(--orderbook-spread-margin, 6px 0)",
              background: "#eeeeee",
              borderTop: "2px solid #000000",
              borderBottom: "2px solid #000000",
              fontFamily: "var(--font-press-start)",
              fontSize: "var(--orderbook-spread-font-size, 9px)",
            }}
          >
            <span
              style={{
                color:
                  currentPrice && currentPrice > (highestBid || 0)
                    ? "var(--mario-green)"
                    : "var(--mario-red)",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              ★{" "}
              {currentPrice
                ? currentPrice.toFixed(2)
                : (lowestAsk || 60000).toFixed(2)}
            </span>
            <div
              style={{
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                opacity: 0.8,
              }}
            >
              <span>Spread: </span>
              <span style={{ fontWeight: "bold" }}>{spread.toFixed(2)}</span>
              <span> ({spreadPercent.toFixed(3)}%)</span>
            </div>
          </div>

          {/* Bids (Buys) - Green Bars */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {bids.map((bid, idx) => {
              const widthPct = (bid.total / maxCumulative) * 100;
              return (
                <div
                  key={`bid-${idx}`}
                  className="orderbook-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr",
                    padding: "var(--orderbook-row-padding, 4px) 0",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--orderbook-row-font-size, 14px)",
                    background: `linear-gradient(to left, rgba(56, 142, 60, 0.15) ${widthPct}%, transparent ${widthPct}%)`,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <span className="text-green" style={{ fontWeight: "bold" }}>
                    {bid.price.toFixed(2)}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {bid.size.toFixed(4)}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {bid.total.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "trades" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            fontSize: "14px",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              fontWeight: "bold",
              fontFamily: "var(--font-press-start)",
              fontSize: "var(--orderbook-header-font-size, 8px)",
              paddingBottom: "var(--orderbook-header-padding, 8px)",
              borderBottom: "2px solid #000000",
              opacity: 0.7,
            }}
          >
            <span>TIME</span>
            <span style={{ textAlign: "right" }}>PRICE (USDT)</span>
            <span style={{ textAlign: "right" }}>SIZE (BTC)</span>
          </div>

          {/* Mock Recent Trades */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "10px",
              flex: 1,
            }}
          >
            {[
              {
                time: "10:14:38",
                price: (currentPrice || 60000) + 1.5,
                size: 0.045,
                side: "buy",
              },
              {
                time: "10:14:32",
                price: (currentPrice || 60000) - 0.5,
                size: 0.12,
                side: "sell",
              },
              {
                time: "10:14:15",
                price: (currentPrice || 60000) + 0.25,
                size: 0.008,
                side: "buy",
              },
              {
                time: "10:14:02",
                price: (currentPrice || 60000) + 0.1,
                size: 0.015,
                side: "buy",
              },
              {
                time: "10:13:58",
                price: (currentPrice || 60000) - 1.25,
                size: 0.55,
                side: "sell",
              },
              {
                time: "10:13:44",
                price: (currentPrice || 60000) - 0.75,
                size: 0.095,
                side: "sell",
              },
              {
                time: "10:13:30",
                price: (currentPrice || 60000) + 0.45,
                size: 0.18,
                side: "buy",
              },
              {
                time: "10:13:18",
                price: (currentPrice || 60000) - 0.15,
                size: 0.022,
                side: "sell",
              },
              {
                time: "10:13:05",
                price: (currentPrice || 60000) + 0.8,
                size: 0.35,
                side: "buy",
              },
              {
                time: "10:12:59",
                price: (currentPrice || 60000) - 0.95,
                size: 0.07,
                side: "sell",
              },
            ].map((trade, idx) => (
              <div
                key={`trade-${idx}`}
                className="orderbook-trade-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr",
                  padding: "var(--orderbook-row-padding, 4px) 0",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--orderbook-row-font-size, 14px)",
                }}
              >
                <span style={{ opacity: 0.6 }}>{trade.time}</span>
                <span
                  className={trade.side === "buy" ? "text-green" : "text-red"}
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  {trade.price.toFixed(2)}
                </span>
                <span style={{ textAlign: "right" }}>
                  {trade.size.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
