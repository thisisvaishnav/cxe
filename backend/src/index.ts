import cors from "cors";
import * as http from "http";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { appRouter } from "./routes/index.js";
import { env } from "./utils/env.js";
import {
  connectRedis,
  listenForEngineResponses,
  pingRedis,
} from "./utils/engine-client.js";
import { attachWebSocketServer } from "./ws-server.js";

await connectRedis();
void listenForEngineResponses();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  await pingRedis();
  res.json({ ok: true });
});

app.use(appRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: err instanceof Error ? err.message : "internal_server_error",
  });
});

// ─── Create a shared HTTP server so REST and WebSocket share one port ─────────
const httpServer = http.createServer(app);

// ─── Attach the WebSocket server (subscribes to Redis pnl-updates channel) ───
await attachWebSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
  console.log(`WebSocket endpoint: ws://localhost:${env.port}/ws`);
  console.log(`Response queue: ${env.responseQueue}`);
});

