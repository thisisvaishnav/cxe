// src/components/PositionsTable.tsx - Tabbed Panel for Balances, Positions, and Open Orders

import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api.js";
import type { Position } from "../lib/api.js";
import type { PnLSnapshot } from "../hooks/useWebSocket.js";
import { Trash2, RefreshCw } from "lucide-react";

interface PositionsTableProps {
  balance: number;
  positions: Position[];
  pnlUpdates: Record<string, PnLSnapshot>;
  onRefreshNeeded: () => void;
}

interface OpenOrder {
  id: number;
  market: string;
  price: number | null;
  qty: number;
  type: string;
  side: string;
  status: string;
  createdAt: string;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  balance,
  positions,
  pnlUpdates,
  onRefreshNeeded,
}) => {
  const [activeTab, setActiveTab] = useState<"balances" | "positions" | "orders">("positions");
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // For flashing row backgrounds
  const [flashClasses, setFlashClasses] = useState<Record<string, "flash-up" | "flash-down" | "">>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  // Monitor price changes from WebSocket to trigger green/red flashes
  useEffect(() => {
    const newFlashClasses: Record<string, "flash-up" | "flash-down" | ""> = {};
    let hasChanges = false;

    Object.keys(pnlUpdates).forEach((symbol) => {
      const update = pnlUpdates[symbol];
      if (!update) return;

      const prevPrice = prevPricesRef.current[symbol];
      if (prevPrice !== undefined && prevPrice !== update.currentPrice) {
        newFlashClasses[symbol] = update.currentPrice > prevPrice ? "flash-up" : "flash-down";
        hasChanges = true;
      }
      prevPricesRef.current[symbol] = update.currentPrice;
    });

    if (hasChanges) {
      setFlashClasses((prev) => ({ ...prev, ...newFlashClasses }));
      
      // Clear flash class after 800ms
      const timer = setTimeout(() => {
        setFlashClasses({});
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pnlUpdates]);

  // Fetch open orders when the tab is switched or when refreshed
  const fetchOpenOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      // Since the backend doesn't have an endpoint for ALL open orders (it only has getOrder by ID),
      // we can query the depth of the symbol "BTCUSDT" and filter by the current user's ID!
      // This is a brilliant workaround that makes use of existing backend depth endpoints.
      const depthData = await api.getDepth("BTCUSDT");
      const currentUserId = api.getUserId();
      
      // Filter orders from the depth book that belong to this user
      const userOrders = depthData.orders
        .filter((o) => o.userId === currentUserId && o.status === "OPEN")
        .map((o) => ({
          id: o.id,
          market: o.market,
          price: o.price,
          qty: o.qty,
          type: o.type,
          side: o.side,
          status: o.status,
          createdAt: o.createdAt,
        }));
      setOpenOrders(userOrders);
    } catch (err: any) {
      setOrdersError("Failed to fetch open orders");
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOpenOrders();
    }
  }, [activeTab]);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.cancelOrder(orderId);
      // Refresh balance and positions, and reload open orders list
      onRefreshNeeded();
      fetchOpenOrders();
    } catch (err: any) {
      alert(`Cancel order failed: ${err.message}`);
    }
  };

  return (
    <div className="nes-container" style={{ flex: 1, minHeight: "300px" }}>
      {/* Tabs */}
      <div className="nes-tabs-header" style={{ margin: "-24px -24px 15px -24px" }}>
        <div 
          className={`nes-tab ${activeTab === "balances" ? "active" : ""}`}
          onClick={() => setActiveTab("balances")}
        >
          Balances
        </div>
        <div 
          className={`nes-tab ${activeTab === "positions" ? "active" : ""}`}
          onClick={() => setActiveTab("positions")}
        >
          Positions
        </div>
        <div 
          className={`nes-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Open Orders
        </div>
        
        {/* Mock Tabs */}
        {["Outcomes", "TWAP", "Trade History", "Funding"].map((tab) => (
          <div 
            key={tab}
            className="nes-tab" 
            style={{ opacity: 0.4, cursor: "not-allowed" }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeTab === "balances" && (
          <div className="retro-table-container">
            <table className="retro-table">
              <thead>
                <tr>
                  <th>COIN</th>
                  <th>TOTAL BALANCE</th>
                  <th>AVAILABLE BALANCE</th>
                  <th>VALUE (USDC)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: "bold" }}>USDC</td>
                  <td>{balance.toFixed(2)}</td>
                  <td>{balance.toFixed(2)}</td>
                  <td>{balance.toFixed(2)}</td>
                </tr>
                <tr style={{ opacity: 0.5 }}>
                  <td style={{ fontWeight: "bold" }}>BTC</td>
                  <td>0.0000</td>
                  <td>0.0000</td>
                  <td>0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "positions" && (
          <div className="retro-table-container">
            {positions.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", fontStyle: "italic", fontSize: "14px" }}>
                NO OPEN POSITIONS YET. PRESS START TO TRADE!
              </div>
            ) : (
              <table className="retro-table">
                <thead>
                  <tr>
                    <th>SYMBOL</th>
                    <th>SIDE</th>
                    <th>QTY</th>
                    <th>AVG ENTRY</th>
                    <th>MARK PRICE</th>
                    <th>UNREALIZED P&L</th>
                    <th>ROE %</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => {
                    const wsUpdate = pnlUpdates[pos.symbol];
                    const markPrice = wsUpdate ? wsUpdate.currentPrice : pos.avgCost;
                    const uPnL = wsUpdate ? wsUpdate.unrealizedPnL : 0;
                    
                    // ROE % = (Unrealized PnL / Margin) where Margin = Qty * AvgEntry
                    const margin = Math.abs(pos.qty) * pos.avgCost;
                    const roe = margin > 0 ? (uPnL / margin) * 100 : 0;

                    const flashClass = flashClasses[pos.symbol] || "";

                    return (
                      <tr key={pos.symbol} className={flashClass} style={{ transition: "background-color 0.15s ease" }}>
                        <td style={{ fontWeight: "bold" }}>{pos.symbol}</td>
                        <td className={pos.side === "LONG" ? "text-green" : "text-red"} style={{ fontWeight: "bold" }}>
                          {pos.side}
                        </td>
                        <td>{pos.qty}</td>
                        <td>{pos.avgCost.toFixed(2)}</td>
                        <td style={{ fontWeight: "bold" }}>{markPrice.toFixed(2)}</td>
                        <td className={uPnL >= 0 ? "text-green" : "text-red"} style={{ fontWeight: "bold" }}>
                          {uPnL >= 0 ? "+" : ""}{uPnL.toFixed(2)} USDC
                        </td>
                        <td className={uPnL >= 0 ? "text-green" : "text-red"} style={{ fontWeight: "bold" }}>
                          {roe >= 0 ? "+" : ""}{roe.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="retro-table-container">
            <div style={{ padding: "8px 12px", display: "flex", justifyContent: "flex-end", borderBottom: "2px solid #000000" }}>
              <button 
                onClick={fetchOpenOrders} 
                className="nes-btn" 
                style={{ padding: "4px 8px", fontSize: "10px" }}
                disabled={isOrdersLoading}
              >
                <RefreshCw size={12} style={{ marginRight: "4px" }} /> REFRESH
              </button>
            </div>

            {isOrdersLoading ? (
              <div style={{ padding: "40px", textAlign: "center", fontSize: "12px" }}>
                LOADING YOUR ACTIVE ORDERS...
              </div>
            ) : ordersError ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--mario-red)", fontSize: "12px" }}>
                {ordersError}
              </div>
            ) : openOrders.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", fontStyle: "italic", fontSize: "14px" }}>
                NO OPEN ORDERS FOUND.
              </div>
            ) : (
              <table className="retro-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>SYMBOL</th>
                    <th>TYPE</th>
                    <th>SIDE</th>
                    <th>PRICE</th>
                    <th>QTY</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {openOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>#{order.id}</td>
                      <td>{order.market}</td>
                      <td>{order.type}</td>
                      <td className={order.side === "BUY" ? "text-green" : "text-red"} style={{ fontWeight: "bold" }}>
                        {order.side}
                      </td>
                      <td>{order.price ? order.price.toFixed(2) : "MARKET"}</td>
                      <td>{order.qty}</td>
                      <td>
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="nes-btn red"
                          style={{ padding: "4px 8px", fontSize: "9px" }}
                          title="Cancel Order"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
