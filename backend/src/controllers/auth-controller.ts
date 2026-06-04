import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { authSchema } from "../types/auth-schema.js";
import { createToken } from "../utils/auth.js";
import { sendValidationError } from "../utils/validation.js";

export async function signup(req: Request, res: Response): Promise<void> {
  const parsedBody = authSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendValidationError(res, parsedBody.error);
    return;
  }

  const { username, password } = parsedBody.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        balance: {
          create: {
            usd: 1000.0, // Set initial USD balance to 1000 for development testing
          },
        },
      },
      include: {
        balance: true,
      },
    });

    res.status(201).json({
      token: createToken({ userId: user.id.toString() }), // Convert Int to string to match TokenPayload
      userId: user.id,
      username: user.username,
      balance: user.balance?.usd ?? 0,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(409).json({ error: "username already exists" });
  }
}

export async function signin(req: Request, res: Response): Promise<void> {
  // 1. Validate the body using the existing Zod schema
  const parsedBody = authSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendValidationError(res, parsedBody.error);
    return;
  }

  const { username, password } = parsedBody.data;

  try {
    // 2. Find the user by username, including their balance
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        balance: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    // 3. Compare the request password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    // 4. Return JWT token, user details, and balance
    res.status(200).json({
      token: createToken({ userId: user.id.toString() }), // Convert Int to string to match TokenPayload
      userId: user.id,
      username: user.username,
      balance: user.balance?.usd ?? 0,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "internal_server_error" });
  }
}
