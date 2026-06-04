# Project Overview: Mini Centralized Exchange (CEX)

This repository contains a mini centralized exchange built with TypeScript and Bun. The current codebase is organized as separate backend, engine, frontend, and depth client workspaces, with the backend and engine connected through Redis queues.

## Current Architecture

```text
Client / frontend
        |
        v
Backend API (Express, default port 3000)
        |
        v
Redis list: backend-to-engine-broker
        |
        v
Engine worker
        |
        v
Backend-specific Redis response queue
        |
        v
HTTP response
```

The backend owns HTTP routing, authentication, request validation, and Prisma-backed user persistence. The engine runs as a worker process and currently hydrates user USD balances from PostgreSQL into Redis before processing queued messages.

## Workspaces

### `backend/`

The backend is an Express API running on Bun.

Key responsibilities:

- Start the HTTP server from `backend/src/index.ts`.
- Connect Redis publisher/subscriber clients through `backend/src/utils/engine-client.ts`.
- Track pending engine responses by `correlationId` in `backend/src/store/pending-responses.ts`.
- Expose auth routes in `backend/src/routes/auth-routes.ts`.
- Expose exchange routes in `backend/src/routes/exchange-routes.ts`.
- Use Prisma for users, balances, orders, fills, and stocks.
- Validate request bodies and route params with Zod.
- Protect exchange routes with JWT auth.

Implemented routes:

```text
GET    /health
POST   /signup
POST   /signin
POST   /order
GET    /depth/:symbol
GET    /balance
GET    /order/:orderId
DELETE /order/:orderId
```

`POST /signup` hashes the password, creates a user, creates an initial USD balance of `1000`, and returns a JWT. `POST /signin` validates credentials with bcrypt and returns the same auth response shape.

### `engine/`

The current engine implementation is contained in `engine/src/index.ts`.

On startup it:

- Creates a Prisma client.
- Connects to Redis.
- Reads all `Balance` records from PostgreSQL.
- Stores each user balance in the Redis hash `balances`.
- Starts a blocking Redis loop on `backend-to-engine-broker`.

For each message it currently:

- Parses the Redis payload.
- Reads user, price, quantity, response queue, and correlation id from the message.
- Checks the cached Redis balance.
- Rejects with `INSUFFICIENT_FUNDS` if the user cannot cover `price * quantity`.
- Deducts the amount from Redis if accepted.
- Replies on the provided response queue with the same `correlationId`.

Current implementation note: the backend sends engine commands with a `payload` field and uses `qty`, while the current engine reads from `message.data` and expects `quantity`. The documented backend contract below reflects the backend types; the engine may need alignment before the full request flow works end to end.

### `frontend/`

The frontend workspace is present as a Bun/TypeScript package, but it currently contains only the package scaffold and `frontend/index.ts`.

### `depth/`

The `depth/` folder contains a draft TypeScript client for working with external order book depth feeds.

## Redis Message Contract

Backend to engine messages are typed in `backend/src/types/engine.ts`:

```ts
interface EngineRequest {
  correlationId: string;
  responseQueue: string;
  type:
    | "create_order"
    | "get_depth"
    | "get_user_balance"
    | "get_order"
    | "cancel_order";
  payload: Record<string, unknown>;
}
```

Engine responses are expected to include the original correlation id:

```ts
interface EngineResponse {
  correlationId: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}
```

The backend pushes requests with `LPUSH` and waits for responses using a backend-specific queue:

```ts
response-queue-${BACKEND_QUEUE_ID}
```

If `BACKEND_QUEUE_ID` is not set, the backend creates a random queue id at startup.

## Database Schema

The Prisma schema defines:

- `User`: username, hashed password, orders, fills, and optional balance.
- `Balance`: one USD balance per user.
- `Order`: market, price, qty, type, side, filled qty, and status.
- `Fill`: executed trade records.
- `Stock`: named tradeable symbols.

Enums:

- `OrderStatus`: `OPEN`, `PARTIALLY_FILLED`, `FILLED`, `CANCELLED`
- `OrderType`: `MARKET`, `LIMIT`
- `OrderSide`: `BUY`, `SELL`

## Environment

The backend expects:

```text
REDIS_URL
JWT_SECRET
PORT optional, defaults to 3000
INCOMING_QUEUE optional, defaults to backend-to-engine-broker
BACKEND_QUEUE_ID optional
ENGINE_TIMEOUT_MS optional, defaults to 30000
```

The engine currently uses Redis and Prisma directly from `engine/src/index.ts`.

## Running Locally

Start Redis and PostgreSQL first, then install dependencies in each workspace:

```bash
cd backend
bun install

cd ../engine
bun install
```

Run the backend:

```bash
cd backend
bun run dev
```

Run the engine in another terminal:

```bash
cd engine
bun run dev
```

The backend listens on `http://localhost:3000` unless `PORT` is set.
