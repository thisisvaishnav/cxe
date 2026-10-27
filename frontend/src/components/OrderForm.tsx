// src/components/OrderForm.tsx - Clean Retro Order Ticket Component

import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import confetti from "canvas-confetti";

interface OrderFormProps {
  balance: number;
  currentPrice: number | null;
  onOrderSuccess: () => void;
  onDepositSuccess: () => void;
}

const formatNumber = (n: number, d = 2) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export const OrderForm: React.FC<OrderFormProps> = ({
  balance,
  currentPrice,
  onOrderSuccess,
}) => {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState<string>("0.0100");
  const [price, setPrice] = useState<string>("");
  const [sliderVal, setSliderVal] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activePrice =
    orderType === "market"
      ? currentPrice || 80666.92
      : parseFloat(price) || currentPrice || 80666.92;

  useEffect(() => {
    if (price === "" && currentPrice) {
      setPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, price]);

  const handlePercentSelect = (percent: number) => {
    setSliderVal(percent);
    const pxVal = activePrice > 0 ? activePrice : 80666.92;
    if (side === "buy") {
      const targetQty = (balance * (percent / 100)) / pxVal;
      setQty(targetQty.toFixed(4));
    } else {
      const maxSell = 1.0;
      setQty((maxSell * (percent / 100)).toFixed(4));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    handlePercentSelect(val);
  };

  const numericQty = parseFloat(qty) || 0;
  const orderValue = numericQty * activePrice;
  const feeQty = numericQty * 0.00075;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (numericQty <= 0) {
      setError("Please specify a valid size.");
      return;
    }

    if (side === "buy" && orderValue > balance) {
      setError("Insufficient funds for order.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.placeOrder(
        orderType,
        side,
        "BTCUSDT",
        numericQty,
        orderType === "limit" ? activePrice : null
      );

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#ecbf3c", "#4c8a3c", "#b73234"],
      });

      setSuccessMsg(`Order accepted: ${res.orderId || "OK"}`);
      onOrderSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to place order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="order-ticket-card supercoin-card">
      <div className="card-header">
        <h2 className="card-title">Order Ticket</h2>
        <span className="balance-hint">
          Bal: <b>${formatNumber(balance)}</b>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="order-form-body">
        {/* Buy / Sell Side Segmented Toggle */}
        <div className="side-segmented-group" role="group" aria-label="Order Side">
          <button
            type="button"
            className="side-btn buy-side-btn"
            aria-pressed={side === "buy"}
            onClick={() => setSide("buy")}
          >
            Buy BTC
          </button>
          <button
            type="button"
            className="side-btn sell-side-btn"
            aria-pressed={side === "sell"}
            onClick={() => setSide("sell")}
          >
            Sell BTC
          </button>
        </div>

        {/* Market / Limit Order Type Switcher */}
        <div className="type-segmented-group" role="group" aria-label="Order Type">
          <button
            type="button"
            className="type-btn"
            aria-pressed={orderType === "market"}
            onClick={() => {
              setOrderType("market");
              if (currentPrice) setPrice(currentPrice.toFixed(2));
            }}
          >
            Market
          </button>
          <button
            type="button"
            className="type-btn"
            aria-pressed={orderType === "limit"}
            onClick={() => setOrderType("limit")}
          >
            Limit
          </button>
        </div>

        {/* Available Balance Row */}
        <div className="balance-row">
          <span className="balance-label">Available to trade</span>
          <strong className="balance-value">{formatNumber(balance)} USDC</strong>
        </div>

        {/* Price Input Field */}
        <div className="form-group">
          <label htmlFor="price-input" className="form-label">
            Price
          </label>
          <div className="input-affix-container">
            <input
              id="price-input"
              value={orderType === "market" ? activePrice.toFixed(2) : price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={orderType === "market"}
              inputMode="decimal"
              className="text-input"
              placeholder="0.00"
            />
            <span className="input-affix">USDT</span>
          </div>
        </div>

        {/* Size Input Field */}
        <div className="form-group">
          <label htmlFor="size-input" className="form-label">
            Size
          </label>
          <div className="input-affix-container">
            <input
              id="size-input"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputMode="decimal"
              className="text-input"
              placeholder="0.0000"
            />
            <span className="input-affix">BTC</span>
          </div>
        </div>

        {/* Percentage Slider & Quick Chips */}
        <div className="slider-group">
          <input
            type="range"
            id="order-slider"
            min="0"
            max="100"
            value={sliderVal}
            onChange={handleSliderChange}
            className="custom-range-slider"
            aria-label="Order size percentage"
          />

          <div className="percent-chips-grid">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                className={`percent-chip ${sliderVal === pct ? "active" : ""}`}
                onClick={() => handlePercentSelect(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary Breakdown */}
        <div className="order-summary-box">
          <div className="summary-row">
            <span className="summary-label">Order value</span>
            <span className="summary-val">{formatNumber(orderValue)} USDC</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Slippage</span>
            <span className="summary-val">0.05% (max 0.10%)</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Est. Fee (0.075%)</span>
            <span className="summary-val">{feeQty.toFixed(5)} BTC</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="form-alert error-alert" role="alert">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="form-alert success-alert" role="alert">
            {successMsg}
          </div>
        )}

        {/* Big Action Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`submit-order-btn ${side === "sell" ? "sell-btn" : "buy-btn"}`}
        >
          {isLoading
            ? "Sending..."
            : `${side === "buy" ? "Buy" : "Sell"} BTC`}
        </button>
      </form>
    </div>
  );
};
