<p align="center">
  <img src="https://img.shields.io/badge/CXE-Paper%20Trading%20Exchange-8B5CF6?style=for-the-badge&labelColor=0D1117&logo=bitcoin&logoColor=F7931A" alt="CXE Badge" />
</p>

<h1 align="center">
  ⚡ CXE — Paper Trading Exchange
</h1>

<p align="center">
  <strong>The most realistic paper trading platform ever built.</strong><br/>
  Zero risk. Real market data. Institutional-grade matching engine.
</p>

<p align="center">
  <a href="#-features"><img src="https://img.shields.io/badge/Features-✨-blue?style=flat-square" /></a>
  <a href="#-architecture"><img src="https://img.shields.io/badge/Architecture-🏗️-orange?style=flat-square" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Stack-🔧-green?style=flat-square" /></a>
  <a href="#-getting-started"><img src="https://img.shields.io/badge/Quick%20Start-🚀-red?style=flat-square" /></a>
  <a href="#-api-reference"><img src="https://img.shields.io/badge/API-📡-purple?style=flat-square" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/thisisvaishnav/cxe/ci.yml?branch=main&style=flat-square&label=CI/CD&logo=githubactions&logoColor=white" alt="CI" />
  <img src="https://img.shields.io/badge/runtime-Bun-F9F1E1?style=flat-square&logo=bun&logoColor=black" alt="Bun" />
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" alt="Postgres" />
  <img src="https://img.shields.io/badge/queue-Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/deploy-Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square" alt="License" />
</p>

---

## 🎯 What is CXE?

**CXE** (Centralized Exchange) is a **production-grade paper trading platform** that mirrors the experience of trading on a real centralized exchange — without risking a single dollar.

Unlike toy simulators that use delayed data and simplified logic, CXE connects directly to **Binance's real-time WebSocket streams**, runs a **full in-memory matching engine** with price-time priority, and tracks your **positions, P&L, and balances** tick-by-tick — exactly like a professional trading desk.

> **🏆 Why CXE stands out from every other paper trading platform:**
>
> | Feature | CXE | Competitors |
> |---|---|---|
> | Real-time price feeds | ✅ Binance WebSocket (sub-100ms) | ❌ Polling / 15-min delay |
> | Matching engine | ✅ In-memory, FIFO, price-time priority | ❌ Simple price comparison |
> | Order types | ✅ Market + Limit with partial fills | ❌ Market only |
> | Live P&L tracking | ✅ Tick-by-tick unrealized + realized | ❌ End-of-day snapshots |
> | Position management | ✅ Long/Short with reversals | ❌ Long only |
> | Order book depth | ✅ Live Binance L2 depth + local orders | ❌ Static or none |
> | WebSocket streaming | ✅ Authenticated per-user push | ❌ REST polling |
> | Architecture | ✅ Microservices (Backend → Redis → Engine) | ❌ Monolith |
> | Deployment | ✅ Docker Compose + CI/CD | ❌ Manual |

---

## ✨ Features

### 🔥 Core Trading Engine
- **In-Memory Matching Engine** — All order matching happens in RAM with zero database latency. Orders are processed synchronously in strict FIFO order via Redis queues, guaranteeing no race conditions.
- **Real-Time Price Oracle** — Connects to Binance's trade WebSocket streams with exponential backoff reconnection and 100ms throttled tick emission.
- **Limit & Market Orders** — Full support for both order types. Limit orders rest in the order book until price crosses. Market orders fill instantly at the oracle price.
- **Partial Fills & Order Lifecycle** — Orders transition through `OPEN → PARTIALLY_FILLED → FILLED → CANCELLED` with precise quantity tracking.
- **Price-Time Priority** — The order book sorts by best price first, then by arrival time — identical to how real exchanges operate.

