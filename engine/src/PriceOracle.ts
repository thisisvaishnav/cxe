import { EventEmitter } from "events";

export class PriceOracle extends EventEmitter {
  private prices: Map<string, number> = new Map();
  private reconnectDelay: Map<string, number> = new Map();
  private lastEmitTime: Map<string, number> = new Map();
  private throttleTimeout: Map<string, ReturnType<typeof setTimeout>> = new Map();


  constructor(private readonly redis: any) {
    super();
  }

  connect(symbol: string): void {
    const url = `wss://stream.binance.com/ws/${symbol.toLowerCase()}@trade`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`Connected: ${symbol}`);
      this.reconnectDelay.set(symbol, 500); // reset backoff on success
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e !== "trade") return;
      this.onPriceUpdate(data.s, parseFloat(data.p));
    };

    ws.onerror = (err) => console.error(`Error [${symbol}]:`, err);

    ws.onclose = () => {
      const delay = this.reconnectDelay.get(symbol) ?? 500;
      const next = Math.min(delay * 2, 30_000);
      console.log(`Closed [${symbol}]. Reconnecting in ${delay}ms`);
      this.reconnectDelay.set(symbol, next);
      setTimeout(() => this.connect(symbol), delay);
    };
  }

  private onPriceUpdate(symbol: string, price: number): void {
    this.prices.set(symbol, price);

    const now = Date.now();
    const lastTime = this.lastEmitTime.get(symbol) ?? 0;
    const minInterval = 100; // 100ms throttle interval (max 10 ticks/sec)

    if (now - lastTime >= minInterval) {
      this.emitPrice(symbol, price);
    } else {
      // Trailing edge: ensure we still emit the latest price at the end of the throttle window
      if (this.throttleTimeout.has(symbol)) {
        clearTimeout(this.throttleTimeout.get(symbol)!);
      }
      const timeout = setTimeout(() => {
        const currentPrice = this.prices.get(symbol);
        if (currentPrice !== undefined) {
          this.emitPrice(symbol, currentPrice);
        }
        this.throttleTimeout.delete(symbol);
      }, minInterval - (now - lastTime));
      this.throttleTimeout.set(symbol, timeout);
    }
  }

  private emitPrice(symbol: string, price: number): void {
    this.lastEmitTime.set(symbol, Date.now());
    this.emit("tick", symbol, price);
    this.redis
      .set(`price:${symbol}`, price.toString())
      .catch((err: Error) => console.error("Redis write failed:", err));
    this.redis
      .publish("price-updates", JSON.stringify({ symbol, price }))
      .catch((err: Error) => console.error("Redis publish failed:", err));
  }

  getPrice(symbol: string): number | undefined {
    return this.prices.get(symbol);
  }
}
