// src/components/Layout.tsx - Header, Ticker, and Footer components

import React from "react";
import { Bell, Globe, Settings, LogOut } from "lucide-react";

interface HeaderProps {
  username: string | null;
  onLogout: () => void;
  wsStatus: "disconnected" | "connecting" | "connected" | "error";
  balance: number;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout, wsStatus, balance }) => {
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
          color: "#ffffff"
        }}
      >
        {/* Logo */}
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

        {/* Navigation Items - Desktop */}
        <nav 
          style={{ 
            display: "flex", 
            gap: "20px", 
            fontFamily: "var(--font-press-start)", 
            fontSize: "9px"
          }}
          className="nav-links"
        >
          <a href="#" style={{ color: "var(--mario-yellow)", textDecoration: "none" }}>Trade</a>
          <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Portfolio</a>
          <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Earn</a>
          <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Vaults</a>
          <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Staking</a>
          <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Referrals</a>
          <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Leaderboard</a>
        </nav>

        {/* Wallet & Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {username && (
            <div 
              style={{ 
                background: "var(--mario-green)", 
                border: "2px solid #000000", 
                padding: "var(--header-box-padding, 6px 12px)", 
                fontSize: "var(--header-box-font-size, 12px)", 
                fontFamily: "var(--font-press-start)", 
                color: "#ffffff",
                boxShadow: "2px 2px 0px #000000",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <div 
                style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: wsStatus === "connected" ? "var(--mario-yellow)" : "#ffffff",
                  animation: wsStatus === "connecting" ? "pulse 1s infinite" : "none"
                }}
              />
              {username.toUpperCase()}
            </div>
          )}

          {username && (
            <div 
              style={{ 
                background: "var(--mario-yellow)", 
                border: "2px solid #000000", 
                padding: "var(--header-box-padding, 6px 12px)", 
                fontSize: "var(--header-box-font-size, 12px)", 
                fontFamily: "var(--font-press-start)", 
                color: "#000000",
                boxShadow: "2px 2px 0px #000000",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              🪙 ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          )}

          <button 
            className="nes-btn" 
            onClick={onLogout}
            style={{ 
              padding: "4px 8px", 
              boxShadow: "2px 2px 0px #000000", 
              border: "2px solid #000000",
              fontSize: "10px",
              background: "#ffffff"
            }}
            title="Log Out"
          >
            <LogOut size={12} />
          </button>

          <div style={{ display: "flex", gap: "8px", color: "#ffffff" }}>
            <Bell size={16} style={{ cursor: "pointer" }} />
            <Globe size={16} style={{ cursor: "pointer" }} />
            <Settings size={16} style={{ cursor: "pointer" }} />
          </div>
        </div>
      </div>
      
      {/* Ticker Banner */}
      <div className="retro-ticker">
        <div className="retro-ticker-content">
          ★ WELCOME TO SUPERCOIN! PRESS START - GET STARTED HERE. ★ PLACING A LIMIT ORDER LOCKS FUNDS IMMEDIATELY. ★ LATEST PRICE ALIGNMENT POWERED BY BINANCE PRICE ORACLE DATA FEED. ★
        </div>
      </div>
    </header>
  );
};

interface FooterProps {
  wsStatus: "disconnected" | "connecting" | "connected" | "error";
  lastUpdate: string | null;
}

export const Footer: React.FC<FooterProps> = ({ wsStatus, lastUpdate }) => {
  const getStatusColor = () => {
    switch (wsStatus) {
      case "connected": return "var(--mario-yellow)";
      case "connecting": return "#ffeb3b";
      case "error": return "#ff1744";
      default: return "#ffffff";
    }
  };

  const getStatusText = () => {
    switch (wsStatus) {
      case "connected": return "1-UP ONLINE";
      case "connecting": return "1-UP CONNECTING";
      case "error": return "1-UP CONNECTION ERROR";
      default: return "1-UP OFFLINE";
    }
  };

  return (
    <footer 
      style={{ 
        background: "var(--mario-green)", 
        borderTop: "3px solid #000000", 
        padding: "8px 20px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        color: "#ffffff",
        fontFamily: "var(--font-press-start)",
        fontSize: "9px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span 
          style={{ 
            display: "inline-block", 
            width: "8px", 
            height: "8px", 
            background: getStatusColor(),
            border: "1px solid #000000",
            boxShadow: "1px 1px 0px #000000"
          }} 
        />
        <span>{getStatusText()}</span>
        {lastUpdate && (
          <span style={{ color: "rgba(255, 255, 255, 0.7)", marginLeft: "10px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            (Last P&L tick: {lastUpdate})
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Docs</a>
        <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Support</a>
        <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Terms</a>
        <a href="#" style={{ color: "#ffffff", textDecoration: "none" }}>Privacy Policy</a>
      </div>
    </footer>
  );
};