### 📊 Real-Time Data Streaming
- **WebSocket Server** — Authenticated WebSocket connections push live P&L updates, price ticks, and position changes directly to your browser. No polling required.
- **Live Order Book** — Merges your resting local orders with real Binance L2 depth data (50 levels) for a truly realistic order book visualization.
- **TradingView-Grade Charts** — Interactive candlestick charts powered by `lightweight-charts` with real-time price overlays.

### 💼 Portfolio & Position Management
- **Position Tracker** — Sophisticated position tracking with support for:
  - Long and short positions
  - Position accumulation (averaging up/down)
  - Partial reductions
  - Full closures
  - Position reversals (flip from long to short and vice versa)
- **Tick-by-Tick P&L** — Unrealized P&L recalculated on every price tick and pushed to the frontend via WebSocket. Realized P&L computed on every fill.
- **P&L Calculator** — Dedicated engine component that watches all open positions and broadcasts snapshots to Redis pub/sub with 5-minute TTL caching.

### 🔐 Security & Authentication
- **JWT Authentication** — Secure signup/signin with bcrypt password hashing and JWT tokens.
- **Protected Endpoints** — All exchange operations require valid JWT Bearer tokens.
- **WebSocket Auth Handshake** — Clients must authenticate via JWT immediately after WebSocket connection before receiving data.

### 🚀 DevOps & Infrastructure
- **Docker Compose** — Single command to spin up the entire stack (Redis, PostgreSQL, Backend, Engine, Frontend).
- **CI/CD Pipeline** — GitHub Actions workflow with:
  - Type checking (Backend + Engine)
  - Unit tests (OrderBook + PositionTracker)
  - ESLint linting (Frontend)
  - Production builds
  - Docker image builds & push to Docker Hub
  - Automated SSH deployment to production server
- **Nginx Reverse Proxy** — Frontend serves via Nginx with API proxying for seamless deployment.

---

## 🏗️ Architecture

CXE follows a **microservices architecture** where the backend never touches order matching. All exchange state lives in the engine's memory, and communication happens through Redis message queues.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          🌐  FRONTEND                                  │
│                     React + Vite + TypeScript                          │
│         TradingView Charts │ Order Book │ Order Form │ Portfolio       │
└────────────────┬───────────────────────────────────┬────────────────────┘
                 │  REST API (HTTP)                  │  WebSocket (WS)
                 ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        🔷  BACKEND API                                 │
│                     Express + Bun (Port 3000)                          │
│                                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │
│   │  Auth    │  │  Orders  │  │  Depth   │  │  WebSocket Server   │   │
│   │  Routes  │  │  Routes  │  │  Routes  │  │  (PnL + Prices)     │   │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┬──────────┘   │
│        │              │              │                    │              │
│        ▼              ▼              ▼                    │              │
│   ┌─────────┐   ┌──────────────────────┐                │              │
│   │ Prisma  │   │  Redis Queue Client  │                │              │
│   │ (Auth)  │   │  (correlationId)     │                │              │
│   └────┬────┘   └──────────┬───────────┘                │              │
│        │                   │                             │              │
└────────┼───────────────────┼─────────────────────────────┼──────────────┘
         │                   │                             │
         ▼                   ▼                             │
┌──────────────┐  ┌────────────────────┐                   │
│  PostgreSQL  │  │    Redis Queue     │                   │
│   Database   │  │  "backend-to-      │                   │
│              │  │   engine-broker"   │                   │
└──────────────┘  └─────────┬──────────┘                   │
                            │                              │
                            ▼                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                      ⚙️  MATCHING ENGINE                               │
│                     Bun Worker Process                                  │
│                                                                         │
│   ┌────────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│   │  PaperEngine   │  │  OrderBook   │  │  PriceOracle             │   │
│   │  (Fill Logic)  │  │  (Bid/Ask)   │  │  (Binance WS Stream)    │   │
│   └───────┬────────┘  └──────────────┘  └──────────┬───────────────┘   │
│           │                                         │                   │
│   ┌───────┴────────┐  ┌──────────────────────────┐  │                   │
│   │ PositionTracker│  │  PnLCalculator           │◀─┘                   │
│   │ (Long/Short)   │  │  (Unrealized P&L Ticks)  │──── Redis Pub/Sub ──┘
│   └────────────────┘  └──────────────────────────┘                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### How a Trade Flows Through CXE

