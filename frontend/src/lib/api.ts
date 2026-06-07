// src/lib/api.ts - Typed API Client for CXE Backend

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  balance: number;
}

export interface BalanceResponse {
  balance: number;
}

export interface Position {
  symbol: string;
  qty: number; // Positive = LONG, Negative = SHORT
  avgCost: number;
  side: "LONG" | "SHORT";
}

export interface PositionsResponse {
  positions: Position[];
}

export interface Order {
  id: number;
  userId: number;
  market: string;
  price: number | null;
  qty: number;
  type: "MARKET" | "LIMIT";
  side: "BUY" | "SELL";
  filledQty: number;
  status: "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
  createdAt: string;
}

export interface OrderResponse {
  message: string;
  orderId: number;
}

export interface DepthOrder {
  id: number;
  userId: number;
  market: string;
  price: number | null;
  qty: number;
  type: "LIMIT";
  side: "BUY" | "SELL";
  filledQty: number;
  status: "OPEN";
  createdAt: string;
}

export interface DepthResponse {
  orders: DepthOrder[];
}

const getHeaders = () => {
  const token = localStorage.getItem("cxe_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "Unknown server error";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // JSON parsing failed, use generic message
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // Auth API
  async signup(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem("cxe_token", data.token);
    localStorage.setItem("cxe_username", data.username);
    localStorage.setItem("cxe_userId", String(data.userId));
    return data;
  },

  async signin(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch("/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem("cxe_token", data.token);
    localStorage.setItem("cxe_username", data.username);
    localStorage.setItem("cxe_userId", String(data.userId));
    return data;
  },

  logout(): void {
    localStorage.removeItem("cxe_token");
    localStorage.removeItem("cxe_username");
    localStorage.removeItem("cxe_userId");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("cxe_token");
  },

  getUsername(): string {
    return localStorage.getItem("cxe_username") || "";
  },

  getUserId(): number {
    return Number(localStorage.getItem("cxe_userId")) || 0;
  },

  // Exchange API
  async getBalance(): Promise<BalanceResponse> {
    const res = await fetch("/balance", {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<BalanceResponse>(res);
  },

  async getPositions(): Promise<PositionsResponse> {
    const res = await fetch("/positions", {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<PositionsResponse>(res);
  },

  async getDepth(symbol: string): Promise<DepthResponse> {
    const res = await fetch(`/depth/${symbol}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<DepthResponse>(res);
  },

  async placeOrder(
    type: "limit" | "market",
    side: "buy" | "sell",
    symbol: string,
    qty: number,
    price: number | null
  ): Promise<OrderResponse> {
    const body: Record<string, unknown> = { type, side, symbol, qty };
    if (type === "limit") {
      body.price = price;
    }
    const res = await fetch("/order", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<OrderResponse>(res);
  },

  async getOrder(orderId: number): Promise<Order> {
    const res = await fetch(`/order/${orderId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<Order>(res);
  },

  async cancelOrder(orderId: number): Promise<{ message: string }> {
    const res = await fetch(`/order/${orderId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};
