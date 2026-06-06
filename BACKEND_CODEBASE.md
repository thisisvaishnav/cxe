# CXE — Paper Trading Engine: Complete Backend Codebase Reference

> **Purpose of this file:** A single reference document so any LLM (or developer) can understand the entire backend architecture, all data flows, every file's responsibility, and what is complete vs. what is missing — **without reading individual source files.**

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Backend Service (`/backend`)](#5-backend-service-backend)
6. [Engine Service (`/engine`)](#6-engine-service-engine)
7. [Redis Data Contracts](#7-redis-data-contracts)
8. [Complete Request-Response Flow (End-to-End)](#8-complete-request-response-flow-end-to-end)
9. [WebSocket Real-Time PnL Flow](#9-websocket-real-time-pnl-flow)
10. [Completion Status & Known Gaps](#10-completion-status--known-gaps)
11. [Environment Variables](#11-environment-variables)
12. [How to Run](#12-how-to-run)

---

## 1. High-Level Architecture

```
Browser / Frontend
       │
       │  HTTP REST (port 3000)          WebSocket ws://localhost:3000/ws
       │                                          │
       ▼                                          │
┌──────────────────────────────────────────────── ┤
│               BACKEND SERVICE                   │
│   Express HTTP + WS server on one HTTP server  │
│                                                  │
│  • Auth (signup / signin) → JWT                 │
│  • Exchange routes (order, balance, positions)  │
│  • engine-client.ts → sends to Redis queue      │
│  • ws-server.ts → subscribes to Redis pub/sub   │
└───────────────────┬──────────────────────────────┘
                    │ Redis List: "backend-to-engine-broker"
                    ▼
┌─────────────────────────────────────────────────┐
│               ENGINE SERVICE                    │
│  (bun run, no HTTP port — pure queue consumer)  │
│                                                  │
│  • Hydrates balances and positions from Postgres │
│  • PriceOracle ──WebSocket──▶ Binance           │
│  • PaperEngine (brPop loop + onTick handler)    │
│  • PositionTracker (in-memory positions)        │
│  • PnLCalculator (tick → Redis pnl:uid:sym)     │
│  • Writes results back to response queue        │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
          PostgreSQL + Redis
```

---

## 2. Monorepo Structure

```
cxe/
├── backend/          ← Express HTTP API + WebSocket server
│   ├── src/
│   │   ├── index.ts               ← app entry, boots HTTP + WS + Redis listeners
│   │   ├── db.ts                  ← Prisma client (pg adapter)
│   │   ├── gateway.ts             ← OLD draft gateway (NOT used by index.ts — dead code)
│   │   ├── ws-server.ts           ← WebSocket server, subscribes to "pnl-updates"
│   │   ├── controllers/
│   │   │   ├── auth-controller.ts ← signup / signin handlers
│   │   │   └── exchange-controller.ts ← order/balance/positions/depth/cancel
│   │   ├── routes/
│   │   │   ├── auth-routes.ts     ← POST /signup, POST /signin
│   │   │   ├── exchange-routes.ts ← POST /order, GET /balance, GET /positions, …
│   │   │   └── index.ts           ← mounts authRouter + exchangeRouter
│   │   ├── store/
│   │   │   └── pending-responses.ts ← in-memory correlationId → Promise map
│   │   ├── types/
│   │   │   ├── auth-schema.ts     ← Zod schema for signup/signin body
│   │   │   ├── exchange-schema.ts ← Zod schemas for order body + param validation
│   │   │   ├── engine.ts          ← EngineCommandType, EngineRequest, EngineResponse types
│   │   │   └── express.d.ts       ← augments Express Request with `userId: string`
│   │   └── utils/
│   │       ├── async-handler.ts   ← wraps async route handler, forwards errors
│   │       ├── auth.ts            ← createToken(), requireAuth() middleware
│   │       ├── engine-client.ts   ← connectRedis(), sendToEngine(), listenForEngineResponses()
│   │       ├── env.ts             ← typed env variables with validation
│   │       └── validation.ts      ← sendValidationError() helper
│   ├── prisma/
│   │   └── schema.prisma          ← Postgres schema (User, Order, Fill, Balance, Stock)
│   └── package.json               ← bun, express, redis, jsonwebtoken, ws, zod, bcryptjs…
│
├── engine/           ← Paper trading engine (bun, no HTTP)
│   ├── src/
│   │   ├── index.ts               ← entry: hydrate → boot oracle/engine/pnl → brPop loop
│   │   ├── PriceOracle.ts         ← WebSocket to Binance, emits "tick" events
│   │   ├── OrderBook.ts           ← in-memory resting limit orders per symbol
│   │   ├── PaperEngine.ts         ← routes MARKET/LIMIT orders; reacts to ticks
│   │   ├── PositionTracker.ts     ← per-user position state, realized PnL on fills
│   │   ├── PnLCalculator.ts       ← unrealized PnL on each tick → Redis + pub/sub
│   │   ├── OrderBook.test.ts      ← unit tests for OrderBook
│   │   └── PositionTracker.test.ts← unit tests for PositionTracker
│   └── package.json               ← bun, @prisma/client, redis, zod
│
├── frontend/         ← (not reviewed here)
├── backend/index.ts  ← OLD scratch file at repo root (NOT the real entry — dead code)
└── BACKEND_CODEBASE.md ← THIS FILE
```

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Runtime | **Bun** (both services) |
| Language | **TypeScript** (ESM modules) |
| HTTP Framework | **Express 5** |
| WebSocket (server) | **ws** library |
| WebSocket (Binance) | Native `WebSocket` (Bun built-in) |
| Database | **PostgreSQL** via Prisma ORM |
| Prisma Adapter | `@prisma/adapter-pg` (direct pool) |
| Cache / Broker | **Redis** (`redis` npm package v5 — `node-redis`) |
| Auth | **JWT** (jsonwebtoken) + **bcryptjs** |
| Validation | **Zod** |
| Tests | **Bun test** (built-in) |

---

## 4. Database Schema (Prisma)

File: `backend/prisma/schema.prisma`

### Enums
```
OrderStatus: OPEN | PARTIALLY_FILLED | FILLED | CANCELLED
OrderType:   MARKET | LIMIT
OrderSide:   BUY | SELL
```

### Models

#### `User`
| Column | Type | Notes |
|---|---|---|
| id | Int PK autoincrement | |
| username | String UNIQUE | |
| password | String | bcrypt hashed |

Relations: `orders Order[]`, `fills Fill[]`, `balance Balance?`

#### `Order`
| Column | Type | Notes |
|---|---|---|
| id | Int PK | |
| userId | Int FK → User | |
| market | String | e.g. "BTCUSDT" |
| price | Float? | null for MARKET orders |
| qty | Float | |
| type | OrderType | MARKET / LIMIT |
| side | OrderSide | BUY / SELL |
| filledQty | Float | default 0 |
| status | OrderStatus | default OPEN |
| createdAt | DateTime | |

#### `Fill`
| Column | Type | Notes |
|---|---|---|
| id | Int PK | |
| qty | Float | |
| side | OrderSide | |
| type | OrderType | |
| userId | Int FK → User | |
| price | Float? | actual fill price |
| asset | String | symbol (e.g. "BTCUSDT") |
| originalOrderId | Int | references Order.id |
| createdAt | DateTime | |

> **Note:** `Fill.originalOrderId` is NOT a formal FK (no `@relation` to Order) — just a plain Int column.

#### `Balance`
| Column | Type | Notes |
|---|---|---|
| id | Int PK | |
| userId | Int UNIQUE FK → User | one balance per user |
| usd | Float | default 0; new users get $10,000 |

#### `Stock` (unused in engine logic)
| Column | Type | Notes |
|---|---|---|
| id | Int PK | |
| name | String | |
| symbol | String UNIQUE | |

---

## 5. Backend Service (`/backend`)

### Entry Point — `src/index.ts`

Boot sequence (top-level await, Bun supports this natively):
1. `connectRedis()` — connects publisher + subscriber Redis clients
2. `listenForEngineResponses()` — starts background loop on the response queue
3. Creates Express app with `cors()` + `express.json()`
4. Mounts `appRouter` (auth + exchange routes)
5. Creates shared `http.Server`
6. `attachWebSocketServer(httpServer)` — starts WS server + Redis pub/sub subscriber
7. `httpServer.listen(env.port)` — starts listening (default 3000)

---

### `src/utils/env.ts` — Environment Config

```
env.port            = process.env.PORT ?? 3000
env.redisUrl        = REDIS_URL (required)
env.jwtSecret       = JWT_SECRET (required)
env.incomingQueue   = INCOMING_QUEUE ?? "backend-to-engine-broker"
env.responseQueue   = "response-queue-{BACKEND_QUEUE_ID ?? random-uuid}"
env.engineTimeoutMs = ENGINE_TIMEOUT_MS ?? 30000
```

> **Warning:** `responseQueue` is randomized per process start unless `BACKEND_QUEUE_ID` is set. This means the engine's response goes to the right backend instance but only if both are running simultaneously.

---

### `src/utils/engine-client.ts` — Async Request-Response Bridge

Uses two separate Redis connections:
- **publisher** — `lPush` to `env.incomingQueue`
- **subscriber** — `brPop` loop on `env.responseQueue`

**`sendToEngine(type, payload)`**
1. Generates a `correlationId` (UUID)
2. Registers a Promise via `waitForEngineResponse(correlationId, timeoutMs)`
3. Pushes `{ correlationId, responseQueue, type, payload }` to the engine queue
4. Returns the Promise (resolves when engine responds, rejects on timeout)

**`listenForEngineResponses()`** — infinite loop:
- Calls `brPop(responseQueue, 0)` (blocking, no timeout)
- Parses JSON → calls `resolveEngineResponse(parsed)` to resolve matching Promise

---

### `src/store/pending-responses.ts` — In-Memory Promise Map

```
Map<correlationId, { resolve, reject, timeoutHandle }>
```

- `waitForEngineResponse(correlationId, ms)` — stores promise callbacks + starts timeout timer
- `resolveEngineResponse(response)` — clears timeout, resolves the promise

---

### API Routes

Mounted in `src/routes/index.ts`:

```
/               ← authRouter (no auth required)
/               ← exchangeRouter (all routes require JWT)
```

#### Auth Routes (`src/routes/auth-routes.ts`)

| Method | Path | Handler | Description |
|---|---|---|---|
| POST | `/signup` | `signup` | Creates user + balance ($10k), returns JWT |
| POST | `/signin` | `signin` | Validates credentials, returns JWT + balance |

**Signup response:**
```json
{ "token": "...", "userId": 1, "username": "alice", "balance": 10000 }
```

#### Exchange Routes (`src/routes/exchange-routes.ts`)

All routes are guarded by `requireAuth` middleware (Bearer JWT in Authorization header).

| Method | Path | Engine Command | Description |
|---|---|---|---|
| POST | `/order` | `create_order` | Place a new order |
| GET | `/balance` | `get_user_balance` | Get current USD balance |
| GET | `/positions` | `get_positions` | Get all open positions |
| GET | `/order/:orderId` | `get_order` | Get a specific order |
| DELETE | `/order/:orderId` | `cancel_order` | Cancel a resting limit order |
| GET | `/depth/:symbol` | `get_depth` | Get resting orders for a symbol |

---

### `src/controllers/auth-controller.ts`

- `signup`: validates with `authSchema` → bcrypt hash → `prisma.user.create` (nested `balance.create` with $10k) → returns JWT
- `signin`: validates → `prisma.user.findUnique` with `include: { balance }` → bcrypt compare → returns JWT

---

### `src/controllers/exchange-controller.ts`

All handlers call `sendToEngine(commandType, payload)` and proxy the engine response directly to the HTTP client.

**`createOrder`**: validates `orderBodySchema` (discriminated union on `type: "limit" | "market"`) → sends `create_order` to engine

**Zod validation (`exchange-schema.ts`):**
- `limit` orders: require `price` (positive number), `side` ("buy"|"sell"), `qty` (positive), `symbol`
- `market` orders: no `price`, same other fields
- Note: Zod uses **lowercase** `"buy"/"sell"/"limit"/"market"` — the engine upcases them to Prisma enums

---

### `src/ws-server.ts` — WebSocket Server

Attached to the shared `http.Server`, listening at `ws://localhost:{port}/ws`.

**Architecture:**
```
Browser WS connection → auth handshake → registered in userSockets Map
Redis "pnl-updates" pub/sub → fan-out to matching userId sockets
```

**Connection flow:**
1. Client connects to `/ws`
2. Client must send: `{ "type": "auth", "token": "<JWT>" }`
3. Server verifies JWT → registers socket in `userSockets: Map<userId, Set<Socket>>`
4. Server responds: `{ "type": "auth_ok", "userId": ..., "message": "..." }`
5. Server automatically pushes: `{ "type": "pnl_update", "data": PnLSnapshot }` on every tick

**Heartbeat:** 30-second ping/pong interval, dead connections are terminated.

**Multi-tab support:** One user can have multiple sockets open — all receive updates.

---

### `src/utils/auth.ts` — JWT Middleware

- `createToken({ userId: string })` → signs with `env.jwtSecret`, 7-day expiry
- `requireAuth` middleware → extracts Bearer token → verifies → sets `req.userId`

> **Note:** `userId` in JWT payload is stored as **string** (even though DB uses Int). The engine explicitly calls `Number(payload.userId)` when parsing.

---

## 6. Engine Service (`/engine`)

### Entry Point — `src/index.ts`

Boot sequence (Bun top-level await):
1. Connect to Redis
2. Connect Prisma
3. **Hydrate balances**: `prisma.balance.findMany()` → `HSET balances {userId} {usd}` in Redis
4. Create `PriceOracle(redisClient)`
5. Create `PaperEngine(redis, prisma, oracle)`
6. **Hydrate positions**: replay all `prisma.fill.findMany()` through `tracker.addFill()` to rebuild in-memory positions
7. Create `PnLCalculator(redis, oracle, engine.getPositionTracker())`
8. Start `oracle.connect("BTCUSDT")` — opens Binance WebSocket
9. Enter infinite `brPop("backend-to-engine-broker", 1)` loop

> **Important:** Currently only `"BTCUSDT"` is subscribed. Multi-symbol support would require calling `oracle.connect()` for each symbol.

---

### `src/PriceOracle.ts`

Extends `EventEmitter`.

**State:**
- `prices: Map<symbol, number>` — latest known price per symbol
- `reconnectDelay: Map<symbol, number>` — exponential backoff delay

**`connect(symbol)`:**
- Opens `wss://stream.binance.com/ws/{symbol.toLowerCase()}@trade`
- Parses trade events (`data.e === "trade"`) → calls `onPriceUpdate(data.s, parseFloat(data.p))`
- On close: reconnects with exponential backoff (500ms → doubles → max 30s)

**`onPriceUpdate(symbol, price)`:**
- Updates `prices` map
- Emits `"tick"` event → both `PaperEngine` and `PnLCalculator` listen to this
- Writes `price:{symbol}` key to Redis (fire-and-forget)

**`getPrice(symbol)`:** Returns current price or `undefined` if not yet received.

---

### `src/OrderBook.ts`

Pure in-memory data structure. **No I/O.**

**State:** `pendingLimits: Map<symbol, Order[]>`

**Methods:**
- `addLimitOrder(order)` — appends to symbol's array
- `removeLimitOrder(orderId)` — O(n) scan across all symbols, splices out by string-coerced ID
- `getOrdersForSymbol(symbol)` — returns a **shallow copy** (prevents mutation-while-iterating bugs)

---

### `src/PaperEngine.ts`

**Constructor:** Creates `OrderBook` + `PositionTracker`, wires `oracle.on("tick")` → `onTick()`

**`processOrder(order: Order)`** — called from `index.ts` brPop loop after DB write:
- **MARKET order** → `fillOrder(order, oracle.getPrice(symbol))` (fails silently if no price yet)
- **LIMIT order** → checks if price has already crossed the limit:
  - If yes → `fillOrder(order, order.price!)` (fills at limit price, not tick price)
  - If no → `orderBook.addLimitOrder(order)` (rests)

**`onTick(symbol, price)`** — fires on every Binance trade:
- Gets all resting orders for symbol
- For each: checks `BUY && price <= limitPrice` or `SELL && price >= limitPrice`
- If triggered: removes from book first (prevents double-fill) → `fillOrder(order, order.price!)`

**`fillOrder(order, fillPrice)`:**
1. `prisma.fill.create(...)` — creates Fill record
2. `prisma.order.update({ status: "FILLED", filledQty: order.qty })` — marks order done
3. `redis.lPush("fills-to-persist", JSON.stringify({...}))` — publishes fill event (downstream consumers)
4. `positionTracker.addFill(...)` — updates in-memory position

**`cancelOrder(orderId)`:** Removes from `OrderBook`. Caller (index.ts) handles DB update.

**`getDepth(symbol)`:** Proxies to `orderBook.getOrdersForSymbol(symbol)`

**`getPositions(userId)`:** Proxies to `positionTracker.getPositions(userId)`

---

### `src/PositionTracker.ts`

Pure in-memory position state. **No I/O.**

**State:** `positions: Map<userId, Map<symbol, Position>>`

**`Position` interface:**
```typescript
{ symbol: string, qty: number, avgCost: number, side: "LONG" | "SHORT" }
```
- `qty` is **signed**: positive = LONG, negative = SHORT

**`addFill(userId, symbol, side, qty, price): PositionUpdateResult`**

Handles all 4 cases:

| Scenario | Result |
|---|---|
| No existing position | Opens new LONG or SHORT |
| LONG + BUY | Accumulates: new avgCost = weighted average |
| LONG + SELL (partial) | Reduces qty; realizes PnL = `(price - avgCost) * qty` |
| LONG + SELL (exact close) | Closes position; realizes PnL |
| LONG + SELL (reversal) | Closes LONG, opens new SHORT with remaining qty |
| SHORT + SELL | Accumulates SHORT |
| SHORT + BUY (partial) | Reduces; realizes PnL = `(avgCost - price) * qty` |
| SHORT + BUY (exact close) | Closes SHORT; realizes PnL |
| SHORT + BUY (reversal) | Closes SHORT, opens new LONG |

Returns `{ realizedPnL: number, position: Position | null }` (null = position closed)

**`getUsersForSymbol(symbol)`:** Scans all users, returns userIds with non-zero qty for that symbol. Used by `PnLCalculator`.

---

### `src/PnLCalculator.ts`

**Constructor:** Wires onto `oracle.on("tick")` → `onTick()`

**`onTick(symbol, price)`:**
1. Gets all users with a position in this symbol via `positionTracker.getUsersForSymbol(symbol)`
2. For each user: calculates `unrealizedPnL = (price - avgCost) × qty` (sign handles LONG/SHORT naturally)
3. Builds `PnLSnapshot` objects
4. Flushes Redis `SET pnl:{userId}:{symbol} <JSON>` in a single pipeline
5. Publishes each snapshot to Redis pub/sub channel `"pnl-updates"` (picked up by `ws-server.ts`)

**`getSnapshot(userId, symbol)`:** Reads `pnl:{userId}:{symbol}` from Redis → on-demand snapshot for REST endpoints (currently no REST route calls this — not wired up yet).

---

## 7. Redis Data Contracts

### Keys / Structures

| Key | Type | Value | Written by | Read by |
|---|---|---|---|---|
| `balances` | Hash | `{userId: string} → usd_string` | engine/index.ts (hydrate + lock funds) | engine/index.ts (balance check) |
| `price:{symbol}` | String | price as string | PriceOracle | (informational, not consumed internally) |
| `pnl:{userId}:{symbol}` | String | JSON PnLSnapshot | PnLCalculator | ws-server? / getSnapshot() |
| `fills-to-persist` | List | JSON fill events | PaperEngine.fillOrder | (no current consumer — placeholder) |

### Queues (Lists)

| Queue Name | Direction | Purpose |
|---|---|---|
| `backend-to-engine-broker` | backend → engine | Order commands (LPUSH by backend, BRPOP by engine) |
| `response-queue-{id}` | engine → backend | Engine command responses |

### Pub/Sub Channels

| Channel | Publisher | Subscriber |
|---|---|---|
| `pnl-updates` | PnLCalculator | ws-server.ts → browser WS |

---

## 8. Complete Request-Response Flow (End-to-End)

### Example: `POST /order` (Limit Buy)

```
1. Browser → POST /order { type:"limit", side:"buy", symbol:"BTCUSDT", qty:0.01, price:60000 }
   Authorization: Bearer <JWT>

2. Backend: requireAuth middleware → extracts userId from JWT → sets req.userId

3. exchange-controller.ts: createOrder()
   → Zod validates body
   → sendToEngine("create_order", { userId, type:"limit", side:"buy", symbol, qty, price })

4. engine-client.ts: sendToEngine()
   → generates correlationId (UUID)
   → registers Promise in pendingResponses Map with 30s timeout
   → LPUSH "backend-to-engine-broker" JSON({correlationId, responseQueue, type, payload})

5. Engine: index.ts brPop loop
   → pops message from "backend-to-engine-broker"
   → type = "create_order"
   → Normalizes: type → "LIMIT", side → "BUY"
   → Balance check for LIMIT BUY:
      - HGET balances {userId} → "10000"
      - totalCost = 60000 * 0.01 = $600
      - 10000 >= 600 ✓
      - newBalance = 9400 → HSET + prisma.balance.update
   → prisma.order.create({userId, market:"BTCUSDT", price:60000, qty:0.01, type:"LIMIT", side:"BUY", status:"OPEN"})
   → engine.processOrder(newOrder)
      - LIMIT order: checks oracle.getPrice("BTCUSDT")
        - If current price ≤ 60000 → fillOrder(order, 60000) (fills immediately)
        - Else → orderBook.addLimitOrder(order) (rests)
   → LPUSH responseQueue JSON({correlationId, ok:true, data:{message:"Order accepted", orderId:5}})

6. Backend: listenForEngineResponses() picks up response
   → resolveEngineResponse({correlationId, ok:true, data:{...}})
   → pendingResponses map resolves the Promise

7. exchange-controller.ts: sendToEngine() returns engineResponse
   → res.status(200).json({ message:"Order accepted", orderId:5 })

8. Browser receives: { "message": "Order accepted", "orderId": 5 }
```

---

### If Order Rests and Price Moves:

```
1. Binance WebSocket trade → PriceOracle.onPriceUpdate("BTCUSDT", 59950)
2. PriceOracle emits "tick" event to ALL listeners

3. PaperEngine.onTick("BTCUSDT", 59950):
   → orderBook.getOrdersForSymbol("BTCUSDT") → [order #5 BUY @ 60000]
   → 59950 <= 60000 → shouldFill = true
   → orderBook.removeLimitOrder(5)
   → fillOrder(order#5, 60000)  ← fills at limit price, not tick price
      - prisma.fill.create(...)
      - prisma.order.update({status:"FILLED"})
      - LPUSH "fills-to-persist" fill event
      - positionTracker.addFill(userId, "BTCUSDT", "BUY", 0.01, 60000)
        → new LONG position: qty=0.01, avgCost=60000, side="LONG"

4. PnLCalculator.onTick("BTCUSDT", 59950):
   → positionTracker.getUsersForSymbol("BTCUSDT") → [userId]
   → getPosition(userId, "BTCUSDT") → {qty:0.01, avgCost:60000, side:"LONG"}
   → unrealizedPnL = (59950 - 60000) × 0.01 = -$0.50
   → SET pnl:{userId}:BTCUSDT {...snapshot}
   → PUBLISH "pnl-updates" snapshot

5. ws-server.ts receives pub/sub message:
   → userSockets.get(userId) → [browserSocket]
   → ws.send(JSON.stringify({ type:"pnl_update", data: snapshot }))

6. Browser receives real-time PnL update
```

---

## 9. WebSocket Real-Time PnL Flow

### Client Connection Protocol

```javascript
// 1. Connect
const ws = new WebSocket("ws://localhost:3000/ws");

// 2. Authenticate immediately after open
ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token: "<JWT>" }));

// 3. Receive auth confirmation
// { "type": "auth_ok", "userId": 1, "message": "Authenticated — you will now receive PnL updates" }

// 4. Receive real-time updates (automatic)
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === "pnl_update") {
    const { userId, symbol, currentPrice, avgCost, qty, side, unrealizedPnL, updatedAt } = msg.data;
    // Update UI
  }
};
```

### PnLSnapshot Shape

```typescript
interface PnLSnapshot {
  userId: number;
  symbol: string;           // "BTCUSDT"
  currentPrice: number;     // latest tick price
  avgCost: number;          // weighted average entry price
  qty: number;              // signed: positive=LONG, negative=SHORT
  side: "LONG" | "SHORT";
  unrealizedPnL: number;    // (currentPrice - avgCost) * qty
  updatedAt: string;        // ISO timestamp
}
```

---

## 10. Completion Status & Known Gaps

### ✅ Fully Implemented

| Component | Status |
|---|---|
| User signup / signin (JWT) | ✅ Complete |
| Balance initialization ($10k on signup) | ✅ Complete |
| Balance cache hydration on engine boot | ✅ Complete |
| Position hydration from fills on engine boot | ✅ Complete |
| MARKET order placement & immediate fill | ✅ Complete |
| LIMIT order placement & book resting | ✅ Complete |
| LIMIT order fill on price tick | ✅ Complete |
| Fund locking on LIMIT BUY | ✅ Complete |
| Order cancellation (memory + DB) | ✅ Complete |
| Fill record creation (DB) | ✅ Complete |
| PositionTracker (all 8 position cases) | ✅ Complete |
| PnLCalculator (unrealized PnL on tick) | ✅ Complete |
| Redis PnL state (`pnl:{uid}:{sym}`) | ✅ Complete |
| Redis pub/sub PnL broadcast | ✅ Complete |
| WebSocket server with JWT auth | ✅ Complete |
| WS → browser PnL fan-out | ✅ Complete |
| WS heartbeat (30s ping/pong) | ✅ Complete |
| GET /balance | ✅ Complete |
| GET /positions | ✅ Complete |
| GET /order/:orderId | ✅ Complete |
| GET /depth/:symbol | ✅ Complete |
| Input validation (Zod) on all routes | ✅ Complete |
| Health check endpoint (`GET /health`) | ✅ Complete |
| Unit tests (OrderBook, PositionTracker) | ✅ Complete |

---

### ⚠️ Known Gaps / Missing Features

| Gap | Details |
|---|---|
| **MARKET SELL balance credit** | When a MARKET SELL fills, the user's USD balance is not updated in Redis/DB. Fund locking only exists for LIMIT BUY. |
| **LIMIT SELL balance update** | No credit back to USD balance when a LIMIT SELL fills. |
| **Balance unlock on cancel** | When a LIMIT BUY is cancelled, the locked funds (`totalCost`) are NOT returned to the user's balance. |
| **Multi-symbol support** | `oracle.connect()` is hardcoded to `"BTCUSDT"` only in `engine/src/index.ts`. |
| **`fills-to-persist` queue has no consumer** | Fill events are pushed to this Redis list but nothing reads them. |
| **`gateway.ts` is dead code** | `backend/src/gateway.ts` is an old draft that's not imported anywhere. Should be deleted. |
| **`backend/index.ts` (root)** | The file at repo root `/backend/index.ts` is an old scratch file with broken code (`prisma.user.findUniqe`, `jwt` not imported). Not used. |
| **`Stock` model is unused** | The `Stock` Prisma model exists in schema but is never queried. |
| **REST endpoint for current PnL** | `PnLCalculator.getSnapshot()` is implemented but no REST route calls it. Frontend must use WebSocket to get PnL. |
| **No realized PnL persistence** | Realized PnL computed in `PositionTracker.addFill()` is logged but not saved to DB or Redis. |
| **No PARTIALLY_FILLED support** | `OrderStatus.PARTIALLY_FILLED` enum exists in schema but engine always fills in full (`qty === order.qty`). |
| **No rate limiting / auth brute-force protection** | Auth endpoints have no rate limiting. |
| **Engine MARKET order with no price** | If oracle hasn't received a tick yet when a MARKET order arrives, it silently fails (logs error, no response sent back). The order remains `OPEN` in DB forever. |

---

## 11. Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/cxe
BACKEND_QUEUE_ID=backend-1          # optional; if omitted, response queue is random UUID
INCOMING_QUEUE=backend-to-engine-broker  # optional
ENGINE_TIMEOUT_MS=30000             # optional, default 30s
```

### Engine (`engine/.env`)

```env
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/cxe
```

---

## 12. How to Run

### Prerequisites
- Bun installed
- PostgreSQL running
- Redis running

### 1. Setup Database (run once)

```bash
cd backend
bun install
bunx prisma migrate dev     # apply migrations
bunx prisma generate        # generate Prisma client
```

### 2. Setup Engine Prisma Client

```bash
cd engine
bun install
bunx prisma generate
```

### 3. Start Redis

```bash
redis-server
```

### 4. Start Engine (terminal 1)

```bash
cd engine
bun run dev
# Output:
# Hydrating balances from Postgres → Redis...
# Cached N user balances in Redis.
# Hydrating positions by replaying database fills...
# [PnLCalculator] Initialised — listening for price ticks.
# Engine started — listening for messages...
# Connected: BTCUSDT
# [tick] BTCUSDT → $65432.10
```

### 5. Start Backend (terminal 2)

```bash
cd backend
bun run dev
# Output:
# Listening for engine responses on response-queue-{id}
# [WS] Subscribed to Redis pub/sub channel: pnl-updates
# Backend running on http://localhost:3000
# WebSocket endpoint: ws://localhost:3000/ws
```

### 6. Run Tests

```bash
cd engine
bun test
```

---

## Quick API Reference

```
POST   /signup         body: { username, password }
POST   /signin         body: { username, password }

POST   /order          body: { type:"limit"|"market", side:"buy"|"sell", symbol, qty, price? }
GET    /balance
GET    /positions
GET    /order/:orderId
DELETE /order/:orderId
GET    /depth/:symbol

WS     ws://localhost:3000/ws  → send { type:"auth", token } → receive pnl_update events
GET    /health
```

All exchange routes require `Authorization: Bearer <token>` header.

---

*Last updated: 2026-06-06 | Covers engine v1 + backend v1*
