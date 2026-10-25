// src/components/Layout.tsx - Header, Ticker, and Footer components

import React from "react";
import { Bell, Globe, Settings, LogOut } from "lucide-react";

export type Page = "trade" | "portfolio" | "earn" | "landing";

interface HeaderProps {
  username: string | null;
  onLogout: () => void;
  wsStatus: "disconnected" | "connecting" | "connected" | "error";
  balance: number;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout, wsStatus, balance, activePage, onNavigate }) => {
  return (
    <header className="pixel-corners" style={{ borderBottom: "3px solid #000000" }}>
      {/* Sign-in Bonus Banner */}
      {username && (
        <div 
          style={{ 
            background: "var(--mario-yellow)", 
            color: "#000000", 
            padding: "var(--header-banner-padding, 8px 20px)", 
            textAlign: "center", 
            fontFamily: "var(--font-press-start)", 
            fontSize: "var(--header-banner-font-size, 10px)", 
            borderBottom: "2px solid #000000",
            letterSpacing: "1px",
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.1)"
          }}
        >
          ★ 1-UP! SIGN-IN BONUS: $50,000.00 USD HAS BEEN CREDITED TO YOUR BALANCE ★
        </div>
      )}
      {/* Top Red Bar */}
      <div 
        style={{ 
          background: "var(--mario-red)", 
          padding: "var(--header-padding, 10px 20px)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div 
            style={{ 
              background: "#ffffff", 
              color: "var(--mario-red)", 
              fontFamily: "var(--font-press-start)", 
              fontSize: "var(--header-logo-font-size, 14px)", 
              padding: "var(--header-logo-padding, 6px 8px)", 
              border: "2px solid #000000",
              fontWeight: "bold",
              boxShadow: "2px 2px 0px #000000"
            }}
          >
            M
          </div>
          <span 
            style={{ 
              fontFamily: "var(--font-press-start)", 
              fontSize: "var(--header-title-font-size, 18px)", 
              color: "var(--mario-yellow)",
              textShadow: "2px 2px 0px #000000",
              letterSpacing: "1px"
            }}
          >
            SUPERCOIN
          </span>
        </div>

        {/* Navigation Items */}
        <nav 
          style={{ 
            display: "flex", 
            gap: "4px", 
            fontFamily: "var(--font-press-start)", 
            fontSize: "9px"
          }}
          className="nav-links"
        >
          {(["trade", "portfolio", "earn", "landing"] as Page[]).map((page) => {
            const isActive = activePage === page;
            const labels: Record<Page, string> = { trade: "Trade", portfolio: "Portfolio", earn: "Earn", landing: "Showcase" };
            return (
              <button
                key={page}
                id={`nav-${page}`}
                onClick={() => onNavigate(page)}
                style={{
                  background: isActive ? "var(--mario-yellow)" : "transparent",
                  color: isActive ? "#000000" : "#ffffff",
                  border: isActive ? "2px solid #000" : "2px solid transparent",
                  padding: "6px 14px",
                  fontFamily: "var(--font-press-start)",
                  fontSize: "9px",
                  cursor: "pointer",
                  boxShadow: isActive ? "2px 2px 0 #000" : "none",
                  transition: "background 0.12s, color 0.12s",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {labels[page]}
              </button>
            );
          })}
        </nav>

        {/* User stats & logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {username && (
            <div 
              style={{ 
                background: "var(--bg-canvas)", 
                border: "2px solid #000000",
                padding: "var(--header-box-padding, 6px 12px)",
                fontFamily: "var(--font-press-start)",
                fontSize: "var(--header-box-font-size, 12px)",
                display: "flex",
                gap: "8px",
                boxShadow: "2px 2px 0px #000000"
              }}
            >
              <span style={{ color: "var(--mario-green)" }}>COINS:</span>
              <span>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span 
              style={{ 
                fontFamily: "var(--font-press-start)", 
                fontSize: "10px", 
                color: "#ffffff",
                background: "#000000",
                padding: "6px 10px",
                border: "1px solid #ffffff"
              }}
            >
              {username || "TRADER"}
            </span>

            <button 
              onClick={onLogout}
              className="nes-btn nes-btn-yellow"
              style={{ padding: "6px 10px", fontSize: "10px" }}
              title="Logout"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Header Yellow Ticker Bar */}
      <div 
        style={{ 
          background: "var(--mario-yellow)", 
          padding: "6px 20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderTop: "2px solid #000000",
          fontFamily: "var(--font-mono)",
          fontSize: "14px"
        }}
      >
        <div style={{ display: "flex", gap: "24px" }}>
          <span><strong>STAGE:</strong> WORLD 1-1</span>
          <span><strong>MARKET:</strong> BTC/USD (LIVE)</span>
          <span><strong>24H HIGH:</strong> $68,400.00</span>
          <span><strong>24H LOW:</strong> $65,120.00</span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div 
              style={{ 
                width: "8px", 
                height: "8px", 
                backgroundColor: wsStatus === "connected" ? "var(--mario-green)" : "var(--mario-red)",
                border: "1px solid #000000"
              }} 
            />
            <span style={{ fontSize: "12px", textTransform: "uppercase" }}>{wsStatus}</span>
          </div>
          <Bell size={14} style={{ cursor: "pointer" }} />
          <Globe size={14} style={{ cursor: "pointer" }} />
          <Settings size={14} style={{ cursor: "pointer" }} />
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC<{ wsStatus: string; lastUpdate: string | null }> = ({ wsStatus, lastUpdate }) => {
  return (
    <footer 
      style={{ 
        background: "var(--bg-dark)", 
        color: "#ffffff", 
        padding: "8px 20px", 
        borderTop: "var(--border-retro)",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "12px"
      }}
    >
      <div>SUPERCOIN EXCHANGE v1.0.4 | ENGINE: MEMORY-MAPPED BOOK</div>
      <div style={{ display: "flex", gap: "16px" }}>
        <span>FEED: {wsStatus.toUpperCase()}</span>
        {lastUpdate && <span>LAST SYNC: {new Date(lastUpdate).toLocaleTimeString()}</span>}
      </div>
    </footer>
  );
};
