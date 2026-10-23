// src/lib/api.ts - Typed API Client for CXE Backend

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  balance: number;
  email?: string;
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
  userId: string;
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
  userId: string;
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
  setToken(token: string, username?: string, userId?: string): void {
    localStorage.setItem("cxe_token", token);
    if (username) localStorage.setItem("cxe_username", username);
    if (userId) localStorage.setItem("cxe_userId", userId);
  },

  async syncUser(token: string, email?: string, username?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/v1/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, username }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem("cxe_token", token);
    if (data.username) localStorage.setItem("cxe_username", data.username);
    if (data.userId) localStorage.setItem("cxe_userId", String(data.userId));
    return data;
  },

  // Auth API
  async signup(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/signup`, {
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
    const res = await fetch(`${API_BASE}/signin`, {
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

  getUserId(): string {
    return localStorage.getItem("cxe_userId") || "";
  },

  // Exchange API
  async getBalance(): Promise<BalanceResponse> {
    const res = await fetch(`${API_BASE}/balance`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<BalanceResponse>(res);
  },

  async getPositions(): Promise<PositionsResponse> {
    const res = await fetch(`${API_BASE}/positions`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<PositionsResponse>(res);
  },

  async getDepth(symbol: string): Promise<DepthResponse> {
    const res = await fetch(`${API_BASE}/depth/${symbol}`, {
      method: "GET",
      headers: getHeaders(),
      signal: AbortSignal.timeout(5000),
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
    const res = await fetch(`${API_BASE}/order`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<OrderResponse>(res);
  },

  async getOrder(orderId: number): Promise<Order> {
    const res = await fetch(`${API_BASE}/order/${orderId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<Order>(res);
  },

  async cancelOrder(orderId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/order/${orderId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async deposit(amount: number): Promise<BalanceResponse> {
    const res = await fetch(`${API_BASE}/deposit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse<BalanceResponse>(res);
  },
};
