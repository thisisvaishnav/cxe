import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { Webhook } from "svix";
import { prisma } from "../db.js";
import { authSchema } from "../types/auth-schema.js";
import { createToken, ensureUserProvisioned } from "../utils/auth.js";
import { sendValidationError } from "../utils/validation.js";
import { updateRedisBalance } from "../utils/engine-client.js";
import { env } from "../utils/env.js";

export async function signup(req: Request, res: Response): Promise<void> {
  const parsedBody = authSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendValidationError(res, parsedBody.error);
    return;
  }

  const { username, password } = parsedBody.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userId = `usr_${crypto.randomUUID()}`;
    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        email: `${username}@cxe.local`,
        balance: {
          create: {
            usd: 50000.0,
          },
        },
      },
      include: {
        balance: true,
      },
    });

    // Sync default balance to Redis
    await updateRedisBalance(user.id, 50000.0);

    res.status(201).json({
      token: createToken({ userId: user.id }),
      userId: user.id,
      username: user.username,
      balance: user.balance?.usd ?? 50000.0,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error && error.code === "P2002") {
      res.status(409).json({ error: "username already exists" });
      return;
    }
    res.status(500).json({
      error: "Internal server error during signup",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function signin(req: Request, res: Response): Promise<void> {
  const parsedBody = authSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendValidationError(res, parsedBody.error);
    return;
  }

  const { username } = parsedBody.data;

  try {
    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        balance: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    // Give user 50k USD on sign in and update in DB
    const updatedBalance = await prisma.balance.upsert({
      where: { userId: user.id },
      create: { userId: user.id, usd: 50000.0 },
      update: { usd: 50000.0 },
    });

    // Update the balance in Redis
    await updateRedisBalance(user.id, 50000.0);

    res.status(200).json({
      token: createToken({ userId: user.id }),
      userId: user.id,
      username: user.username,
      balance: updatedBalance.usd,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function syncUser(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { email, username } = req.body || {};
  await ensureUserProvisioned(userId, email, username);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { balance: true },
  });

  res.status(200).json({
    userId: user?.id,
    username: user?.username,
    email: user?.email,
    balance: user?.balance?.usd ?? 50000.0,
  });
}

export async function clerkWebhook(req: Request, res: Response): Promise<void> {
  const webhookSecret = env.clerkWebhookSecret;
  if (!webhookSecret) {
    console.warn("[Clerk Webhook] CLERK_WEBHOOK_SECRET is not configured");
    res.status(400).json({ error: "Webhook secret not configured" });
    return;
  }

  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: "Missing svix headers" });
    return;
  }

  const payload = req.body;
  const bodyString = typeof payload === "string" ? payload : JSON.stringify(payload);
  const wh = new Webhook(webhookSecret);

  let evt: any;
  try {
    evt = wh.verify(bodyString, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("[Clerk Webhook] Verification failed:", err);
    res.status(400).json({ error: "Verification failed" });
    return;
  }

  const eventType = evt.type;
  console.log(`[Clerk Webhook] Received event: ${eventType}`);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, username, first_name } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;
    const displayName = username || first_name || primaryEmail?.split("@")[0] || id;

    await ensureUserProvisioned(id, primaryEmail, displayName);
  }

  res.status(200).json({ received: true });
}
