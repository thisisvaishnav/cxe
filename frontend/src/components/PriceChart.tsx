// src/components/PriceChart.tsx - Real-time Candlestick Chart in Clean Retro UI

import React, { useEffect, useRef, useState, useCallback } from "react";
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

type Timeframe = "5m" | "15m" | "1h" | "2h" | "1d";

const intervalSeconds: Record<Timeframe, number> = {
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "2h": 7200,
  "1d": 86400,
};

// Generate realistic mock history based on starting price (fallback utility)
const generateMockHistory = (
  startPrice: number,
  timeframe: Timeframe,
  count = 70
): CandleData[] => {
  const data: CandleData[] = [];
  let interval = 300;
  let priceStep = 15;
  let randomMultiplier = 12;

  if (timeframe === "5m") {
    interval = 300;
    priceStep = 15;
    randomMultiplier = 12;
  } else if (timeframe === "15m") {
    interval = 900;
    priceStep = 30;
    randomMultiplier = 20;
  } else if (timeframe === "1h") {
    interval = 3600;
    priceStep = 50;
    randomMultiplier = 35;
  } else if (timeframe === "2h") {
    interval = 7200;
    priceStep = 80;
    randomMultiplier = 50;
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

export const PriceChart: React.FC<PriceChartProps> = ({
  currentPrice,
  symbol,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const latestPriceRef = useRef<number | null>(currentPrice);
  latestPriceRef.current = currentPrice;

  // Default to 5m timeframe with 2h support for detailed candle viewing
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("5m");

  interface CurrentCandle {
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
  }
  const currentCandleRef = useRef<CurrentCandle | null>(null);

  // Fetch historical candlestick data from Binance API or fallback
  const fetchHistory = useCallback(
    async (tf: Timeframe) => {
      if (!seriesRef.current) return;
      const series = seriesRef.current;
      const chart = chartRef.current;

      const querySymbol = symbol.toUpperCase().includes("USDT")
        ? symbol.toUpperCase()
        : `${symbol.toUpperCase()}USDT`;

      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${querySymbol}&interval=${tf}&limit=80`
        );
        if (!response.ok) {
          throw new Error(`Binance API response error: ${response.status}`);
        }
        const rawData = await response.json();
        if (!Array.isArray(rawData) || rawData.length === 0) {
          throw new Error("Invalid Binance API response format");
        }

        const formattedData: CandleData[] = rawData.map((item: any) => ({
          time: Math.floor(Number(item[0]) / 1000) as UTCTimestamp,
          open: parseFloat(String(item[1])),
          high: parseFloat(String(item[2])),
          low: parseFloat(String(item[3])),
          close: parseFloat(String(item[4])),
        }));

        series.setData(formattedData);
        chart?.timeScale().fitContent();

        const lastCandle = formattedData[formattedData.length - 1];
        currentCandleRef.current = {
          time: lastCandle.time,
          open: lastCandle.open,
          high: lastCandle.high,
          low: lastCandle.low,
          close: lastCandle.close,
        };
      } catch (error) {
        console.warn("Using mock history fallback for chart:", error);
        const startVal = latestPriceRef.current || 80666.92;
        const mockData = generateMockHistory(startVal, tf, 70);
        series.setData(mockData);
        chart?.timeScale().fitContent();
        if (mockData.length > 0) {
          const lastMock = mockData[mockData.length - 1];
          currentCandleRef.current = {
            time: lastMock.time,
            open: lastMock.open,
            high: lastMock.high,
            low: lastMock.low,
            close: lastMock.close,
          };
        }
      }
    },
    [symbol]
  );

  // 1. Initialize Lightweight Chart ONCE on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 700,
      height: chartContainerRef.current.clientHeight || 280,
      layout: {
        background: { color: "#f8f4e6" }, // var(--surface)
        textColor: "#1c1a17", // var(--ink)
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
      },
      grid: {
        vertLines: { color: "#d9d1b8", style: 2 }, // var(--line)
        horzLines: { color: "#d9d1b8", style: 2 },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#1c1a17",
      },
      timeScale: {
        borderColor: "#1c1a17",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#4c8a3c", // var(--up)
      downColor: "#b73234", // var(--down)
      borderUpColor: "#4c8a3c",
      borderDownColor: "#b73234",
      wickUpColor: "#4c8a3c",
      wickDownColor: "#b73234",
    });

    seriesRef.current = series;

    // Load initial candles immediately
    fetchHistory(activeTimeframe);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (chartRef.current && width > 0 && height > 0) {
        chartRef.current.resize(width, height);
        chartRef.current.timeScale().fitContent();
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // Run once on mount

  // 2. Fetch history when timeframe or symbol updates
  useEffect(() => {
    fetchHistory(activeTimeframe);
  }, [activeTimeframe, fetchHistory]);

  // 3. Stream real-time price updates into active candle
  useEffect(() => {
    if (!currentPrice || !seriesRef.current) return;
    const series = seriesRef.current;
    const now = Math.floor(Date.now() / 1000);
    const interval = intervalSeconds[activeTimeframe];

    const candleTime = (Math.floor(now / interval) * interval) as UTCTimestamp;
    let currentCandle = currentCandleRef.current;

    if (!currentCandle || currentCandle.time !== candleTime) {
      currentCandle = {
        time: candleTime,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
    } else {
      currentCandle.high = Math.max(currentCandle.high, currentPrice);
      currentCandle.low = Math.min(currentCandle.low, currentPrice);
      currentCandle.close = currentPrice;
    }

    currentCandleRef.current = currentCandle;
    series.update(currentCandle);
  }, [currentPrice, activeTimeframe]);

  const displayPrice = currentPrice
    ? currentPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "80,666.92";

  return (
    <>
      <div className="pair">
        <h1 className="symbol-title">{symbol === "BTCUSDT" ? "BTC/USDT" : symbol}</h1>
        <strong className="price" id="last">
          {displayPrice}
        </strong>
        <span className="dn">−0.34%</span>
        <span>24h vol 140,237</span>
        <span>24h range 79,020 – 82,010</span>
      </div>

      <div className="chart-box">
        <div
          ref={chartContainerRef}
          style={{ width: "100%", height: "100%", minHeight: "260px" }}
        />
      </div>

      <div className="tf" role="group" aria-label="Interval">
        {(["5m", "15m", "1h", "2h", "1d"] as const).map((tf) => (
          <button
            key={tf}
            aria-pressed={activeTimeframe === tf}
            onClick={() => setActiveTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>
    </>
  );
};
