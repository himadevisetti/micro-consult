// src/server/routes/forgot-password.ts

import { Router } from "express";
import crypto from "crypto";
import { logDebug, logError } from "../../utils/logger.js";
import { track } from "../../../track.js";
import { findUserByEmail, savePasswordResetToken } from "../../models/UserRepository.js";
import { sendPasswordResetEmail } from "../../utils/mailer.js";

const router = Router();

/**
 * POST /forgot-password
 * Request body: { email: string }
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body as { email: string };

  logDebug("forgotPassword.request.received", { email });

  if (!email || typeof email !== "string") {
    logError("forgotPassword.invalidPayload", { email });
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      // Do not reveal whether the email exists
      logDebug("forgotPassword.noUser", { email });
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString("hex");
    const ttlHours = parseInt(process.env.RESET_TOKEN_TTL_HOURS ?? "1", 10);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    // Save token + expiry in repository
    await savePasswordResetToken(user.id, token, expiresAt);

    // Send reset email
    await sendPasswordResetEmail(email, token);

    logDebug("forgotPassword.success", {
      email,
      userId: user.id,
      customerId: user.customerId,
      createdAt: user.createdAt,
    });

    // Track event
    await track("user_forgot_password", {
      email,
      userId: user.id,
      customerId: user.customerId,
      createdAt: user.createdAt,
      flowName: "ForgotPasswordRoute",
    });

    return res.status(200).json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (err) {
    logError("forgotPassword.error", {
      email,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ success: false, error: "Failed to process forgot password request" });
  }
});

export default router;