```
1. 📱 User clicks "Buy 0.5 BTC" on the frontend
2. 🔷 Frontend sends POST /order → Backend API
3. 📨 Backend wraps the request with a correlationId and pushes to Redis queue
4. ⚙️ Engine pops the message from the queue (FIFO, strictly sequential)
5. 💰 PaperEngine checks the PriceOracle for the current Binance price
6. ✅ If MARKET order → fills immediately at oracle price
   📋 If LIMIT order → rests in the OrderBook until price crosses
7. 💾 On fill: updates Prisma DB, Redis balances, PositionTracker, and PnLCalculator
8. 📡 PnLCalculator pushes unrealized P&L to Redis pub/sub → WebSocket → Browser
9. 📊 Frontend updates positions, P&L, and balance in real-time
```

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | [Bun](https://bun.sh/) | Blazing-fast JS runtime for backend + engine |
| **Language** | TypeScript | End-to-end type safety |
| **Frontend** | React 19 + Vite 8 | Modern SPA with HMR |
| **Charts** | Lightweight Charts v5 | TradingView-grade candlestick charts |
| **Backend** | Express 5 | REST API server |
| **WebSocket** | ws | Real-time bidirectional communication |
| **Message Queue** | Redis | FIFO queue + pub/sub for inter-service comms |
| **Database** | PostgreSQL + Prisma 7 | User accounts, orders, fills, balances |
| **Auth** | JWT + bcrypt | Secure authentication |
| **Validation** | Zod 4 | Runtime schema validation |
| **Containerization** | Docker + Docker Compose | One-command deployment |
| **CI/CD** | GitHub Actions | Automated testing, building, and deployment |
| **Reverse Proxy** | Nginx | Frontend serving + API proxying |
| **Price Feed** | Binance WebSocket API | Real-time trade stream + L2 depth |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest)
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Option 1: Docker Compose (Recommended)

Spin up the entire stack with a single command:

```bash
# Clone the repository
git clone https://github.com/thisisvaishnav/cxe.git
cd cxe

# Configure environment
cp backend/.env.example backend/.env
cp engine/.env.example engine/.env

# Edit .env files with your DATABASE_URL and secrets

# Launch everything
docker compose up -d
```

The services will be available at:

| Service | URL |
|---|---|
| 🌐 Frontend | `http://localhost:8080` |
| 🔷 Backend API | `http://localhost:3000` |
| 📡 WebSocket | `ws://localhost:3000/ws` |
| 🗄️ Redis | `localhost:6379` |

### Option 2: Local Development

```bash
# 1. Start Redis and PostgreSQL (via Docker or locally)
docker compose up redis -d

# 2. Configure environment files
cp backend/.env.example backend/.env
cp engine/.env.example engine/.env

# 3. Install dependencies
cd backend && bun install && cd ..
cd engine && bun install && cd ..
cd frontend && bun install && cd ..

# 4. Generate Prisma clients
cd backend && bunx prisma generate && bunx prisma migrate deploy && cd ..
cd engine && bunx prisma generate && cd ..

# 5. Start Backend (Terminal 1)
cd backend && bun run dev

# 6. Start Engine (Terminal 2)
cd engine && bun run dev

# 7. Start Frontend (Terminal 3)
cd frontend && bun run dev
```

---

## 📡 API Reference

### 🔓 Authentication

#### `POST /signup` — Create Account
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "securepass123"}'
```
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 1,
  "username": "alice",
  "balance": 50000
}
```

#### `POST /signin` — Sign In
```bash
curl -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "securepass123"}'
```

---

