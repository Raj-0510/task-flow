import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET!;

export type AppRole = "ADMIN" | "MEMBER" | "VIEWER";

export interface AuthRequest extends Request {
  userId?: string;
  role?: AppRole;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Loads user role from DB after authMiddleware. Use after authMiddleware on protected routes. */
export async function roleMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    }) as { role: AppRole } | null;
    if (!user) return res.status(404).json({ error: "User not found" });
    req.role = user.role;
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load user role" });
  }
}

/** Reject if role is VIEWER (read-only). Use for create/update/delete. */
export function requireCanMutate(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role === "VIEWER") {
    return res.status(403).json({ error: "Viewer role cannot perform this action" });
  }
  next();
}