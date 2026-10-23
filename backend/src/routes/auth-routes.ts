import { Router } from "express";
import {
  signin,
  signup,
  syncUser,
  clerkWebhook,
} from "../controllers/auth-controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAuth } from "../utils/auth.js";

export const authRouter = Router();

authRouter.post("/signup", asyncHandler(signup));
authRouter.post("/signin", asyncHandler(signin));
authRouter.post("/sync", requireAuth, asyncHandler(syncUser));
authRouter.get("/me", requireAuth, asyncHandler(syncUser));
authRouter.post("/clerk-webhook", asyncHandler(clerkWebhook));
