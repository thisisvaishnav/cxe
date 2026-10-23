import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getAuth, verifyToken } from "@clerk/express";
import { env } from "./env.js";
import { prisma } from "../db.js";
import { updateRedisBalance } from "./engine-client.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface TokenPayload {
  userId: string;
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export async function ensureUserProvisioned(
  userId: string,
  email?: string | null,
  username?: string | null
): Promise<void> {
  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: { balance: true },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          id: userId,
          email: email ?? null,
          username: username ?? userId,
          balance: {
            create: {
              usd: 50000.0,
            },
          },
        },
      });
      await updateRedisBalance(userId, 50000.0);
    } else if (!existing.balance) {
      await prisma.balance.create({
        data: {
          userId,
          usd: 50000.0,
        },
      });
      await updateRedisBalance(userId, 50000.0);
    }
  } catch (error) {
    console.error(`[ensureUserProvisioned] Error provisioning user ${userId}:`, error);
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

  // 1. Try @clerk/express getAuth
  try {
    const clerkAuth = getAuth(req);
    if (clerkAuth && clerkAuth.userId) {
      req.userId = clerkAuth.userId;
      await ensureUserProvisioned(clerkAuth.userId);
      return next();
    }
  } catch {
    // Proceed to token verification
  }

  if (!token) {
    res.status(401).json({ error: "Missing auth token" });
    return;
  }

  // 2. Try Clerk verifyToken if secret key is present
  if (env.clerkSecretKey) {
    try {
      const verified = await verifyToken(token, {
        secretKey: env.clerkSecretKey,
      });
      if (verified && verified.sub) {
        req.userId = verified.sub;
        await ensureUserProvisioned(verified.sub);
        return next();
      }
    } catch {
      // Continue to fallback
    }
  }

  // 3. Fallback to legacy JWT verification
  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    req.userId = payload.userId;
    await ensureUserProvisioned(payload.userId);
    return next();
  } catch {
    res.status(401).json({ error: "Invalid auth token" });
  }
}
