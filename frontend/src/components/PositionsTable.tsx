// src/components/PositionsTable.tsx - Clean Retro Tabs for Chart Section

import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import type { Position } from "../lib/api.js";
import type { PnLSnapshot } from "../hooks/useWebSocket.js";

interface PositionsTableProps {
  balance: number;
  positions: Position[];
  pnlUpdates: Record<string, PnLSnapshot>;
  onRefreshNeeded?: () => void;
  onDepositSuccess?: () => void;
}

interface OpenOrder {
  id: number;
  market: string;
  price: number | null;
  qty: number;
  type: string;
  side: string;
  status: string;
}

type TabKey =
  | "Balances"
  | "Positions"
  | "Open orders"
  | "Trade history";

export const PositionsTable: React.FC<PositionsTableProps> = ({
  balance,
  positions,
  pnlUpdates,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("Balances");
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);

  useEffect(() => {
    if (activeTab === "Open orders") {
      api
        .getDepth("BTCUSDT")
        .then((depth) => {
          const currentUserId = api.getUserId();
          const userOrders = (depth.orders || [])
            .filter((o: any) => o.userId === currentUserId && o.status === "OPEN")
            .map((o: any) => ({
              id: o.id,
              market: o.market,
              price: o.price,
              qty: o.qty,
              type: o.type,
              side: o.side,
              status: o.status,
            }));
          setOpenOrders(userOrders);
        })
        .catch(() => setOpenOrders([]));
    }
  }, [activeTab]);

  const tabs: TabKey[] = [
    "Balances",
    "Positions",
    "Open orders",
    "Trade history",
  ];

  return (
    <div className="positions-card supercoin-card">
      <div className="tabs-header-bar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="tab-pill"
          >
            {tab}
            {tab === "Positions" && positions.length > 0 && (
              <span className="tab-count-badge">{positions.length}</span>
            )}
            {tab === "Open orders" && openOrders.length > 0 && (
              <span className="tab-count-badge">{openOrders.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="tab-content-area">
        {activeTab === "Balances" && (
          <div className="balances-panel">
            <div className="balance-item-row">
              <div className="asset-meta">
                <span className="asset-code">USDC</span>
                <span className="asset-title">USD Coin</span>
              </div>
              <div className="asset-numbers">
                <span className="asset-amount">
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="asset-usd">
                  ≈ $
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Positions" &&
          (positions.length === 0 ? (
            <div className="empty-panel">
              <span className="empty-title">No open positions</span>
              <span className="empty-desc">Your active trades will appear here</span>
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Side</th>
                    <th>Size</th>
                    <th>Entry</th>
                    <th>Mark</th>
                    <th>PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, i) => {
                    const mark = pnlUpdates[pos.symbol]?.currentPrice || pos.avgCost;
                    const pnl =
                      (mark - pos.avgCost) * Math.abs(pos.qty) * (pos.side === "LONG" ? 1 : -1);
                    return (
                      <tr key={i}>
                        <td className="font-semibold">{pos.symbol}</td>
                        <td className={pos.side === "LONG" ? "text-up font-semibold" : "text-dn font-semibold"}>
                          {pos.side}
                        </td>
                        <td>{Math.abs(pos.qty).toFixed(4)}</td>
                        <td>${pos.avgCost.toFixed(2)}</td>
                        <td>${mark.toFixed(2)}</td>
                        <td className={pnl >= 0 ? "text-up font-semibold" : "text-dn font-semibold"}>
                          {pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

        {activeTab === "Open orders" &&
          (openOrders.length === 0 ? (
            <div className="empty-panel">
              <span className="empty-title">No open orders</span>
              <span className="empty-desc">Your unfilled limit orders will appear here</span>
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Side</th>
                    <th>Price</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {openOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="font-mono">#{ord.id}</td>
                      <td>{ord.type}</td>
                      <td className={ord.side === "BUY" ? "text-up font-semibold" : "text-dn font-semibold"}>
                        {ord.side}
                      </td>
                      <td className="font-mono">{ord.price ? `$${ord.price.toFixed(2)}` : "MKT"}</td>
                      <td className="font-mono">{ord.qty.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {activeTab === "Trade history" && (
          <div className="empty-panel">
            <span className="empty-title">No recent trades</span>
            <span className="empty-desc">Executed orders will be logged here</span>
          </div>
        )}
      </div>
    </div>
  );
};
