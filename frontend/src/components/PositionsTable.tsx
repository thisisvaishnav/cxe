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
  | "Outcomes"
  | "TWAP"
  | "Trade history"
  | "Funding";

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
    "Outcomes",
    "TWAP",
    "Trade history",
    "Funding",
  ];

  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "12px" }}>
        {activeTab === "Balances" && (
          <p className="empty">
            USDC{" "}
            {balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            available. No other assets.
          </p>
        )}

        {activeTab === "Positions" &&
          (positions.length === 0 ? (
            <p className="empty">No open positions.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div
                className="cols"
                style={{
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr",
                }}
              >
                <span>Market</span>
                <span>Side</span>
                <span>Size</span>
                <span>Entry</span>
                <span>Mark</span>
                <span>PnL</span>
              </div>
              {positions.map((pos, i) => {
                const mark = pnlUpdates[pos.symbol]?.currentPrice || pos.avgCost;
                const pnl =
                  (mark - pos.avgCost) * Math.abs(pos.qty) * (pos.side === "LONG" ? 1 : -1);
                return (
                  <div
                    key={i}
                    className="row"
                    style={{
                      gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <span>{pos.symbol}</span>
                    <span
                      style={{
                        color: pos.side === "LONG" ? "var(--up)" : "var(--down)",
                      }}
                    >
                      {pos.side}
                    </span>
                    <span>{Math.abs(pos.qty).toFixed(4)}</span>
                    <span>${pos.avgCost.toFixed(2)}</span>
                    <span>${mark.toFixed(2)}</span>
                    <span style={{ color: pnl >= 0 ? "var(--up)" : "var(--down)" }}>
                      {pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

        {activeTab === "Open orders" &&
          (openOrders.length === 0 ? (
            <p className="empty">No open orders.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div
                className="cols"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                }}
              >
                <span>ID</span>
                <span>Type</span>
                <span>Side</span>
                <span>Price</span>
                <span>Size</span>
              </div>
              {openOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="row"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span>#{ord.id}</span>
                  <span>{ord.type}</span>
                  <span
                    style={{
                      color: ord.side === "BUY" ? "var(--up)" : "var(--down)",
                    }}
                  >
                    {ord.side}
                  </span>
                  <span>{ord.price ? `$${ord.price.toFixed(2)}` : "MKT"}</span>
                  <span>{ord.qty.toFixed(4)}</span>
                </div>
              ))}
            </div>
          ))}

        {activeTab === "Outcomes" && <p className="empty">No outcomes yet.</p>}
        {activeTab === "TWAP" && <p className="empty">No TWAP orders.</p>}
        {activeTab === "Trade history" && <p className="empty">No trades yet.</p>}
        {activeTab === "Funding" && <p className="empty">No funding payments.</p>}
      </div>
    </>
  );
};
