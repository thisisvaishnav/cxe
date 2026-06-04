export interface Balance {
  available: number;
  locked: number;
}

// User balances mapping: userId -> asset -> Balance
export type BalanceStore = Record<string, Record<string, Balance>>;

export interface Order {
  orderId: string;
  userId: string;
  type: "limit" | "market";
  side: "buy" | "sell";
  symbol: string; // e.g., "SOL" or "BTC" (mapped against USDT/USD base)
  price: number;
  qty: number;
  remainingQty: number;
  timestamp: number;
}

export interface Fill {
  fillId: string;
  symbol: string;
  price: number;
  qty: number;
  buyOrderId: string;
  sellOrderId: string;
}

export interface MatchResult {
  status: "filled" | "partially_filled" | "rejected";
  filledQty: number;
  averagePrice: number;
  fills: Fill[];
  error?: string;
}
