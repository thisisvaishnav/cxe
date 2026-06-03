# Engine Overview

The `engine` folder contains the core Trading Matching Engine for the exchange. It is responsible for processing trade orders, managing in-memory user balances, and executing trades by matching buyers and sellers. 

Engine design focuses on extremely high performance and strict sequential processing. It avoids database latency during live operations by doing all core operations exclusively in RAM.

## Key Features

1. **In-Memory State**: 
   Maintains all active Orderbooks and User Balances in standard fast memory structures (`Map` and `Array`). It completely avoids relying on a database layer for real-time validations.

2. **Hydration Phase**:
   When the engine starts (`init()`), it connects to the database exactly once to reconstruct ("hydrate") its state. It loads balances and active orders into RAM so no further read/write blocking from database calls occurs during trading.

3. **Message Queue Architecture**:
   It runs a continuous listener loop, reading incoming instructions strictly in FIFO (First-In, First-Out) order from a Redis Queue (`backend-to-engine-broker`). This guarantees no race conditions.

4. **Synchronous Routing (`processMessage`)**:
   Once an event is popped off the Redis queue, it is processed entirely synchronously – there are no `await` statements in the order processing pipeline.

5. **Order Matching Algorithm**:
   Contains `OrderBook` logic which holds the bid (buyers) and ask (sellers) lists. When orders are placed, the engine verifies the balances instantly, locks the required funds, and matches orders that cross the spread.

## Technologies Used
* **Runtime**: [Bun](https://bun.sh/) (configured via `package.json`).
* **Message Broker**: Redis (`redis` client) handles high-speed communication between the backend and engine.
* **Language**: TypeScript (`index.ts`, `engine.ts`, `OrderBook.ts`, `types.ts`).

## Core Files

- **`engine.ts`**: The main Engine class. Maintains the Redis connections, hydration logic, queue listener loop, and balance locking mechanics.
- **`OrderBook.ts`**: Implements the matching algorithm for specific trading pairs (e.g., `BTC_USDT`). Manages the Bids/Asks queues and sorts them via price-time priority.
- **`types.ts`**: Centralized TypeScript definitions for orders and messages interacting within the core Engine.
- **`db.ts`**: Contains dummy/mocked database abstractions used solely for the initial hydration phase.
- **`utils/env.ts`**: Environment variable validation and access.
- **`store/exchange-store.ts`**: Additional logic related to engine state holding.

## How to Run

From the `engine` directory, simply run:
```bash
bun install
bun run dev
```
*(Requires a running local Redis instance and Database configuration)*
