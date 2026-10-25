import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { clerkMiddleware } from "@clerk/express";
import { appRouter } from "./routes/index.js";
import { pingRedis } from "./utils/engine-client.js";

export const app = express();

app.use(cors());

// Webhooks require raw body for signature verification
app.use(
  "/api/v1/auth/clerk-webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", async (_req: Request, res: Response) => {
  const redisStatus = await pingRedis();
  res.json({ ok: true, redis: redisStatus });
});

// Support both root routes (/order, /balance) and /api routes (/api/order, /api/balance)
app.use("/api", appRouter);
app.use(appRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[App Error]", err);
  res.status(500).json({
    error: err instanceof Error ? err.message : "internal_server_error",
  });
});