### 📈 Trading  *(All require `Authorization: Bearer <token>`)*

#### `POST /order` — Place Order
```bash
# Market Buy
curl -X POST http://localhost:3000/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "market", "side": "buy", "symbol": "BTCUSDT", "qty": 0.5}'

# Limit Sell
curl -X POST http://localhost:3000/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "limit", "side": "sell", "symbol": "BTCUSDT", "qty": 0.5, "price": 75000}'
```

#### `GET /depth/:symbol` — Order Book Depth
```bash
curl http://localhost:3000/depth/BTCUSDT \
  -H "Authorization: Bearer $TOKEN"
```

#### `GET /balance` — Account Balance
```bash
curl http://localhost:3000/balance \
  -H "Authorization: Bearer $TOKEN"
```

#### `GET /positions` — Active Positions
```bash
curl http://localhost:3000/positions \
  -H "Authorization: Bearer $TOKEN"
```

#### `GET /order/:orderId` — Order Status
```bash
curl http://localhost:3000/order/42 \
  -H "Authorization: Bearer $TOKEN"
```

#### `DELETE /order/:orderId` — Cancel Order
```bash
curl -X DELETE http://localhost:3000/order/42 \
  -H "Authorization: Bearer $TOKEN"
```

#### `POST /deposit` — Deposit Funds
```bash
curl -X POST http://localhost:3000/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000}'
```

---

### 📡 WebSocket — Real-Time Streams

Connect to `ws://localhost:3000/ws` and authenticate:

```javascript
const ws = new WebSocket("ws://localhost:3000/ws");

// Step 1: Authenticate
ws.onopen = () => {
  ws.send(JSON.stringify({ type: "auth", token: "your-jwt-token" }));
};

// Step 2: Receive real-time updates
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "auth_ok":
      console.log("✅ Authenticated:", msg.userId);
      break;
    case "price_update":
      // { symbol: "BTCUSDT", price: 67542.31 }
      console.log("📈 Price:", msg.data);
      break;
    case "pnl_update":
      // { userId, symbol, currentPrice, avgCost, qty, side, unrealizedPnL }
      console.log("💰 P&L:", msg.data);
      break;
  }
};
```

**Channels broadcast to all authenticated users:**
| Channel | Payload | Frequency |
|---|---|---|
| `price_update` | `{ symbol, price }` | Every ~100ms (throttled) |
| `pnl_update` | `PnLSnapshot` per user per symbol | On every price tick |

---

## 🧪 Testing

```bash
# Run engine unit tests (OrderBook + PositionTracker)
cd engine && bun run test

# Type-check all services
cd backend && bun run typecheck
cd engine && bun run typecheck

# Lint frontend
cd frontend && bun run lint

# Full CI pipeline (runs automatically on push via GitHub Actions)
```

---

## 📁 Project Structure

