// src/App.tsx - Connects Auth and Trading Dashboard components together

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/react";
import { AuthScreen } from "./components/AuthScreen.js";
import { Header, Footer } from "./components/Layout.js";
import { PriceChart } from "./components/PriceChart.js";
import { OrderBook } from "./components/OrderBook.js";
import { OrderForm } from "./components/OrderForm.js";
import { PositionsTable } from "./components/PositionsTable.js";
import { PortfolioPage } from "./components/PortfolioPage.js";
import { EarnPage } from "./components/EarnPage.js";
import { api } from "./lib/api.js";
import type { Position } from "./lib/api.js";
import { useWebSocket } from "./hooks/useWebSocket.js";
import type { Page } from "./components/Layout.js";

/* ─── App with Clerk Authentication ─── */
function AppWithClerk() {
  const { isSignedIn, isLoaded, getToken, signOut } = useAuth();
  const { user } = useUser();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cxe_token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("cxe_username"));
  const [balance, setBalance] = useState<number>(50000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activePage, setActivePage] = useState<Page>("trade");

  // Keep Clerk token and user identity synchronized
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      let isMounted = true;
      (async () => {
        try {
          const clerkToken = await getToken();
          const email = user.primaryEmailAddress?.emailAddress;
          const displayName =
            user.username ||
            user.fullName ||
            (email ? email.split("@")[0] : null) ||
            "TRADER";

          if (isMounted) {
            setUsername(displayName);
            localStorage.setItem("cxe_username", displayName);
            localStorage.setItem("cxe_userId", user.id);
            if (clerkToken) {
              setToken(clerkToken);
              localStorage.setItem("cxe_token", clerkToken);
            }
          }

          // Optional backend user sync & balance loading
          if (clerkToken) {
            try {
              const res = await api.syncUser(clerkToken, email, displayName);
              if (isMounted && res) {
                if (res.username) setUsername(res.username);
                if (res.balance !== undefined && !isNaN(res.balance)) {
                  setBalance(res.balance);
                }
              }
            } catch (err) {
              console.warn("Backend sync offline/deferred:", err);
            }
          }
        } catch (err) {
          console.error("Clerk session resolution error:", err);
        }
      })();

      return () => {
        isMounted = false;
      };
    } else if (!isSignedIn) {
      setToken(null);
      setUsername(null);
      localStorage.removeItem("cxe_token");
      localStorage.removeItem("cxe_username");
      localStorage.removeItem("cxe_userId");
    }
  }, [isSignedIn, isLoaded, user, getToken]);

  // Hook up WebSocket
  const { status: wsStatus, pnlUpdates, lastUpdate, prices } = useWebSocket(token);

  // Fetch balances & positions from backend if available
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const balanceData = await api.getBalance();
      if (balanceData && typeof balanceData.balance === "number") {
        setBalance(balanceData.balance);
      }

      const positionsData = await api.getPositions();
      if (positionsData && Array.isArray(positionsData.positions)) {
        setPositions(positionsData.positions);
      }
    } catch (err) {
      // Do not log out on network/backend offline errors
      console.warn("Account polling deferred:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [token, fetchData]);

  const handleLogout = () => {
    api.logout();
    void signOut();
    setToken(null);
    setUsername(null);
    setPositions([]);
    setActivePage("trade");
  };

  const handleOrderSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    fetchData();
  };

  const handleDepositSuccess = () => {
    fetchData();
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0a0a1a",
          color: "#f1c40f",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "14px",
        }}
      >
        ★ LOADING SUPERCOIN...
      </div>
    );
  }

  // Not signed in -> show retro Mario AuthScreen with Clerk layer
  if (!isSignedIn) {
    return (
      <AuthScreen
        onAuthSuccess={(_newToken, _newUsername, _userId) => {}}
        hasClerk={true}
      />
    );
  }

  // Signed in -> user enters the trading dashboard immediately!
  const btcUpdate = pnlUpdates["BTCUSDT"];
  const currentPrice = prices["BTCUSDT"] ?? (btcUpdate ? btcUpdate.currentPrice : null);

  return (
    <div
      className="app-container"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header
        username={username || user?.username || "TRADER"}
        onLogout={handleLogout}
        wsStatus={wsStatus}
        balance={balance}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Page: Trade */}
      {activePage === "trade" && (
        <main
          style={{
            flex: 1,
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "2.2fr 0.8fr 1fr",
            gap: "20px",
            background: "var(--bg-canvas)",
          }}
          className="trading-dashboard-layout"
        >
          {/* Real-time Candlestick Chart */}
          <PriceChart currentPrice={currentPrice} symbol="BTCUSDT" />

          {/* Interactive Order Book Depth display */}
          <OrderBook
            symbol="BTCUSDT"
            currentPrice={currentPrice}
            refreshTrigger={refreshTrigger}
          />

          {/* Order Ticket Form */}
          <OrderForm
            balance={balance}
            currentPrice={currentPrice}
            onOrderSuccess={handleOrderSuccess}
            onDepositSuccess={handleDepositSuccess}
          />

          {/* Positions, Balances and Orders Tab Table */}
          <div style={{ gridColumn: "span 3" }}>
            <PositionsTable
              balance={balance}
              positions={positions}
              pnlUpdates={pnlUpdates}
              onRefreshNeeded={handleOrderSuccess}
            />
          </div>
        </main>
      )}

      {/* Page: Portfolio */}
      {activePage === "portfolio" && (
        <main style={{ flex: 1, background: "var(--bg-canvas)", overflowY: "auto" }}>
          <PortfolioPage
            balance={balance}
            positions={positions}
            pnlUpdates={pnlUpdates}
          />
        </main>
      )}

      {/* Page: Earn */}
      {activePage === "earn" && (
        <main style={{ flex: 1, background: "var(--bg-canvas)", overflowY: "auto" }}>
          <EarnPage balance={balance} onDepositSuccess={handleDepositSuccess} />
        </main>
      )}

      {/* Connection status footer bar */}
      <Footer wsStatus={wsStatus} lastUpdate={lastUpdate} />

      {/* Simple responsive layout styles */}
      <style>{`
        @media (min-width: 1025px) {
          .app-container {
            height: 100vh !important;
            overflow: hidden !important;
          }
          .trading-dashboard-layout {
            flex: 1 !important;
            grid-template-columns: 2.2fr 0.8fr 1fr !important;
            grid-template-rows: 4fr 1fr !important;
            overflow: hidden !important;
            height: 0;
          }
          .trading-dashboard-layout > * {
            min-height: 0 !important;
          }
        }
        @media (max-width: 1024px) {
          .trading-dashboard-layout {
            grid-template-columns: 1fr !important;
          }
          .trading-dashboard-layout > * {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Legacy App (Fallback if no Clerk keys) ─── */
function AppLegacy() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cxe_token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("cxe_username"));
  const [balance, setBalance] = useState<number>(50000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activePage, setActivePage] = useState<Page>("trade");

  const { status: wsStatus, pnlUpdates, lastUpdate, prices } = useWebSocket(token);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const balanceData = await api.getBalance();
      setBalance(balanceData.balance);

      const positionsData = await api.getPositions();
      setPositions(positionsData.positions || []);
    } catch (err) {
      console.error("Failed to load user account data:", err);
      if (String(err).includes("Unauthorized") || String(err).includes("JWT")) {
        handleLogout();
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [token, fetchData]);

  const handleAuthSuccess = useCallback((
    newToken: string,
    newUsername: string,
    _userId: string | number,
  ) => {
    setToken(newToken);
    setUsername(newUsername);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleLogout = () => {
    api.logout();
    setToken(null);
    setUsername(null);
    setPositions([]);
    setActivePage("trade");
  };

  const handleOrderSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    fetchData();
  };

  const handleDepositSuccess = () => {
    fetchData();
    setRefreshTrigger((prev) => prev + 1);
  };

  const btcUpdate = pnlUpdates["BTCUSDT"];
  const currentPrice = prices["BTCUSDT"] ?? (btcUpdate ? btcUpdate.currentPrice : null);

  if (!token) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} hasClerk={false} />;
  }

  return (
    <div
      className="app-container"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header
        username={username}
        onLogout={handleLogout}
        wsStatus={wsStatus}
        balance={balance}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {activePage === "trade" && (
        <main
          style={{
            flex: 1,
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "2.2fr 0.8fr 1fr",
            gap: "20px",
            background: "var(--bg-canvas)",
          }}
          className="trading-dashboard-layout"
        >
          <PriceChart currentPrice={currentPrice} symbol="BTCUSDT" />
          <OrderBook
            symbol="BTCUSDT"
            currentPrice={currentPrice}
            refreshTrigger={refreshTrigger}
          />
          <OrderForm
            balance={balance}
            currentPrice={currentPrice}
            onOrderSuccess={handleOrderSuccess}
            onDepositSuccess={handleDepositSuccess}
          />
          <div style={{ gridColumn: "span 3" }}>
            <PositionsTable
              balance={balance}
              positions={positions}
              pnlUpdates={pnlUpdates}
              onRefreshNeeded={handleOrderSuccess}
            />
          </div>
        </main>
      )}

      {activePage === "portfolio" && (
        <main style={{ flex: 1, background: "var(--bg-canvas)", overflowY: "auto" }}>
          <PortfolioPage
            balance={balance}
            positions={positions}
            pnlUpdates={pnlUpdates}
          />
        </main>
      )}

      {activePage === "earn" && (
        <main style={{ flex: 1, background: "var(--bg-canvas)", overflowY: "auto" }}>
          <EarnPage balance={balance} onDepositSuccess={handleDepositSuccess} />
        </main>
      )}

      <Footer wsStatus={wsStatus} lastUpdate={lastUpdate} />
    </div>
  );
}

/* ─── Root App Component ─── */
export default function App({ hasClerk = false }: { hasClerk?: boolean }) {
  if (hasClerk) {
    return <AppWithClerk />;
  }
  return <AppLegacy />;
}
