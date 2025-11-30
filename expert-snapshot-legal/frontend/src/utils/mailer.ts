// src/utils/mailer.ts

import { EmailClient } from "@azure/communication-email";
import { logDebug, logError } from "./logger.js";

/**
 * Create a reusable Azure EmailClient.
 * Uses ACS connection string from environment.
 */
const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING!);

/**
 * Send a verification email with the token link.
 * Uses branded sender address from verified domain.
 */
export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.APP_BASE_URL}/api/verify-email?token=${token}`;

  const message = {
    senderAddress: "DoNotReply@microconsultnetwork.com",
    content: {
      subject: "Verify your Expert Snapshot Legal account",
      plainText: `Welcome! Please verify your account by clicking the link below:\n\n${verifyUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `
        <p>Welcome!</p>
        <p>Please verify your account by clicking the link below:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    },
    recipients: {
      to: [{ address: to }],
    },
  };

  try {
    const poller = await emailClient.beginSend(message);
    const response = await poller.pollUntilDone();
    const raw = poller.getOperationState();

    logDebug("mailer.emailSent", {
      to,
      messageId: response?.id,
      status: response?.status,
      operationState: raw,
    });
    return response;
  } catch (err) {
    logError("mailer.error", {
      to,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
}
