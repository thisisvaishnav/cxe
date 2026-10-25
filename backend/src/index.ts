import * as http from "http";
import { app } from "./app.js";
import { env } from "./utils/env.js";
import {
  connectRedis,
  listenForEngineResponses,
} from "./utils/engine-client.js";
import { attachWebSocketServer } from "./ws-server.js";

// Attempt to connect Redis (falls back to direct mode if unavailable)
await connectRedis();
void listenForEngineResponses();

// Create shared HTTP server so REST and WebSocket share one port (local/container mode)
const httpServer = http.createServer(app);

// Attach WebSocket server if running as standalone server
try {
  await attachWebSocketServer(httpServer);
} catch (err) {
  console.warn("WebSocket server attachment skipped:", err);
}

httpServer.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
  console.log(`WebSocket endpoint: ws://localhost:${env.port}/ws`);
  console.log(`Response queue: ${env.responseQueue}`);
});
