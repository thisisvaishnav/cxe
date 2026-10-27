// src/App.tsx - Supercoin Exchange App Component

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/react";
import { Header, Footer } from "./components/Layout.js";
import type { Page } from "./components/Layout.js";
import { PriceChart } from "./components/PriceChart.js";
import { OrderBook } from "./components/OrderBook.js";
import { OrderForm } from "./components/OrderForm.js";
import { PositionsTable } from "./components/PositionsTable.js";
import { PortfolioPage } from "./components/PortfolioPage.js";
import { EarnPage } from "./components/EarnPage.js";
import { AuthScreen } from "./components/AuthScreen.js";
import Landing01Demo from "./components/demo.js";
import { useWebSocket } from "./hooks/useWebSocket.js";
import { api } from "./lib/api.js";
import type { Position } from "./lib/api.js";

/* ─── App with Clerk Authentication ─── */
function AppWithClerk() {
  const { isSignedIn, isLoaded, getToken, signOut } = useAuth();
  const { user } = useUser();

  const [balance, setBalance] = useState<number>(50000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activePage, setActivePage] = useState<Page>("trade");
  const [unauthView, setUnauthView] = useState<"trade" | "auth">("trade");
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Sync Clerk session token to CXE API
  useEffect(() => {
    let isMounted = true;
    async function syncToken() {
      if (isSignedIn) {
        try {
          const t = await getToken();
          if (isMounted) {
            setJwtToken(t);
            if (t) api.setToken(t);
          }
        } catch (e) {
          console.error("Failed to acquire Clerk token:", e);
        }
      } else {
        if (isMounted) {
          setJwtToken(null);
          api.logout();
        }
      }
    }
    syncToken();
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, getToken]);

  const { status: wsStatus, pnlUpdates, lastUpdate, prices } = useWebSocket(jwtToken);

  const fetchData = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const balanceData = await api.getBalance();
      setBalance(balanceData.balance);

      const positionsData = await api.getPositions();
      setPositions(positionsData.positions || []);
    } catch (err) {
      console.error("Failed to load user account data:", err);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, fetchData, refreshTrigger]);

  const handleLogout = async () => {
    await signOut();
    setJwtToken(null);
    api.logout();
    setPositions([]);
    setBalance(50000);
    setActivePage("trade");
    setUnauthView("trade");
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

  if (isLoaded && !isSignedIn && unauthView === "auth") {
    return (
      <div className="relative" style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div style={{ position: "fixed", top: "16px", left: "16px", zIndex: 9999 }}>
          <button
            onClick={() => setUnauthView("trade")}
            className="px"
            style={{
              fontSize: "11px",
              padding: "8px 14px",
              background: "var(--surface)",
              border: "2px solid var(--ink)",
              cursor: "pointer",
            }}
          >
            ← BACK TO TRADE
          </button>
        </div>
        <AuthScreen onAuthSuccess={() => setUnauthView("trade")} hasClerk={true} />
      </div>
    );
  }

  const username =
    user?.username ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Trader";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <Header
        username={username}
        onLogout={handleLogout}
        onSignIn={() => setUnauthView("auth")}
        isSignedIn={Boolean(isSignedIn)}
        wsStatus={wsStatus}
        balance={balance}
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
      />

      {/* Page: Trade */}
      {activePage === "trade" && (
        <main className="supercoin-dashboard">
          <section className="supercoin-section" aria-label="Chart">
            <PriceChart currentPrice={currentPrice} symbol="BTCUSDT" />
            <PositionsTable
              balance={balance}
              positions={positions}
              pnlUpdates={pnlUpdates}
              onRefreshNeeded={handleOrderSuccess}
              onDepositSuccess={handleDepositSuccess}
            />
          </section>

          <section className="supercoin-section" aria-label="Order book">
            <OrderBook
              symbol="BTCUSDT"
              currentPrice={currentPrice}
              refreshTrigger={refreshTrigger}
            />
          </section>

          <section className="supercoin-section" aria-label="Order ticket">
            <OrderForm
              balance={balance}
              currentPrice={currentPrice}
              onOrderSuccess={handleOrderSuccess}
              onDepositSuccess={handleDepositSuccess}
            />
          </section>
        </main>
      )}

      {/* Page: Portfolio */}
      {activePage === "portfolio" && (
        <main style={{ maxWidth: "1500px", margin: "0 auto", padding: "24px", width: "100%" }}>
          <PortfolioPage balance={balance} positions={positions} pnlUpdates={pnlUpdates} />
        </main>
      )}

      {/* Page: Earn */}
      {activePage === "earn" && (
        <main style={{ maxWidth: "1500px", margin: "0 auto", padding: "24px", width: "100%" }}>
          <EarnPage balance={balance} onDepositSuccess={handleDepositSuccess} />
        </main>
      )}

      {/* Page: Showcase */}
      {activePage === "landing" && (
        <main style={{ background: "#101010" }}>
          <Landing01Demo onGetStarted={() => setActivePage("trade")} />
        </main>
      )}

      <Footer wsStatus={wsStatus} lastUpdate={lastUpdate} />
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
  const [unauthView, setUnauthView] = useState<"trade" | "auth">("trade");

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
  }, [token, fetchData, refreshTrigger]);

  const handleAuthSuccess = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUsername(newUsername);
    localStorage.setItem("cxe_token", newToken);
    localStorage.setItem("cxe_username", newUsername);
    api.setToken(newToken);
    setUnauthView("trade");
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem("cxe_token");
    localStorage.removeItem("cxe_username");
    api.logout();
    setPositions([]);
    setBalance(50000);
    setActivePage("trade");
    setUnauthView("trade");
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

  if (!token && unauthView === "auth") {
    return (
      <div className="relative" style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div style={{ position: "fixed", top: "16px", left: "16px", zIndex: 9999 }}>
          <button
            onClick={() => setUnauthView("trade")}
            className="px"
            style={{
              fontSize: "11px",
              padding: "8px 14px",
              background: "var(--surface)",
              border: "2px solid var(--ink)",
              cursor: "pointer",
            }}
          >
            ← BACK TO TRADE
          </button>
        </div>
        <AuthScreen onAuthSuccess={handleAuthSuccess} hasClerk={false} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <Header
        username={username || "Vaishnav"}
        onLogout={handleLogout}
        onSignIn={() => setUnauthView("auth")}
        isSignedIn={Boolean(token)}
        wsStatus={wsStatus}
        balance={balance}
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
      />

      {activePage === "trade" && (
        <main className="supercoin-dashboard">
          <section className="supercoin-section" aria-label="Chart">
            <PriceChart currentPrice={currentPrice} symbol="BTCUSDT" />
            <PositionsTable
              balance={balance}
              positions={positions}
              pnlUpdates={pnlUpdates}
              onRefreshNeeded={handleOrderSuccess}
              onDepositSuccess={handleDepositSuccess}
            />
          </section>

          <section className="supercoin-section" aria-label="Order book">
            <OrderBook
              symbol="BTCUSDT"
              currentPrice={currentPrice}
              refreshTrigger={refreshTrigger}
            />
          </section>

          <section className="supercoin-section" aria-label="Order ticket">
            <OrderForm
              balance={balance}
              currentPrice={currentPrice}
              onOrderSuccess={handleOrderSuccess}
              onDepositSuccess={handleDepositSuccess}
            />
          </section>
        </main>
      )}

      {activePage === "portfolio" && (
        <main style={{ maxWidth: "1500px", margin: "0 auto", padding: "24px", width: "100%" }}>
          <PortfolioPage balance={balance} positions={positions} pnlUpdates={pnlUpdates} />
        </main>
      )}

      {activePage === "earn" && (
        <main style={{ maxWidth: "1500px", margin: "0 auto", padding: "24px", width: "100%" }}>
          <EarnPage balance={balance} onDepositSuccess={handleDepositSuccess} />
        </main>
      )}

      {activePage === "landing" && (
        <main style={{ background: "#101010" }}>
          <Landing01Demo onGetStarted={() => setActivePage("trade")} />
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
