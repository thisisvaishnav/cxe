// src/components/EarnPage.tsx - Earn page with staking pools, yield vaults and rewards

import React, { useState } from "react";
import { Zap, Lock, Gift, ChevronDown, ChevronUp, TrendingUp, Shield, Star } from "lucide-react";

interface EarnPageProps {
  balance: number;
  onDepositSuccess: () => void;
}

interface Pool {
  id: string;
  name: string;
  icon: string;
  apy: string;
  apyNum: number;
  tvl: string;
  lockPeriod: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  tag?: string;
  minDeposit: number;
  description: string;
}

const POOLS: Pool[] = [
  {
    id: "usdc-flex",
    name: "USDC Flexible",
    icon: "💵",
    apy: "8.5%",
    apyNum: 8.5,
    tvl: "$142.4M",
    lockPeriod: "None",
    risk: "LOW",
    tag: "POPULAR",
    minDeposit: 1,
    description: "Earn yield on your idle USDC with no lock-up. Withdraw anytime. Auto-compounding daily.",
  },
  {
    id: "usdc-30",
    name: "USDC 30-Day Lock",
    icon: "🔒",
    apy: "14.2%",
    apyNum: 14.2,
    tvl: "$78.1M",
    lockPeriod: "30 days",
    risk: "LOW",
    tag: "BEST APY",
    minDeposit: 100,
    description: "Higher yield for committing to 30 days. Capital is locked for the duration.",
  },
  {
    id: "btc-lp",
    name: "BTC-USDC LP",
    icon: "₿",
    apy: "22.6%",
    apyNum: 22.6,
    tvl: "$31.5M",
    lockPeriod: "7 days",
    risk: "MEDIUM",
    tag: "HOT",
    minDeposit: 500,
    description: "Provide liquidity to the BTC/USDC trading pair and earn fees + incentives.",
  },
  {
    id: "btc-boost",
    name: "BTC Boost Vault",
    icon: "⚡",
    apy: "31.0%",
    apyNum: 31.0,
    tvl: "$12.8M",
    lockPeriod: "90 days",
    risk: "HIGH",
    tag: "HIGH RISK",
    minDeposit: 1000,
    description: "Leveraged BTC yield strategy. High reward potential with proportional risk exposure.",
  },
  {
    id: "cxe-staking",
    name: "CXE Token Staking",
    icon: "🪙",
    apy: "18.0%",
    apyNum: 18.0,
    tvl: "$8.4M",
    lockPeriod: "14 days",
    risk: "MEDIUM",
    minDeposit: 10,
    description: "Stake CXE tokens to earn platform fees and governance rights.",
  },
  {
    id: "eth-flex",
    name: "ETH Flexible",
    icon: "💎",
    apy: "6.2%",
    apyNum: 6.2,
    tvl: "$55.7M",
    lockPeriod: "None",
    risk: "LOW",
    minDeposit: 1,
    description: "Earn staking yield on your ETH holdings with no lock-up period.",
  },
];

const riskColor: Record<string, string> = {
  LOW: "var(--mario-green)",
  MEDIUM: "var(--mario-yellow)",
  HIGH: "var(--mario-red)",
};

const tagBg: Record<string, string> = {
  POPULAR: "var(--mario-blue)",
  "BEST APY": "var(--mario-green)",
  HOT: "var(--mario-red)",
  "HIGH RISK": "#9c27b0",
};

