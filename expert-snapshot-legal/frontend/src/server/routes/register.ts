// src/server/routes/register.ts

import { Router } from "express";
import { logDebug, logError } from "../../utils/logger.js";
import { track } from "../../../track.js";
import { hashPassword } from "../../utils/hashPassword.js";
import { findUserByEmail, createUser, saveVerificationToken } from "../../models/UserRepository.js";
import { parseAndValidateRegistrationForm } from "../../utils/parseAndValidateRegistrationForm.js";
import { RegistrationFormData } from "../../types/RegistrationForm";
import crypto from "crypto";
import { sendVerificationEmail } from "../../utils/mailer.js"; // utility to send email

const router = Router();

router.post("/register", async (req, res) => {
  const formData = req.body as RegistrationFormData;

  logDebug("register.request.received", {
    keys: Object.keys(req.body || {}),
    email: formData?.email,
  });

  // Step 1: Validate payload
  const errors = parseAndValidateRegistrationForm(formData);
  if (Object.keys(errors).length > 0) {
    logError("register.invalidPayload", { errors });
    return res.status(400).json({ success: false, errors });
  }

  try {
    // Step 2: Check for duplicate email
    const existingUser = await findUserByEmail(formData.email);
    if (existingUser) {
      logError("register.duplicateEmail", { email: formData.email });
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    // Step 3: Hash password
    const passwordHash = await hashPassword(formData.password);

    // Step 4: Insert user with isVerified = 0
    const user = await createUser(
      formData.firstName,
      formData.lastName,
      formData.email,
      passwordHash,
      false // isVerified
    );
    // user = { id, customerId, createdAt }

    // Step 5: Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    await saveVerificationToken(user.id, token);

    // Step 6: Send verification email
    await sendVerificationEmail(formData.email, token);

    logDebug("register.success", {
      email: formData.email,
      userId: user.id,
      customerId: user.customerId,
      createdAt: user.createdAt,
    });

    // Step 7: Track event
    await track("user_registered", {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      flowName: "RegisterRoute",
      userId: user.id,
      customerId: user.customerId,
      createdAt: user.createdAt,
    });

    // Step 8: Respond (pending verification)
    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      userId: user.id,
      customerId: user.customerId,
      createdAt: user.createdAt,
    });
  } catch (err) {
    logError("register.error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return res.status(500).json({ success: false, error: "Failed to register user" });
  }
});

export default router;
