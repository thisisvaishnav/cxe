// src/components/PortfolioPage.tsx - Portfolio overview page

import React from "react";
import type { Position } from "../lib/api.js";
import type { PnLSnapshot } from "../hooks/useWebSocket.js";
import { TrendingUp, TrendingDown, Wallet, BarChart2, PieChart, Activity } from "lucide-react";

interface PortfolioPageProps {
  balance: number;
  positions: Position[];
  pnlUpdates: Record<string, PnLSnapshot>;
}

// Sparkline mini chart using SVG
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const w = 120;
  const h = 40;
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
};

// Mock sparkline history generator
const makeSpark = (seed: number, len = 20) => {
  const arr: number[] = [];
  let v = seed;
  for (let i = 0; i < len; i++) {
    v = v + (Math.random() - 0.48) * seed * 0.04;
    arr.push(v);
  }
  return arr;
};

// Donut chart via SVG
const DonutChart: React.FC<{ slices: { pct: number; color: string; label: string }[] }> = ({ slices }) => {
  const r = 60;
  const cx = 80;
  const cy = 80;
  let cursor = -90;
  const paths: React.ReactNode[] = [];
  slices.forEach((s, i) => {
    const angle = (s.pct / 100) * 360;
    const start = (cursor * Math.PI) / 180;
    const end = ((cursor + angle) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const lg = angle > 180 ? 1 : 0;
    paths.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} Z`}
        fill={s.color}
        stroke="#ffffff"
        strokeWidth="2"
      />
    );
    cursor += angle;
  });
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {paths}
      <circle cx={cx} cy={cy} r={r * 0.52} fill="var(--bg-card)" />
    </svg>
  );
};

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ balance, positions, pnlUpdates }) => {
  // Compute total unrealised PnL
  const totalUnrPnL = positions.reduce((acc, pos) => {
    const ws = pnlUpdates[pos.symbol];
    return acc + (ws ? ws.unrealizedPnL : 0);
  }, 0);

  const totalEquity = balance + totalUnrPnL;
  const btcPrice = pnlUpdates["BTCUSDT"]?.currentPrice ?? 67000;

  // Fake historical mock (since backend doesn't expose it)
  const mockHistory = [
    { date: "Jun 1", value: 48200 },
    { date: "Jun 2", value: 49100 },
    { date: "Jun 3", value: 47800 },
    { date: "Jun 4", value: 51200 },
    { date: "Jun 5", value: 50100 },
    { date: "Jun 6", value: 52400 },
    { date: "Jun 7", value: totalEquity },
  ];

  const startVal = 48200;
  const pctChange = ((totalEquity - startVal) / startVal) * 100;

  // Pie slices
  const btcValue = positions.find((p) => p.symbol === "BTCUSDT")
    ? Math.abs(positions.find((p) => p.symbol === "BTCUSDT")!.qty) * btcPrice
    : 0;
  const usdcVal = balance;
  const total = usdcVal + btcValue || 1;
  const slices = [
    { pct: (usdcVal / total) * 100, color: "var(--mario-blue)", label: "USDC" },
    { pct: (btcValue / total) * 100, color: "var(--mario-yellow)", label: "BTC" },
  ].filter((s) => s.pct > 0);
  if (slices.length === 0) slices.push({ pct: 100, color: "var(--mario-blue)", label: "USDC" });

  // Asset rows
  const assets = [
    {
      coin: "USDC",
      icon: "💵",
      balance: balance.toFixed(2),
      price: "$1.00",
      value: `$${balance.toFixed(2)}`,
      change: "+0.00%",
      positive: true,
      spark: makeSpark(1, 20),
      color: "#2196f3",
    },
    ...(btcValue > 0
      ? [
          {
            coin: "BTC",
            icon: "₿",
            balance: positions.find((p) => p.symbol === "BTCUSDT")
              ? Math.abs(positions.find((p) => p.symbol === "BTCUSDT")!.qty).toFixed(4)
              : "0",
            price: `$${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            value: `$${btcValue.toFixed(2)}`,
            change: totalUnrPnL >= 0 ? `+${((totalUnrPnL / (btcValue || 1)) * 100).toFixed(2)}%` : `${((totalUnrPnL / (btcValue || 1)) * 100).toFixed(2)}%`,
            positive: totalUnrPnL >= 0,
            spark: makeSpark(btcPrice, 20),
            color: "#f7931a",
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: "24px", background: "var(--bg-canvas)", minHeight: "calc(100vh - 180px)" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-press-start)", fontSize: "16px", letterSpacing: "1px", marginBottom: "6px" }}>
            MY PORTFOLIO
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "#666" }}>
            Overview of your holdings, performance, and history
          </p>
        </div>
        <div
          style={{
            background: "var(--mario-red)",
            border: "3px solid #000",
            boxShadow: "4px 4px 0 #000",
            padding: "8px 16px",
            fontFamily: "var(--font-press-start)",
            fontSize: "9px",
            color: "#fff",
            cursor: "default",
          }}
        >
          LIVE DATA
        </div>
      </div>

      {/* Top KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          {
            icon: <Wallet size={20} />,
            label: "TOTAL EQUITY",
            value: `$${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `Incl. unrealised P&L`,
            color: "var(--mario-blue)",
          },
          {
            icon: <BarChart2 size={20} />,
            label: "CASH BALANCE",
            value: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: "Available to trade",
            color: "var(--mario-green)",
          },
          {
            icon: totalUnrPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
            label: "UNREALISED P&L",
            value: `${totalUnrPnL >= 0 ? "+" : ""}$${totalUnrPnL.toFixed(2)}`,
            sub: `Across ${positions.length} open position${positions.length !== 1 ? "s" : ""}`,
            color: totalUnrPnL >= 0 ? "var(--mario-green)" : "var(--mario-red)",
          },
          {
            icon: <Activity size={20} />,
            label: "7-DAY RETURN",
            value: `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%`,
            sub: `Since Jun 1`,
            color: pctChange >= 0 ? "var(--mario-green)" : "var(--mario-red)",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="nes-container"
            style={{ padding: "16px", gap: "6px" }}
          >
            <div style={{ color: card.color, marginBottom: "8px" }}>{card.icon}</div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "7px", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>
              {card.label}
            </div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "13px", color: card.color, marginBottom: "4px" }}>
              {card.value}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#666" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Middle Section: Chart + Pie */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px" }}>

        {/* Equity Chart */}
        <div className="nes-container" style={{ padding: "20px" }}>
          <div style={{ fontFamily: "var(--font-press-start)", fontSize: "9px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>EQUITY OVER TIME (7D)</span>
            <span style={{ color: pctChange >= 0 ? "var(--mario-green)" : "var(--mario-red)" }}>
              {pctChange >= 0 ? "▲" : "▼"} {Math.abs(pctChange).toFixed(2)}%
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
            {mockHistory.map((pt, i) => {
              const maxV = Math.max(...mockHistory.map((h) => h.value));
              const minV = Math.min(...mockHistory.map((h) => h.value));
              const pct = ((pt.value - minV) / (maxV - minV || 1)) * 100;
              const barH = Math.max(pct, 8);
              const isLast = i === mockHistory.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${barH}%`,
                      minHeight: "8px",
                      background: isLast ? "var(--mario-yellow)" : pt.value > startVal ? "var(--mario-green)" : "var(--mario-red)",
                      border: "2px solid #000",
                      boxShadow: isLast ? "2px 2px 0 #000" : "none",
                      transition: "height 0.3s ease",
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-press-start)", fontSize: "6px", color: "#666" }}>{pt.date.replace("Jun ", "")}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#666" }}>
            <span>Start: <b>${startVal.toLocaleString()}</b></span>
            <span>Current: <b style={{ color: "var(--mario-green)" }}>${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b></span>
            <span>Change: <b style={{ color: pctChange >= 0 ? "var(--mario-green)" : "var(--mario-red)" }}>{pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%</b></span>
          </div>
        </div>

        {/* Allocation Pie */}
        <div className="nes-container" style={{ padding: "20px", minWidth: "220px", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-press-start)", fontSize: "9px", marginBottom: "12px", textAlign: "center" }}>ALLOCATION</div>
          <DonutChart slices={slices} />
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
            {slices.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                <div style={{ width: "12px", height: "12px", background: s.color, border: "2px solid #000", flexShrink: 0 }} />
                <span>{s.label}</span>
                <span style={{ marginLeft: "auto", fontWeight: "bold" }}>{s.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="nes-container" style={{ padding: "0" }}>
        <div style={{ fontFamily: "var(--font-press-start)", fontSize: "9px", padding: "16px 20px", borderBottom: "3px solid #000", background: "#f0e8d0", display: "flex", alignItems: "center", gap: "8px" }}>
          <PieChart size={14} /> MY ASSETS
        </div>
        <div className="retro-table-container" style={{ border: "none" }}>
          <table className="retro-table">
            <thead>
              <tr>
                <th>ASSET</th>
                <th>BALANCE</th>
                <th>PRICE</th>
                <th>VALUE</th>
                <th>24H CHANGE</th>
                <th>7D TREND</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.coin}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "20px" }}>{a.icon}</span>
                      <span style={{ fontWeight: "bold", fontFamily: "var(--font-press-start)", fontSize: "10px" }}>{a.coin}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{a.balance}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{a.price}</td>
                  <td style={{ fontFamily: "var(--font-press-start)", fontSize: "11px" }}>{a.value}</td>
                  <td>
                    <span style={{ color: a.positive ? "var(--mario-green)" : "var(--mario-red)", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
                      {a.change}
                    </span>
                  </td>
                  <td>
                    <Sparkline data={a.spark} color={a.positive ? "#388e3c" : "#d32f2f"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assets.length === 0 && (
          <div style={{ padding: "60px", textAlign: "center", fontFamily: "var(--font-press-start)", fontSize: "10px", color: "#888" }}>
            NO ASSETS YET. GO TO TRADE TO GET STARTED!
          </div>
        )}
      </div>
    </div>
  );
};
