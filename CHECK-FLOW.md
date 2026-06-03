# Check Backend → Queue → Engine → Queue → Backend Flow

Use this guide to confirm the queue flow is working before implementing the real order book logic.

The current engine has a small dummy `create_order` response so you can test the full round trip:

```txt
backend -> backend-to-engine-broker -> engine -> response-queue-* -> backend
```

## 1. Start Redis

```bash
redis-server
```

## 2. Start The Engine

In one terminal:

```bash
cd engine
bun run dev
```

Expected log:

```txt
Engine listening on Redis queue: backend-to-engine-broker
```

## 3. Start The Backend

In another terminal:

```bash
cd backend
bun run dev
```

Expected backend URL:

```txt
http://localhost:3000
```

## 4. Signup

In Postman:

```txt
POST http://localhost:3000/signup
```

Body:

```json
{
  "username": "alice",
  "password": "password123"
}
```

Example response:

```json
{
  "token": "jwt-token",
  "userId": "user-id",
  "username": "alice"
}
```

Copy the `token`.

## 5. Signin

If the user already exists, use signin instead:

```txt
POST http://localhost:3000/signin
```

Body:

```json
{
  "username": "alice",
  "password": "password123"
}
```

Copy the returned `token`.

## 6. Create Order

In Postman:

```txt
POST http://localhost:3000/order
```

Headers:

```txt
Authorization: Bearer <paste-token-here>
Content-Type: application/json
```

Body:

```json
{
  "type": "limit",
  "side": "buy",
  "symbol": "BTC",
  "price": 100,
  "qty": 1
}
```

Expected response:

```json
{
  "orderId": "...",
  "status": "filled",
  "filledQty": 1,
  "averagePrice": 100,
  "fills": [
    {
      "fillId": "...",
      "symbol": "BTC",
      "price": 100,
      "qty": 1,
      "buyOrderId": "request-buy-order",
      "sellOrderId": "dummy-sell-order-1"
    }
  ],
  "note": "Smoke-test response only. Students must replace this with real matching logic."
}
```

## What This Confirms

If the `/order` request returns the dummy response, this confirms:

- backend accepted the HTTP request
- backend sent a message to Redis queue `backend-to-engine-broker`
- engine consumed the message
- engine sent a response to the backend-specific `responseQueue`
- backend matched the response using `correlationId`
- backend returned the engine response to Postman

After this works, students should remove the dummy response and implement the real engine logic.
