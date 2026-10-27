// src/components/Layout.tsx - Clean Supercoin Header and Footer components

import React, { useState, useEffect } from "react";

export type Page = "trade" | "portfolio" | "earn" | "landing";

interface HeaderProps {
  username: string | null;
  onLogout: () => void;
  onSignIn?: () => void;
  isSignedIn?: boolean;
  wsStatus: "disconnected" | "connecting" | "connected" | "error";
  balance: number;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({
  username,
  onLogout,
  onSignIn,
  isSignedIn = true,
  balance,
  activePage,
  onNavigate,
}) => {
  return (
    <header className="supercoin-header">
      <div className="header-top-row">
        <span
          className="logo px"
          onClick={() => onNavigate("trade")}
          style={{ cursor: "pointer" }}
          aria-label="Supercoin Home"
        >
          SUPERCOIN
        </span>

        <div className="header-right">
          <div className="balance-badge" title="Available Cash Balance">
            <span className="badge-label">Coins</span>
            <strong className="badge-amount">
              $
              {balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>

          {isSignedIn && username ? (
            <div className="user-menu">
              <span className="user-name">{username}</span>
              <button
                aria-label="Sign out"
                onClick={onLogout}
                title="Sign out"
                className="signout-button"
              >
                ⏻
              </button>
            </div>
          ) : onSignIn ? (
            <button onClick={onSignIn} className="signin-button">
              Sign in
            </button>
          ) : null}
        </div>
      </div>

      <nav aria-label="Main navigation" className="header-nav">
        <button
          aria-current={activePage === "trade" ? "page" : undefined}
          onClick={() => onNavigate("trade")}
          className="nav-link"
        >
          Trade
        </button>
        <button
          aria-current={activePage === "portfolio" ? "page" : undefined}
          onClick={() => onNavigate("portfolio")}
          className="nav-link"
        >
          Portfolio
        </button>
        <button
          aria-current={activePage === "earn" ? "page" : undefined}
          onClick={() => onNavigate("earn")}
          className="nav-link"
        >
          Earn
        </button>
      </nav>
    </header>
  );
};

export const Footer: React.FC<{
  wsStatus: "disconnected" | "connecting" | "connected" | "error";
  lastUpdate: Date | string | null;
}> = ({ wsStatus, lastUpdate }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString =
    typeof lastUpdate === "string"
      ? lastUpdate
      : (lastUpdate || now).toLocaleTimeString();
  const isOnline = wsStatus === "connected";

  return (
    <footer className="supercoin-footer">
      <div className="footer-left">
        <span>Supercoin Exchange v1.0.5</span>
        <span className="footer-separator">•</span>
        <span>BTC/USDT Perpetual</span>
      </div>

      <div className="footer-right">
        <span className="status-indicator">
          <span
            className={`status-dot ${isOnline ? "online" : "connecting"}`}
          />
          {wsStatus === "connected"
            ? "WebSocket connected"
            : wsStatus === "connecting"
            ? "Connecting..."
            : "Reconnecting..."}
        </span>
        <span className="footer-separator">•</span>
        <span className="last-update">{timeString}</span>
      </div>
    </footer>
  );
};
