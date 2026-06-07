// src/components/OrderForm.tsx - Retro Trading Ticket panel

import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import confetti from "canvas-confetti";

interface OrderFormProps {
  balance: number;
  currentPrice: number | null;
  onOrderSuccess: () => void;
  onDepositSuccess: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  balance,
  currentPrice,
  onOrderSuccess,
  onDepositSuccess,
}) => {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sliderVal, setSliderVal] = useState(0);

  // Set default price based on oracle price if it arrives and it's a limit order
  useEffect(() => {
    if (currentPrice && price === "" && orderType === "limit") {
      setPrice(currentPrice);
    }
  }, [currentPrice, orderType]);

  // Handle preset percentages
  const handlePercentSelect = (percent: number) => {
    setSliderVal(percent);
    if (side === "buy") {
      const activePrice = orderType === "limit" ? Number(price) : (currentPrice || 60000);
      if (!activePrice || activePrice <= 0) {
        setError("Please specify a valid price first!");
        return;
      }
      const totalBuyPower = balance;
      const targetQty = (totalBuyPower * (percent / 100)) / activePrice;
      // Round to 4 decimals
      setQty(Math.floor(targetQty * 10000) / 10000);
    } else {
      // Selling: we'll check open positions or let them sell up to a preset amount.
      // Since we don't have position size readily available, let's assume they can trade up to some maximum.
      // Let's mock a sell amount or base it on a typical maximum size, say 1 BTC.
      setQty(Math.floor(1 * (percent / 100) * 10000) / 10000);
    }
  };

  // Sync slider val to quantity calculations
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    handlePercentSelect(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const numericQty = Number(qty);
    if (!qty || numericQty <= 0) {
      setError("Please specify a valid quantity!");
      return;
    }

    let numericPrice = null;
    if (orderType === "limit") {
      numericPrice = Number(price);
      if (!price || numericPrice <= 0) {
        setError("Please specify a valid limit price!");
        return;
      }
    }

    // Fund check for buy limit orders
    if (side === "buy" && orderType === "limit" && numericPrice) {
      const orderCost = numericQty * numericPrice;
      if (orderCost > balance) {
        setError("INSUFFICIENT_FUNDS: Cost exceeds balance.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await api.placeOrder(
        orderType,
        side,
        "BTCUSDT", // Fixed symbol in exchange backend
        numericQty,
        numericPrice
      );

      // Trigger coin confetti explosion on successful order!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#fbc02d", "#d32f2f", "#388e3c"],
      });

      setSuccessMsg(`ORDER ACCEPTED! ID: ${res.orderId}`);
      setQty("");
      setSliderVal(0);
      onOrderSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to place order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockDeposit = async () => {
    // We don't have a direct backend deposit endpoint, so let's call signup again or mock it.
    // In our case, the backend doesn't support a direct POST /deposit.
    // But wait! We can tell the user we are adding mock funds, or we can check if they want to run a script.
    // Actually, let's just trigger onDepositSuccess which tells the parent component to trigger a balance refresh or show a notification.
    onDepositSuccess();
  };

  // Calculate order value
  const orderValue = 
    qty && (orderType === "limit" ? Number(price) : (currentPrice || 60000))
      ? Number(qty) * (orderType === "limit" ? Number(price) : (currentPrice || 60000))
      : 0;

  return (
    <div className="nes-container orderform-container" style={{ height: "100%", minWidth: "280px", overflowY: "auto" }}>
      <div className="nes-title">ORDER FORM</div>

      {/* Tabs */}
      <div className="nes-tabs-header" style={{ margin: "-24px -24px 15px -24px" }}>
        <div 
          className={`nes-tab ${orderType === "market" ? "active" : ""}`}
          onClick={() => { setOrderType("market"); setError(null); }}
          style={{ flex: 1, textAlign: "center" }}
        >
          MARKET
        </div>
        <div 
          className={`nes-tab ${orderType === "limit" ? "active" : ""}`}
          onClick={() => { setOrderType("limit"); setError(null); }}
          style={{ flex: 1, textAlign: "center" }}
        >
          LIMIT
        </div>
        <div 
          className="nes-tab" 
          style={{ flex: 1, textAlign: "center", opacity: 0.5, cursor: "not-allowed" }}
        >
          PRO
        </div>
      </div>

      {/* Buy/Sell selector buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button 
          onClick={() => setSide("buy")}
          className="nes-btn"
          style={{ 
            flex: 1, 
            background: side === "buy" ? "var(--mario-green)" : "#ffffff", 
            color: side === "buy" ? "#ffffff" : "#000000",
            border: "3px solid #000000",
            boxShadow: side === "buy" ? "var(--shadow-retro-small)" : "var(--shadow-retro)",
            transform: side === "buy" ? "translate(2px, 2px)" : "none"
          }}
        >
          BUY ▲
        </button>
        <button 
          onClick={() => setSide("sell")}
          className="nes-btn"
          style={{ 
            flex: 1, 
            background: side === "sell" ? "var(--mario-red)" : "#ffffff", 
            color: side === "sell" ? "#ffffff" : "#000000",
            border: "3px solid #000000",
            boxShadow: side === "sell" ? "var(--shadow-retro-small)" : "var(--shadow-retro)",
            transform: side === "sell" ? "translate(2px, 2px)" : "none"
          }}
        >
          SELL ▼
        </button>
      </div>

      {/* Error/Success Feedbacks */}
      {error && (
        <div style={{ border: "2px solid var(--mario-red)", background: "#ffebee", color: "var(--mario-red)", padding: "6px", fontSize: "11px", marginBottom: "10px" }}>
          {error.toUpperCase()}
        </div>
      )}
      {successMsg && (
        <div style={{ border: "2px solid var(--mario-green)", background: "#e8f5e9", color: "var(--mario-green)", padding: "6px", marginBottom: "10px", fontFamily: "var(--font-press-start)", fontSize: "9px" }}>
          ★ {successMsg}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--orderform-text-size, 12px)", marginBottom: "var(--orderform-margin-bottom, 8px)", opacity: 0.8 }}>
          <span>AVAILABLE TO TRADE:</span>
          <span style={{ fontWeight: "bold" }}>{balance.toFixed(2)} USDC</span>
        </div>

        {orderType === "limit" && (
          <div className="nes-field">
            <label className="nes-label">PRICE (USDT)</label>
            <input 
              type="number" 
              className="nes-input" 
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="60000.00"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="nes-field">
          <label className="nes-label">SIZE (BTC)</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input 
              type="number" 
              className="nes-input" 
              step="0.0001"
              value={qty}
              onChange={(e) => {
                setQty(e.target.value === "" ? "" : Number(e.target.value));
                setSliderVal(0);
              }}
              placeholder="0.0100"
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <select className="nes-select" style={{ width: "100px", padding: "8px" }}>
              <option>BTC</option>
            </select>
          </div>
        </div>

        {/* Quantity Percentage Slider */}
        <div className="nes-slider-container">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderVal} 
            onChange={handleSliderChange}
            className="nes-slider"
            disabled={isLoading}
          />
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", marginTop: "5px" }}>
            <button type="button" onClick={() => handlePercentSelect(25)} className="nes-btn percent-btn" style={{ fontSize: "var(--orderform-btn-size, 9px)", padding: "4px 8px" }}>25%</button>
            <button type="button" onClick={() => handlePercentSelect(50)} className="nes-btn percent-btn" style={{ fontSize: "var(--orderform-btn-size, 9px)", padding: "4px 8px" }}>50%</button>
            <button type="button" onClick={() => handlePercentSelect(100)} className="nes-btn percent-btn" style={{ fontSize: "var(--orderform-btn-size, 9px)", padding: "4px 8px" }}>100%</button>
          </div>
        </div>

        {/* Order Details */}
        <div className="order-details-box" style={{ border: "2px dashed #000000", padding: "var(--orderform-details-padding, 10px)", margin: "var(--orderform-details-margin, 15px 0)", fontSize: "var(--orderform-details-font-size, 13px)", display: "flex", flexDirection: "column", gap: "var(--orderform-details-gap, 6px)" }}>
          <div className="flex-between">
            <span>ORDER VALUE:</span>
            <span>{orderValue.toFixed(2)} USDC</span>
          </div>
          <div className="flex-between">
            <span>SLIPPAGE:</span>
            <span>0.05% / MAX 0.10%</span>
          </div>
          <div className="flex-between">
            <span>FEES:</span>
            <span>0.075% / 0.0001 BTC</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="nes-btn green order-submit-btn" 
          style={{ width: "100%", padding: "var(--orderform-submit-padding, 12px 0)", fontSize: "var(--orderform-submit-font-size, 14px)", marginBottom: "var(--orderform-submit-margin-bottom, 15px)" }}
          disabled={isLoading}
        >
          {isLoading ? "PROCESSSING..." : "★ ENABLE TRADING ★"}
        </button>
      </form>

      {/* Extra Action Buttons */}
      <button 
        onClick={handleMockDeposit} 
        className="nes-btn red order-deposit-btn" 
        style={{ width: "100%", padding: "var(--orderform-deposit-padding, 10px 0)", fontSize: "var(--orderform-deposit-font-size, 12px)", marginBottom: "var(--orderform-deposit-margin-bottom, 10px)" }}
      >
        DEPOSIT $
      </button>

      <div style={{ display: "flex", gap: "10px" }}>
        <button className="nes-btn yellow order-action-btn" style={{ flex: 1, padding: "var(--orderform-action-padding, 8px 0)", fontSize: "var(--orderform-action-font-size, 10px)" }}>
          PERPS ⮂ SPOT
        </button>
        <button className="nes-btn order-action-btn" style={{ flex: 1, padding: "var(--orderform-action-padding, 8px 0)", fontSize: "var(--orderform-action-font-size, 10px)" }}>
          WITHDRAW
        </button>
      </div>

      {/* Account Equity section */}
      <div className="account-equity-section" style={{ marginTop: "var(--orderform-equity-margin-top, 20px)", borderTop: "2px solid #000000", paddingTop: "var(--orderform-equity-padding-top, 15px)", fontSize: "var(--orderform-equity-font-size, 12px)", display: "flex", flexDirection: "column", gap: "var(--orderform-equity-gap, 6px)" }}>
        <div style={{ fontWeight: "bold" }}>ACCOUNT EQUITY:</div>
        <div className="flex-between">
          <span>SPOT</span>
          <span>{balance.toFixed(2)} USDC</span>
        </div>
        <div className="flex-between">
          <span>PERPS</span>
          <span>0.00 USDC</span>
        </div>
        <div style={{ fontWeight: "bold", marginTop: "5px" }}>PERPS OVERVIEW</div>
      </div>
    </div>
  );
};
