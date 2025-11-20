import { logDebug, logWarn } from "./logger.js";

type Context = "browser" | "server";
type Result = "success" | "noop" | "failed";

/**
 * Logs telemetry delivery outcome in a structured format.
 * Caller must gate this with __DISABLE_TELEMETRY__ if needed.
 */
export function logTelemetryEvent(
  result: Result,
  context: Context,
  name: string,
  reason?: string
): void {
  const tag = `track.${result}.${context}`;
  const payload = reason ? { name, reason } : { name };

  result === "failed" ? logWarn(tag, payload) : logDebug(tag, payload);
}
