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

          <a
            href="https://github.com/thisisvaishnav/supercoin"
            target="_blank"
            rel="noreferrer"
            className="github-header-link"
            title="View on GitHub"
            aria-label="GitHub Repository"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
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
