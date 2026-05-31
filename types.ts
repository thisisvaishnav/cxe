export interface UserPayload {
  userId: number;
  username: string;
}

// Augment Express Request so req.user is typed everywhere
declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}
