import dotenv from "dotenv";

// Load .env.local if present (e.g. from clerk env pull), then fall back to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env variable: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? "3000"),
  redisUrl: readRequiredEnv("REDIS_URL"),
  jwtSecret: process.env.JWT_SECRET ?? process.env.CLERK_SECRET_KEY ?? "cxe_secret_fallback",
  clerkPublishableKey:
    process.env.CLERK_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    process.env.VITE_CLERK_PUBLISHABLE_KEY ??
    "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET ?? "",
  incomingQueue: process.env.INCOMING_QUEUE ?? "backend-to-engine-broker",
  responseQueue: `response-queue-${process.env.BACKEND_QUEUE_ID ?? crypto.randomUUID()}`,
  engineTimeoutMs: Number(process.env.ENGINE_TIMEOUT_MS ?? "30000"),
};
