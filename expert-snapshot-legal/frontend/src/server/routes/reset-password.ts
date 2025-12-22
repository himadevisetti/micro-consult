// src/server/routes/reset-password.ts

import { Router } from "express";
import { logDebug, logError } from "../../utils/logger.js";
import { track } from "../../../track.js";
import { hashPassword } from "../../utils/hashPassword.js";
import {
  findPasswordResetToken,
  deletePasswordResetToken,
  isPasswordResetTokenExpired,
} from "../../models/UserRepository.js";
import { poolPromise } from "../../db/connection.js";
import sql from "mssql";

const router = Router();

/**
 * POST /reset-password
 * Request body: { token: string, newPassword: string }
 */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body as { token: string; newPassword: string };

  logDebug("resetPassword.request.received", { token });

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: "Token and newPassword are required" });
  }

  try {
    // Step 1: Find token record
    const record = await findPasswordResetToken(token);
    if (!record) {
      logError("resetPassword.invalidToken", { token });
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    // Step 2: Check expiration
    if (isPasswordResetTokenExpired(record)) {
      await deletePasswordResetToken(token);
      logError("resetPassword.expiredToken", { token });
      return res.status(400).json({ success: false, error: "Token has expired" });
    }

    // Step 3: Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Step 4: Update user password
    const pool = await poolPromise;
    await pool.request()
      .input("userId", sql.Int, record.userId)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .query(`
        UPDATE Users
        SET passwordHash = @passwordHash, updatedAt = GETDATE()
        WHERE id = @userId
      `);

    // Step 5: Delete token after use
    await deletePasswordResetToken(token);

    logDebug("resetPassword.success", { userId: record.userId });

    // Step 6: Track event
    await track("user_reset_password", {
      userId: record.userId,
      flowName: "ResetPasswordRoute",
    });

    return res.status(200).json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    logError("resetPassword.error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ success: false, error: "Failed to reset password" });
  }
});

export default router;

