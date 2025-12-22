// src/utils/mailer.ts

import { EmailClient } from "@azure/communication-email";
import { logDebug, logError } from "./logger.js";

const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING!);

const companyName = process.env.COMPANY_NAME || "Expert Snapshot Legal";
const senderAddress = process.env.SUPPORT_EMAIL || "support@microconsultnetwork.com";

/**
 * Send a verification email with the token link.
 */
export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.APP_BASE_URL}/api/verify-email?token=${token}`;

  const message = {
    senderAddress,
    content: {
      subject: `Verify your ${companyName} account`,
      plainText: `Welcome to ${companyName}!

    Please verify your account by clicking the link below:

    ${verifyUrl}

    This email was sent from an unmonitored address. Please do not reply.
    If you did not request this, you can ignore this email.`,
      html: `
        <p>Welcome to ${companyName}!</p>
        <p>Please verify your account by clicking the link below:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p><strong>This email was sent from an unmonitored address. Please do not reply.</strong></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    },
    recipients: { to: [{ address: to }] },
  };

  try {
    const poller = await emailClient.beginSend(message);
    const response = await poller.pollUntilDone();
    logDebug("mailer.emailSent", { to, messageId: response?.id, status: response?.status });
    return response;
  } catch (err) {
    logError("mailer.error", { to, message: err instanceof Error ? err.message : String(err) });
    throw err;
  }
}

/**
 * Send a password reset email with the token link.
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.APP_BASE_URL}/reset-password?token=${token}`;

  const message = {
    senderAddress,
    content: {
      subject: `Reset your ${companyName} password`,
      plainText: `You requested a password reset for your ${companyName} account.

    Click the link below to reset your password:

    ${resetUrl}

    This email was sent from an unmonitored address. Please do not reply.`,
      html: `
        <p>You requested a password reset for your ${companyName} account.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p><strong>This email was sent from an unmonitored address. Please do not reply.</strong></p>
      `,
    },
    recipients: { to: [{ address: to }] },
  };

  try {
    const poller = await emailClient.beginSend(message);
    const response = await poller.pollUntilDone();
    logDebug("mailer.resetEmailSent", { to, messageId: response?.id, status: response?.status });
    return response;
  } catch (err) {
    logError("mailer.resetError", { to, message: err instanceof Error ? err.message : String(err) });
    throw err;
  }
}
