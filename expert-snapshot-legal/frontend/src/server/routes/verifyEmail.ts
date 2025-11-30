// src/server/routes/verifyEmail.ts

import { Router } from "express";
import { logDebug, logError } from "../../utils/logger.js";
import {
  findVerificationToken,
  markUserVerified,
  deleteVerificationToken,
  isTokenExpired,
} from "../../models/UserRepository.js";

const router = Router();

/**
 * GET /api/verify-email?token=abc123
 * Verifies a user's email address using the token sent via email.
 */
router.get("/verify-email", async (req, res) => {
  const { token } = req.query as { token?: string };
  logDebug("verifyEmail.routeHit", { token });

  if (!token) {
    logError("verifyEmail.missingToken", {});
    return res.status(400).json({ success: false, error: "Missing verification token" });
  }

  try {
    // Step 1: Look up token
    const record = await findVerificationToken(token);
    if (!record) {
      logError("verifyEmail.invalidToken", { token });
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    // Step 2: Check expiration via helper
    if (isTokenExpired(record)) {
      logError("verifyEmail.tokenExpired", { token, userId: record.userId });
      await deleteVerificationToken(token); // cleanup expired token
      return res.status(400).json({ success: false, error: "Verification token expired" });
    }

    // Step 3: Mark user as verified
    await markUserVerified(record.userId);

    // Step 4: Delete token
    await deleteVerificationToken(token);

    logDebug("verifyEmail.success", { userId: record.userId });

    return res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    logError("verifyEmail.error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ success: false, error: "Failed to verify email" });
  }
});

export default router;
