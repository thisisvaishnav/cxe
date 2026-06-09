// src/App.tsx - Connects Auth and Trading Dashboard components together

import { useState, useEffect, useCallback } from "react";
import { AuthScreen } from "./components/AuthScreen.js";
import { Header, Footer } from "./components/Layout.js";
import { PriceChart } from "./components/PriceChart.js";
import { OrderBook } from "./components/OrderBook.js";
import { OrderForm } from "./components/OrderForm.js";
import { PositionsTable } from "./components/PositionsTable.js";
import { api } from "./lib/api.js";
import type { Position } from "./lib/api.js";
import { useWebSocket } from "./hooks/useWebSocket.js";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("cxe_token"),
  );
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("cxe_username"),
  );
  const [balance, setBalance] = useState<number>(50000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Hook up WebSocket
  const { status: wsStatus, pnlUpdates, lastUpdate, prices } = useWebSocket(token);

  // Fetch balances & positions
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const balanceData = await api.getBalance();
      setBalance(balanceData.balance);

      const positionsData = await api.getPositions();
      setPositions(positionsData.positions || []);
    } catch (err) {
      console.error("Failed to load user account data:", err);
      // If unauthorized, logout
      if (String(err).includes("Unauthorized") || String(err).includes("JWT")) {
        handleLogout();
      }
    }
  }, [token]);

  // Initial load & poller
  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [token, fetchData]);

  // Auth callbacks
  const handleAuthSuccess = (
    newToken: string,
    newUsername: string,
    _userId: number,
  ) => {
    setToken(newToken);
    setUsername(newUsername);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    api.logout();
    setToken(null);
    setUsername(null);
    setPositions([]);
  };

  const handleOrderSuccess = () => {
    // Increment refresh trigger to reload order book & charts immediately
    setRefreshTrigger((prev) => prev + 1);
    fetchData();
  };

  const handleDepositSuccess = () => {
    fetchData();
    setRefreshTrigger((prev) => prev + 1);
  };

  // Get current market price of BTCUSDT from WebSocket stream or default
  const btcUpdate = pnlUpdates["BTCUSDT"];
  const currentPrice = prices["BTCUSDT"] ?? (btcUpdate ? btcUpdate.currentPrice : null);

  if (!token) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div
      className="app-container"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Top Header & Ticker */}
      <Header username={username} onLogout={handleLogout} wsStatus={wsStatus} balance={balance} />

      {/* Main trading deck workspace grid */}
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
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default App;
