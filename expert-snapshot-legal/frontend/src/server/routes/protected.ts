// src/server/routes/protected.ts

import { Router } from "express";
import { authenticateToken, AuthRequest } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/protected
 * Example of a protected route
 */
router.get("/protected", authenticateToken, (req: AuthRequest, res) => {
  return res.json({
    success: true,
    message: "You accessed a protected route!",
    user: req.user, // contains userId + customerId from token
  });
});

export default router;

