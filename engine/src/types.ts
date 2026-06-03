// types.ts

export interface UserBalance {
  available: number;
  locked: number;
}

export interface Order {
  id: string;
  userId: string;
  market: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  filled: number;
}

export interface EngineMessage {
  correlationId: string;
  replyTo: string;
  type: "PLACE_ORDER" | "CANCEL_ORDER" | "DEPOSIT";
  payload: any;
}
