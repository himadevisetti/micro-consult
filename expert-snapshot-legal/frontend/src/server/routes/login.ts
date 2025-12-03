// src/server/routes/login.ts

import { Router } from "express";
import { logDebug, logError } from "../../utils/logger.js";
import { track } from "../../../track.js";
import { verifyPassword } from "../../utils/hashPassword.js";
import { findUserForLogin } from "../../models/UserRepository.js";
import jwt, { SignOptions } from "jsonwebtoken";

const router = Router();

/**
 * POST /api/login
 * Authenticates a user by email + password
 */
router.post("/login", async (req, res) => {
  logDebug("login.request.received", {
    keys: Object.keys(req.body || {}),
    email: req.body?.email,
  });

  const { email, password } = req.body as { email?: string; password?: string };

  // Step 1: Basic payload validation
  if (!email || !password) {
    logError("login.invalidPayload", { email });
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    // Step 2: Look up user by email
    const user = await findUserForLogin(email);
    if (!user) {
      logError("login.userNotFound", { email });
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Step 3: Verify password hash
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      logError("login.invalidPassword", { email });
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Step 4: Ensure user is verified
    if (!user.isVerified) {
      logError("login.unverifiedUser", { email, userId: user.id });
      return res.status(403).json({ success: false, error: "Email not verified" });
    }

    // Step 5: Issue JWT (expiry from env)
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "8h",
    };

    const token = jwt.sign(
      {
        userId: user.id,
        customerId: user.customerId,
        email, // 🔹 include email in JWT payload
      },
      process.env.JWT_SECRET as string,
      options
    );

    // Step 6: Log success and track telemetry
    logDebug("login.success", { email, userId: user.id, customerId: user.customerId });

    await track("user_logged_in", {
      email,
      flowName: "LoginRoute",
      userId: user.id,
      customerId: user.customerId,
    });

    // Step 7: Respond with identifiers + token
    return res.json({
      success: true,
      message: "Login successful",
      userId: user.id,
      customerId: user.customerId,
      email, // 🔹 include email in response
      createdAt: user.createdAt,
      token,
    });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("Failed to connect")) {
      logError("login.dbConnectionError", {
        message,
        stack: err instanceof Error ? err.stack : undefined,
      });
      return res.status(503).json({
        success: false,
        error: "We couldn’t reach the database server. Please try again later.",
      });
    }

    if (err.code === "ELOGIN") {
      logError("login.invalidCredentials", { email });
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    logError("login.error", {
      message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please contact support.",
    });
  }
});

export default router;
