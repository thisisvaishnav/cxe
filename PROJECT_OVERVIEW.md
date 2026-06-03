# Project Overview: Mini Centralized Exchange (CEX)

This project is a mini centralized cryptocurrency exchange (CEX) utilizing an event-driven architecture with TypeScript, Bun, and Redis.

## Architecture

The system is separated into two primary microservices to handle high-throughput trading operations effectively:

1. **Backend (API Layer)**: Handles external HTTP requests from clients, handles user authentication, and coordinates requests. It acts as an API Gateway. It does *not* directly perform order matching logic or manage exchange state.
2. **Engine (Matching & State Layer)**: The core trading component that maintains the fast, in-memory continuous exchange state (order books, balances, active orders, and trade fills) and performs order matching.

These two services communicate entirely asynchronously via **Redis Queues**.

### Request-Response Flow
```text
Frontend / API Client
        |
        v
Backend API (Express, port 3000)
        |
        v
Redis queue: `backend-to-engine-broker`
        |
        v
Engine process (Updates State & Matches Orders)
        |
        v
Redis queue: `response-queue-[ID]` (Backend-specific)
        |
        v
Backend API Response -> Client
```

Every message sent from the backend to the engine includes a `correlationId`, a `type`, a `payload`, and a `responseQueue` so the engine knows exactly where to send the resolved data back.

## Project Structure

- **`/backend`**: The API server.
  - **Tech Stack**: Bun, Express.js, Prisma ORM (PostgreSQL), Redis client, Zod (Input Validation), and JWT (Authentication).
  - Includes controllers and routes for authentication and exchange interactions.
- **`/engine`**: The dedicated state and order matching engine.
  - **Tech Stack**: Bun, pure TypeScript, and Redis client.
  - Maintains strict in-memory state models for order books and balances.

## Running the Project

The toolchain relies on `Bun` for fast execution and package management.

1. **Start Redis**: You must have a local Redis server running.
   ```bash
   redis-server
   ```
2. **Start the Engine**:
   ```bash
   cd engine
   bun run dev
   ```
3. **Start the Backend**:
   ```bash
   cd backend
   bun run dev
   ```
   *The backend will be accessible locally at `http://localhost:3000`.*