const PoolCard: React.FC<{ pool: Pool; balance: number }> = ({ pool, balance }) => {
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [success, setSuccess] = useState(false);

  const canDeposit = parseFloat(amount) >= pool.minDeposit && parseFloat(amount) <= balance;

  const handleDeposit = () => {
    if (!canDeposit) return;
    setDepositing(true);
    setTimeout(() => {
      setDepositing(false);
      setSuccess(true);
      setAmount("");
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  // Projected earnings
  const amtNum = parseFloat(amount) || 0;
  const dailyEarn = (amtNum * pool.apyNum) / 100 / 365;
  const monthlyEarn = dailyEarn * 30;
  const yearlyEarn = amtNum * (pool.apyNum / 100);

  return (
    <div
      className="nes-container"
      style={{
        padding: "0",
        transition: "box-shadow 0.15s",
        cursor: "pointer",
      }}
    >
      {/* Card Header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: "28px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0e8d0",
            border: "2px solid #000",
            flexShrink: 0,
          }}
        >
          {pool.icon}
        </div>

        {/* Name & description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontFamily: "var(--font-press-start)", fontSize: "10px" }}>{pool.name}</span>
            {pool.tag && (
              <span
                style={{
                  background: tagBg[pool.tag] || "#000",
                  color: "#fff",
                  fontFamily: "var(--font-press-start)",
                  fontSize: "6px",
                  padding: "2px 6px",
                  border: "1px solid #000",
                }}
              >
                {pool.tag}
              </span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {pool.description}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "32px", alignItems: "center", flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "16px", color: "var(--mario-green)" }}>{pool.apy}</div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "6px", color: "#888", marginTop: "2px" }}>APY</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "bold" }}>{pool.tvl}</div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "6px", color: "#888", marginTop: "2px" }}>TVL</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px" }}>{pool.lockPeriod}</div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "6px", color: "#888", marginTop: "2px" }}>LOCK</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "8px", color: riskColor[pool.risk] }}>{pool.risk}</div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "6px", color: "#888", marginTop: "2px" }}>RISK</div>
          </div>
          <div style={{ color: "#666" }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expandable Deposit Panel */}
      {expanded && (
        <div
          style={{
            borderTop: "3px solid #000",
            padding: "20px",
            background: "#fafafa",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Deposit form */}
          <div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "8px", marginBottom: "12px" }}>DEPOSIT AMOUNT</div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="number"
                className="nes-input"
                placeholder={`Min $${pool.minDeposit}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="nes-btn yellow"
                style={{ padding: "8px 12px", fontSize: "9px", whiteSpace: "nowrap" }}
                onClick={() => setAmount(String(Math.floor(balance)))}
              >
                MAX
              </button>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#666", marginBottom: "16px" }}>
              Available: <b>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
            </div>

            {success ? (
              <div
                style={{
                  padding: "12px",
                  background: "var(--mario-green)",
                  border: "2px solid #000",
                  color: "#fff",
                  fontFamily: "var(--font-press-start)",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                ★ DEPOSIT SUCCESSFUL! ★
              </div>
            ) : (
              <button
                className={`nes-btn ${canDeposit ? "green" : "disabled"}`}
                style={{ width: "100%", padding: "12px", fontSize: "10px" }}
                onClick={handleDeposit}
                disabled={!canDeposit || depositing}
              >
                {depositing ? "DEPOSITING..." : `DEPOSIT TO ${pool.name.toUpperCase()}`}
              </button>
            )}

            {parseFloat(amount) > 0 && parseFloat(amount) < pool.minDeposit && (
              <div style={{ marginTop: "8px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--mario-red)" }}>
                Minimum deposit is ${pool.minDeposit}
              </div>
            )}
          </div>

          {/* Projected earnings */}
          <div>
            <div style={{ fontFamily: "var(--font-press-start)", fontSize: "8px", marginBottom: "12px" }}>PROJECTED EARNINGS</div>
            <div
              style={{
                background: "#fff",
                border: "2px solid #000",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                { label: "Daily", value: dailyEarn },
                { label: "Monthly", value: monthlyEarn },
                { label: "Yearly", value: yearlyEarn },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                  <span style={{ color: "#666" }}>{row.label}</span>
                  <span style={{ fontWeight: "bold", color: "var(--mario-green)" }}>
                    +${amtNum > 0 ? row.value.toFixed(2) : "0.00"}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "2px dashed #ccc", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontFamily: "var(--font-press-start)", fontSize: "8px" }}>
                <span>APY</span>
                <span style={{ color: "var(--mario-green)" }}>{pool.apy}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const EarnPage: React.FC<EarnPageProps> = ({ balance }) => {
  const [filter, setFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [sortBy, setSortBy] = useState<"apy" | "tvl">("apy");

  // Total stats
  const totalTVL = "$329.9M";
  const avgApy = (POOLS.reduce((a, p) => a + p.apyNum, 0) / POOLS.length).toFixed(1);

  const filtered = POOLS.filter((p) => filter === "ALL" || p.risk === filter).sort((a, b) =>
    sortBy === "apy" ? b.apyNum - a.apyNum : 0
  );

  return (
    <div style={{ padding: "24px", background: "var(--bg-canvas)", minHeight: "calc(100vh - 180px)" }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-press-start)", fontSize: "16px", letterSpacing: "1px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Zap size={20} color="var(--mario-yellow)" />
          EARN
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "#666" }}>
          Put your assets to work. Earn yield through flexible savings, locked deposits and liquidity pools.
        </p>
      </div>

      {/* Global Stats Banner */}
      <div
        style={{
          background: "var(--mario-red)",
          border: "3px solid #000",
          boxShadow: "4px 4px 0 #000",
          padding: "20px 24px",
          display: "flex",
          gap: "40px",
          marginBottom: "24px",
          color: "#fff",
          alignItems: "center",
        }}
      >
        {[
          { icon: <Lock size={18} />, label: "TOTAL VALUE LOCKED", value: totalTVL },
          { icon: <TrendingUp size={18} />, label: "AVG APY", value: `${avgApy}%` },
          { icon: <Gift size={18} />, label: "ACTIVE POOLS", value: `${POOLS.length}` },
          { icon: <Shield size={18} />, label: "AUDITED & SECURE", value: "✓ VERIFIED" },
          { icon: <Star size={18} />, label: "YOUR BALANCE", value: `$${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
        ].map((stat, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ opacity: 0.8 }}>{stat.icon}</div>
            <div>
              <div style={{ fontFamily: "var(--font-press-start)", fontSize: "6px", opacity: 0.7, marginBottom: "4px" }}>{stat.label}</div>
              <div style={{ fontFamily: "var(--font-press-start)", fontSize: "12px" }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-press-start)", fontSize: "8px", marginRight: "4px" }}>RISK:</span>
        {(["ALL", "LOW", "MEDIUM", "HIGH"] as const).map((r) => (
          <button
            key={r}
            className={`nes-btn ${filter === r ? "yellow" : ""}`}
            style={{ padding: "4px 12px", fontSize: "8px" }}
            onClick={() => setFilter(r)}
          >
            {r}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "var(--font-press-start)", fontSize: "8px" }}>SORT:</span>
          <button
            className={`nes-btn ${sortBy === "apy" ? "yellow" : ""}`}
            style={{ padding: "4px 10px", fontSize: "8px" }}
            onClick={() => setSortBy("apy")}
          >
            APY ↓
          </button>
        </div>
      </div>

      {/* Pool Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((pool) => (
          <PoolCard key={pool.id} pool={pool} balance={balance} />
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: "24px",
          padding: "12px 16px",
          border: "2px dashed #ccc",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "#888",
          background: "#f8f5ee",
        }}
      >
        ⚠️ <b>RISK DISCLAIMER:</b> Yield rates are variable and subject to market conditions. Past performance does not guarantee future returns. MEDIUM and HIGH risk pools carry significant risk of loss. Always invest only what you can afford to lose.
      </div>
    </div>
  );
};
