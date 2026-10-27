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
    id: "supercoin-staking",
    name: "Supercoin Staking",
    icon: "🪙",
    apy: "18.0%",
    apyNum: 18.0,
    tvl: "$8.4M",
    lockPeriod: "14 days",
    risk: "MEDIUM",
    minDeposit: 10,
    description: "Stake Supercoin tokens to earn platform fees and governance rights.",
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
  LOW: "var(--up)",
  MEDIUM: "var(--gold)",
  HIGH: "var(--down)",
};

const tagBg: Record<string, string> = {
  POPULAR: "#2196f3",
  "BEST APY": "var(--up)",
  HOT: "var(--down)",
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
      style={{
        padding: "0",
        background: "var(--surface)",
        border: "1px solid var(--ink)",
        borderRadius: "2px",
        overflow: "hidden",
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
          gap: "14px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: "24px",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg)",
            border: "1px solid var(--line)",
            borderRadius: "2px",
            flexShrink: 0,
          }}
        >
          {pool.icon}
        </div>

        {/* Name & description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700 }}>{pool.name}</span>
            {pool.tag && (
              <span
                style={{
                  background: tagBg[pool.tag] || "#000",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "2px",
                  letterSpacing: "0.03em",
                }}
              >
                {pool.tag}
              </span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--mute)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {pool.description}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "28px", alignItems: "center", flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "17px", fontWeight: 700, color: "var(--up)" }}>{pool.apy}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: "var(--mute)", marginTop: "2px", letterSpacing: "0.04em" }}>APY</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 600 }}>{pool.tvl}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: "var(--mute)", marginTop: "2px", letterSpacing: "0.04em" }}>TVL</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>{pool.lockPeriod}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: "var(--mute)", marginTop: "2px", letterSpacing: "0.04em" }}>LOCK</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 700, color: riskColor[pool.risk] }}>{pool.risk}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: "var(--mute)", marginTop: "2px", letterSpacing: "0.04em" }}>RISK</div>
          </div>
          <div style={{ color: "var(--mute)" }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expandable Deposit Panel */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--line)",
            padding: "20px",
            background: "var(--bg)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Deposit form */}
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px", color: "var(--mute)" }}>
              DEPOSIT AMOUNT
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input
                type="number"
                placeholder={`Min $${pool.minDeposit}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid var(--ink)",
                  borderRadius: "2px",
                  background: "var(--surface)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "14px",
                  color: "var(--ink)",
                }}
              />
              <button
                style={{
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                  background: "var(--gold)",
                  border: "1px solid var(--ink)",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
                onClick={() => setAmount(String(Math.floor(balance)))}
              >
                MAX
              </button>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--mute)", marginBottom: "14px" }}>
              Available: <b style={{ color: "var(--ink)" }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
            </div>

            {success ? (
              <div
                style={{
                  padding: "10px",
                  background: "var(--up)",
                  border: "1px solid var(--ink)",
                  borderRadius: "2px",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ★ DEPOSIT SUCCESSFUL! ★
              </div>
            ) : (
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.04em",
                  color: "#fff",
                  background: canDeposit ? "var(--up)" : "var(--mute)",
                  border: "1px solid var(--ink)",
                  borderRadius: "2px",
                  cursor: canDeposit && !depositing ? "pointer" : "not-allowed",
                  opacity: canDeposit ? 1 : 0.6,
                }}
                onClick={handleDeposit}
                disabled={!canDeposit || depositing}
              >
                {depositing ? "DEPOSITING..." : `DEPOSIT TO ${pool.name.toUpperCase()}`}
              </button>
            )}

            {parseFloat(amount) > 0 && parseFloat(amount) < pool.minDeposit && (
              <div style={{ marginTop: "8px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--down)" }}>
                Minimum deposit is ${pool.minDeposit}
              </div>
            )}
          </div>

          {/* Projected earnings */}
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px", color: "var(--mute)" }}>
              PROJECTED EARNINGS
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "2px",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {[
                { label: "Daily", value: dailyEarn },
                { label: "Monthly", value: monthlyEarn },
                { label: "Yearly", value: yearlyEarn },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--mute)" }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: "var(--up)" }}>
                    +${amtNum > 0 ? row.value.toFixed(2) : "0.00"}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600 }}>
                <span>APY</span>
                <span style={{ color: "var(--up)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{pool.apy}</span>
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
    <div style={{ padding: "24px", background: "var(--bg)", minHeight: "calc(100vh - 120px)", maxWidth: "1500px", margin: "0 auto" }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={20} color="var(--gold)" />
          EARN
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--mute)" }}>
          Put your assets to work. Earn yield through flexible savings, locked deposits and liquidity pools.
        </p>
      </div>

      {/* Global Stats Banner */}
      <div
        style={{
          background: "var(--red)",
          border: "1px solid var(--ink)",
          borderRadius: "2px",
          padding: "16px 20px",
          display: "flex",
          gap: "36px",
          marginBottom: "24px",
          color: "#fff",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: <Lock size={16} />, label: "TOTAL VALUE LOCKED", value: totalTVL },
          { icon: <TrendingUp size={16} />, label: "AVG APY", value: `${avgApy}%` },
          { icon: <Gift size={16} />, label: "ACTIVE POOLS", value: `${POOLS.length}` },
          { icon: <Shield size={16} />, label: "AUDITED & SECURE", value: "✓ VERIFIED" },
          { icon: <Star size={16} />, label: "YOUR BALANCE", value: `$${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
        ].map((stat, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ opacity: 0.85 }}>{stat.icon}</div>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, opacity: 0.8, marginBottom: "2px", letterSpacing: "0.04em" }}>{stat.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", marginRight: "4px", color: "var(--mute)" }}>RISK:</span>
        {(["ALL", "LOW", "MEDIUM", "HIGH"] as const).map((r) => (
          <button
            key={r}
            style={{
              padding: "4px 12px",
              fontSize: "11.5px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              borderRadius: "2px",
              border: "1px solid var(--ink)",
              background: filter === r ? "var(--gold)" : "var(--surface)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
            onClick={() => setFilter(r)}
          >
            {r}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "var(--mute)" }}>SORT:</span>
          <button
            style={{
              padding: "4px 10px",
              fontSize: "11.5px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              borderRadius: "2px",
              border: "1px solid var(--ink)",
              background: sortBy === "apy" ? "var(--gold)" : "var(--surface)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
            onClick={() => setSortBy("apy")}
          >
            APY ↓
          </button>
        </div>
      </div>

      {/* Pool Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((pool) => (
          <PoolCard key={pool.id} pool={pool} balance={balance} />
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: "24px",
          padding: "12px 16px",
          border: "1px solid var(--line)",
          borderRadius: "2px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--mute)",
          background: "var(--surface)",
        }}
      >
        ⚠️ <b>RISK DISCLAIMER:</b> Yield rates are variable and subject to market conditions. Past performance does not guarantee future returns. MEDIUM and HIGH risk pools carry significant risk of loss. Always invest only what you can afford to lose.
      </div>
    </div>
  );
};
