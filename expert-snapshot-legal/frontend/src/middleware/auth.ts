// src/middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Authentication middleware (stateless JWT).
 *
 * 🔹 This app does not use server-side sessions or cookies.
 *     - All authentication state is stored in the browser's sessionStorage.
 *     - The backend only validates JWTs on each request.
 * 🔹 The /logout route therefore does not need to clear server-side state.
 *     - Frontend logout clears sessionStorage and navigates to /login.
 *     - Microsoft front-channel logout calls /logout, which simply redirects.
 *
 * This middleware:
 *   - Extracts the Bearer token from the Authorization header.
 *   - Verifies the JWT using the shared secret.
 *   - Attaches the decoded payload ({ userId, customerId }) to req.user.
 *   - Rejects requests with missing, invalid, or expired tokens.
 */
export interface AuthRequest extends Request {
  user?: { userId: number; customerId: string };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, error: "Missing token" });
  }

  try {
    // Explicitly cast secret to string so TS knows it's valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      customerId: string;
    };

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
}
