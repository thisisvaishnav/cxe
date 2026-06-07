// src/components/PriceChart.tsx - Real-time Candlestick Chart using TradingView's lightweight-charts

import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";

interface PriceChartProps {
  currentPrice: number | null;
  symbol: string;
}

interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  currentPrice,
  symbol,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastPriceRef = useRef<number | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState("1h");
  const isMounted = useRef(false);

  interface CurrentCandle {
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
  }
  const currentCandleRef = useRef<CurrentCandle | null>(null);

  // Generate realistic mock history based on starting price
  const generateMockHistory = (
    startPrice: number,
    timeframe: string,
    count = 100,
  ): CandleData[] => {
    const data: CandleData[] = [];

    let interval = 60;
    let priceStep = 10;
    let randomMultiplier = 8;

    if (timeframe === "5m") {
      interval = 300;
      priceStep = 15;
      randomMultiplier = 12;
    } else if (timeframe === "1h") {
      interval = 3600;
      priceStep = 50;
      randomMultiplier = 35;
    } else if (timeframe === "1d") {
      interval = 86400;
      priceStep = 200;
      randomMultiplier = 150;
    }

    let price = startPrice - count * (priceStep * 0.1);
    const now = Math.floor(Date.now() / 1000);

    for (let i = count; i > 0; i--) {
      const time = (now - i * interval) as UTCTimestamp;
      const change = (Math.random() - 0.49) * priceStep;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * randomMultiplier;
      const low = Math.min(open, close) - Math.random() * randomMultiplier;

      data.push({ time, open, high, low, close });
      price = close;
    }
    return data;
  };

  // 1. Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance with initial container measurements
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 600,
      height: chartContainerRef.current.clientHeight || 380,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000000",
        fontFamily: "'Share Tech Mono', monospace",
      },
      grid: {
        vertLines: { color: "#f0f0f0", style: 2 },
        horzLines: { color: "#f0f0f0", style: 2 },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: "#000000",
      },
      timeScale: {
        borderColor: "#000000",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "rgba(56, 142, 60, 0.9)",
      downColor: "rgba(211, 47, 47, 0.9)",
      borderUpColor: "rgba(56, 142, 60, 1)",
      borderDownColor: "rgba(211, 47, 47, 1)",
      wickUpColor: "rgba(56, 142, 60, 1)",
      wickDownColor: "rgba(211, 47, 47, 1)",
    });

    seriesRef.current = series;

    // Set initial data
    const startVal = currentPrice || 60000;
    const initialData = generateMockHistory(startVal, activeTimeframe, 80);
    series.setData(initialData);

    // Make chart responsive in both width and height using ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (chartRef.current && width > 0 && height > 0) {
        chartRef.current.resize(width, height);
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1.5. Update history data when timeframe changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!seriesRef.current) return;
    const startVal = currentPrice || 60000;
    const initialData = generateMockHistory(startVal, activeTimeframe, 80);
    seriesRef.current.setData(initialData);
    lastPriceRef.current = null;
    currentCandleRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimeframe]);

  // 2. Stream Live Ticks to Chart
  useEffect(() => {
    if (!seriesRef.current || currentPrice === null) return;

    // Prevent duplicate updates for the same tick price
    if (lastPriceRef.current === currentPrice) return;
    lastPriceRef.current = currentPrice;

    const series = seriesRef.current;

    const now = Math.floor(Date.now() / 1000) as UTCTimestamp;

    // Use interval corresponding to the active timeframe
    let interval = 60;
    if (activeTimeframe === "5m") interval = 300;
    else if (activeTimeframe === "1h") interval = 3600;
    else if (activeTimeframe === "1d") interval = 86400;

    const candleTime = (Math.floor(now / interval) * interval) as UTCTimestamp;

    let currentCandle = currentCandleRef.current;

    if (!currentCandle || currentCandle.time !== candleTime) {
      // Start a new candle block
      currentCandle = {
        time: candleTime,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
    } else {
      // Update existing candle block
      currentCandle.high = Math.max(currentCandle.high, currentPrice);
      currentCandle.low = Math.min(currentCandle.low, currentPrice);
      currentCandle.close = currentPrice;
    }

    currentCandleRef.current = currentCandle;
    series.update(currentCandle);
  }, [currentPrice, activeTimeframe]);

  return (
    <div
      className="nes-container"
      style={{
        padding: "15px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ticker Symbol bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          borderBottom: "2px solid #000000",
          paddingBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-press-start)",
              fontSize: "14px",
              color: "var(--mario-red)",
              fontWeight: "bold",
            }}
          >
            ★ {symbol}
          </span>
          <span
            style={{
              fontFamily: "var(--font-press-start)",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {currentPrice ? currentPrice.toFixed(2) : "60000.00"}
          </span>
          <span
            className="text-red"
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            -0.34% / -0.60%
          </span>
        </div>

        <div
          style={{
            fontSize: "12px",
            display: "flex",
            gap: "12px",
            opacity: 0.8,
          }}
        >
          <span>
            24h Vol: <strong style={{ color: "#000" }}>140,237 USDC</strong>
          </span>
          <span>
            Cap: <strong style={{ color: "#000" }}>16.98M USDC</strong>
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          flex: 1,
          minHeight: "180px",
          background: "#ffffff",
          border: "2px solid #000",
        }}
      />

      {/* Timeframe selector toolbar */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-press-start)",
          fontSize: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          {["5m", "1h", "1d", "Indicators"].map((tf) => (
            <button
              key={tf}
              onClick={() => tf !== "Indicators" && setActiveTimeframe(tf)}
              className="nes-btn"
              style={{
                fontSize: "7px",
                padding: "4px 8px",
                background:
                  activeTimeframe === tf ? "var(--mario-yellow)" : "#ffffff",
                boxShadow:
                  activeTimeframe === tf ? "none" : "var(--shadow-retro-small)",
                transform:
                  activeTimeframe === tf ? "translate(1px, 1px)" : "none",
                opacity: tf === "Indicators" ? 0.6 : 1,
                cursor: tf === "Indicators" ? "not-allowed" : "pointer",
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px", color: "#666" }}>
          {["5y", "2y", "1y", "6m", "3m", "1m", "5d", "1d"].map((range) => (
            <span key={range} style={{ cursor: "pointer" }}>
              {range}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
