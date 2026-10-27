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
    <form onSubmit={handleSubmit} style={{ margin: 0 }}>
      <h2 className="supercoin-title px">Order</h2>

      <div className="side">
        <button
          type="button"
          className="b"
          aria-pressed={side === "buy"}
          onClick={() => setSide("buy")}
        >
          Buy
        </button>
        <button
          type="button"
          className="s"
          aria-pressed={side === "sell"}
          onClick={() => setSide("sell")}
        >
          Sell
        </button>
      </div>

      <div className="type">
        <button
          type="button"
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
          aria-pressed={orderType === "limit"}
          onClick={() => setOrderType("limit")}
        >
          Limit
        </button>
      </div>

      <div className="avail">
        <span>Available</span>
        <b>{formatNumber(balance)} USDC</b>
      </div>

      <label htmlFor="p" className="supercoin-label">
        Price
      </label>
      <div className="field">
        <input
          id="p"
          value={orderType === "market" ? activePrice.toFixed(2) : price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={orderType === "market"}
          inputMode="decimal"
        />
        <em>USDT</em>
      </div>

      <label htmlFor="q" className="supercoin-label">
        Size
      </label>
      <div className="field">
        <input
          id="q"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          inputMode="decimal"
        />
        <em>BTC</em>
      </div>

      <input
        type="range"
        id="r"
        min="0"
        max="100"
        value={sliderVal}
        onChange={handleSliderChange}
        className="supercoin-slider"
        aria-label="Size as percent of balance"
      />

      <div className="pct">
        <button type="button" onClick={() => handlePercentSelect(25)}>
          25%
        </button>
        <button type="button" onClick={() => handlePercentSelect(50)}>
          50%
        </button>
        <button type="button" onClick={() => handlePercentSelect(100)}>
          100%
        </button>
      </div>

      <dl className="supercoin-summary">
        <dt>Order value</dt>
        <dd id="val">{formatNumber(orderValue)} USDC</dd>
        <dt>Slippage</dt>
        <dd>0.05% (max 0.10%)</dd>
        <dt>Fee</dt>
        <dd id="fee">0.075% / {feeQty.toFixed(5)} BTC</dd>
      </dl>

      {error && (
        <div
          style={{
            color: "var(--down)",
            fontSize: "17px",
            marginBottom: "12px",
            border: "1px solid var(--down)",
            padding: "4px 8px",
            background: "var(--dn-bg)",
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            color: "var(--up)",
            fontSize: "17px",
            marginBottom: "12px",
            border: "1px solid var(--up)",
            padding: "4px 8px",
            background: "var(--up-bg)",
          }}
        >
          {successMsg}
        </div>
      )}

      <button
        type="submit"
        className={`go ${side === "sell" ? "sell" : ""}`}
        disabled={isLoading}
      >
        {isLoading
          ? "Processing..."
          : `${side === "buy" ? "Buy" : "Sell"} BTC`}
      </button>
    </form>
  );
};
