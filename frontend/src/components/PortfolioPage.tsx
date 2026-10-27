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
      <circle cx={cx} cy={cy} r={r * 0.52} fill="var(--surface)" />
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
    { pct: (usdcVal / total) * 100, color: "#2196f3", label: "USDC" },
    { pct: (btcValue / total) * 100, color: "var(--gold)", label: "BTC" },
  ].filter((s) => s.pct > 0);
  if (slices.length === 0) slices.push({ pct: 100, color: "#2196f3", label: "USDC" });

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
    <div style={{ padding: "24px", background: "var(--bg)", minHeight: "calc(100vh - 120px)", maxWidth: "1500px", margin: "0 auto" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px" }}>
            MY PORTFOLIO
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--mute)" }}>
            Overview of your holdings, performance, and history
          </p>
        </div>
        <div
          style={{
            background: "var(--red)",
            border: "1px solid var(--ink)",
            borderRadius: "2px",
            padding: "6px 12px",
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.04em",
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
            icon: <Wallet size={18} />,
            label: "TOTAL EQUITY",
            value: `$${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `Incl. unrealised P&L`,
            color: "var(--ink)",
          },
          {
            icon: <BarChart2 size={18} />,
            label: "CASH BALANCE",
            value: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: "Available to trade",
            color: "var(--up)",
          },
          {
            icon: totalUnrPnL >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
            label: "UNREALISED P&L",
            value: `${totalUnrPnL >= 0 ? "+" : ""}$${totalUnrPnL.toFixed(2)}`,
            sub: `Across ${positions.length} open position${positions.length !== 1 ? "s" : ""}`,
            color: totalUnrPnL >= 0 ? "var(--up)" : "var(--down)",
          },
          {
            icon: <Activity size={18} />,
            label: "7-DAY RETURN",
            value: `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%`,
            sub: `Since Jun 1`,
            color: pctChange >= 0 ? "var(--up)" : "var(--down)",
          },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              padding: "16px",
              background: "var(--surface)",
              border: "1px solid var(--ink)",
              borderRadius: "2px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ color: card.color, marginBottom: "4px" }}>{card.icon}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {card.label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 700, color: card.color, letterSpacing: "-0.01em" }}>
              {card.value}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--mute)" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Middle Section: Chart + Pie */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px" }}>

        {/* Equity Chart */}
        <div style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--ink)", borderRadius: "2px" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>EQUITY OVER TIME (7D)</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: pctChange >= 0 ? "var(--up)" : "var(--down)" }}>
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
                      background: isLast ? "var(--gold)" : pt.value > startVal ? "var(--up)" : "var(--down)",
                      border: "1px solid var(--ink)",
                      borderRadius: "1px",
                      transition: "height 0.3s ease",
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--mute)" }}>{pt.date.replace("Jun ", "")}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "14px", display: "flex", gap: "20px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--mute)", borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
            <span>Start: <b style={{ color: "var(--ink)" }}>${startVal.toLocaleString()}</b></span>
            <span>Current: <b style={{ color: "var(--up)" }}>${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b></span>
            <span>Change: <b style={{ color: pctChange >= 0 ? "var(--up)" : "var(--down)" }}>{pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%</b></span>
          </div>
        </div>

        {/* Allocation Pie */}
        <div style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--ink)", borderRadius: "2px", minWidth: "220px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "12px", textAlign: "center" }}>ALLOCATION</div>
          <DonutChart slices={slices} />
          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
            {slices.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                <div style={{ width: "10px", height: "10px", background: s.color, border: "1px solid var(--ink)", borderRadius: "1px", flexShrink: 0 }} />
                <span>{s.label}</span>
                <span style={{ marginLeft: "auto", fontWeight: 600 }}>{s.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div style={{ padding: "0", background: "var(--surface)", border: "1px solid var(--ink)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", padding: "14px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg)", display: "flex", alignItems: "center", gap: "8px" }}>
          <PieChart size={15} /> MY ASSETS
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--mute)", fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                <th style={{ padding: "10px 16px" }}>ASSET</th>
                <th style={{ padding: "10px 16px" }}>BALANCE</th>
                <th style={{ padding: "10px 16px" }}>PRICE</th>
                <th style={{ padding: "10px 16px" }}>VALUE</th>
                <th style={{ padding: "10px 16px" }}>24H CHANGE</th>
                <th style={{ padding: "10px 16px" }}>7D TREND</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.coin} style={{ borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{a.icon}</span>
                      <span style={{ fontWeight: 600, fontFamily: "var(--font-sans)", fontSize: "13px" }}>{a.coin}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px" }}>{a.balance}</td>
                  <td style={{ padding: "10px 16px" }}>{a.price}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 600 }}>{a.value}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ color: a.positive ? "var(--up)" : "var(--down)", fontWeight: 600 }}>
                      {a.change}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <Sparkline data={a.spark} color={a.positive ? "var(--up)" : "var(--down)"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assets.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--mute)" }}>
            NO ASSETS YET. GO TO TRADE TO GET STARTED!
          </div>
        )}
      </div>
    </div>
  );
};