```
cxe/
├── 🔷 backend/                    # Express API Server
│   ├── src/
│   │   ├── controllers/           # Request handlers (auth, orders)
│   │   ├── routes/                # Express route definitions
│   │   ├── store/                 # Pending response tracking
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Auth helpers, engine client, env
│   │   ├── ws-server.ts           # WebSocket server (PnL + prices)
│   │   └── index.ts               # Express app entrypoint
│   ├── prisma/                    # Database schema & migrations
│   └── Dockerfile
│
├── ⚙️ engine/                     # Matching Engine Worker
│   ├── src/
│   │   ├── PaperEngine.ts         # Core fill logic & order processing
│   │   ├── OrderBook.ts           # Bid/Ask order book management
│   │   ├── PriceOracle.ts         # Binance WebSocket price feed
│   │   ├── PositionTracker.ts     # Long/Short position management
│   │   ├── PnLCalculator.ts       # Unrealized P&L tick engine
│   │   ├── OrderBook.test.ts      # OrderBook unit tests
│   │   ├── PositionTracker.test.ts# Position tracking unit tests
│   │   └── index.ts               # Engine entrypoint & Redis listener
│   ├── prisma/                    # Shared schema for hydration
│   └── Dockerfile
│
├── 🌐 frontend/                   # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthScreen.tsx     # Login / Signup UI
│   │   │   ├── PriceChart.tsx     # TradingView candlestick chart
│   │   │   ├── OrderBook.tsx      # Live order book depth display
│   │   │   ├── OrderForm.tsx      # Trading ticket (buy/sell)
│   │   │   ├── PositionsTable.tsx # Positions, orders & fills
│   │   │   ├── PortfolioPage.tsx  # Portfolio overview
│   │   │   ├── EarnPage.tsx       # Deposit & earn page
│   │   │   └── Layout.tsx         # Header, footer, navigation
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts    # WebSocket hook for live data
│   │   ├── lib/
│   │   │   └── api.ts             # Typed REST API client
│   │   └── App.tsx                # Root app with routing
│   ├── nginx.conf                 # Production reverse proxy config
│   └── Dockerfile
│
├── .github/workflows/
│   └── ci.yml                     # Full CI/CD pipeline
├── docker-compose.yml             # Complete stack orchestration
└── README.md                      # You are here ✨
```

---

## 🔄 CI/CD Pipeline

Every push to `main` or `frontend` triggers the full pipeline:

```
┌────────────┐   ┌────────────┐   ┌────────────┐
│  Backend   │   │   Engine   │   │  Frontend  │
│  Typecheck │   │  Typecheck │   │   ESLint   │
│            │   │  Unit Test │   │   Build    │
└──────┬─────┘   └──────┬─────┘   └──────┬─────┘
       │                │                │
       └────────┬───────┴────────┬───────┘
                │                │
        ┌───────▼────────┐       │
        │  Docker Build  │       │
        │  & Push to Hub │       │
        └───────┬────────┘       │
                │                │
        ┌───────▼────────┐       │
        │  SSH Deploy    │       │
        │  to Production │       │
        └────────────────┘
```

---

## 🧠 Engine Deep Dive

### How the Matching Engine Works

The engine is the heart of CXE. It runs as a standalone Bun process that:

1. **Hydrates** — On startup, connects to PostgreSQL once to load existing balances and active orders into RAM.
2. **Listens** — Enters an infinite `brPop` loop on Redis queue `backend-to-engine-broker`, processing one message at a time (FIFO).
3. **Processes** — Each message is handled **synchronously** — no `await` in the hot path. This guarantees deterministic ordering.
4. **Matches** — The `PaperEngine` checks the `PriceOracle` for the current Binance price. Market orders fill instantly. Limit orders either fill (if price has crossed) or rest in the `OrderBook`.
5. **Reacts** — On every Binance price tick, the engine scans all resting limit orders. Any that can now fill are removed from the book and executed.
6. **Tracks** — The `PositionTracker` maintains a per-user position state (qty, avgCost, side) and computes realized P&L on every fill.
7. **Broadcasts** — The `PnLCalculator` recalculates unrealized P&L on every tick and publishes to Redis pub/sub → WebSocket → Browser.

### Balance Management

```
User signs up → $50,000 paper USD credited
       ↓
Market BUY 0.5 BTC @ $67,000 → USD -= $33,500
       ↓
Position opened: LONG 0.5 BTC, avgCost = $67,000
       ↓
Price ticks to $68,000 → Unrealized P&L = +$500 (pushed via WebSocket)
       ↓
Market SELL 0.5 BTC @ $68,000 → USD += $34,000, Realized P&L = +$500
       ↓
Position closed. Balance = $50,500 🎉
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new engine logic
4. Ensure all checks pass (`bun run typecheck && bun run test`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with 💜 by <a href="https://github.com/thisisvaishnav">Vaishnav</a></strong>
</p>

<p align="center">
  <sub>CXE — Where paper trades feel real.</sub>
</p>
