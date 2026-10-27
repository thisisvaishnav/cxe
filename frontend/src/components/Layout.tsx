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
      <span
        className="logo px"
        onClick={() => onNavigate("trade")}
        style={{ cursor: "pointer" }}
      >
        SUPERCOIN
      </span>

      <nav aria-label="Main">
        <button
          aria-current={activePage === "trade" ? "page" : undefined}
          onClick={() => onNavigate("trade")}
        >
          Trade
        </button>
        <button
          aria-current={activePage === "portfolio" ? "page" : undefined}
          onClick={() => onNavigate("portfolio")}
        >
          Portfolio
        </button>
        <button
          aria-current={activePage === "earn" ? "page" : undefined}
          onClick={() => onNavigate("earn")}
        >
          Earn
        </button>
      </nav>

      <div className="acct">
        <span>
          Coins{" "}
          <b>
            $
            {balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </b>
        </span>

        {isSignedIn && username ? (
          <>
            <span className="user">{username}</span>
            <button
              aria-label="Sign out"
              onClick={onLogout}
              title="Sign out"
              style={{ fontSize: "16px", lineHeight: 1 }}
            >
              ⏻
            </button>
          </>
        ) : onSignIn ? (
          <button
            onClick={onSignIn}
            style={{
              color: "var(--gold)",
              fontSize: "14px",
              padding: "4px 10px",
              border: "1px solid var(--gold)",
              borderRadius: "2px",
            }}
          >
            Sign in
          </button>
        ) : null}
      </div>
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
      <span>Supercoin Exchange v1.0.4</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            display: "inline-block",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: isOnline ? "var(--up)" : "var(--down)",
          }}
        />
        {isOnline ? "Feed connected" : "Feed disconnected"} · Last sync {timeString}
      </span>
    </footer>
  );
};
