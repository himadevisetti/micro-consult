// track.ts

import { logError } from "./src/utils/logger.js";
import { safeImport } from "./src/utils/safeImport.js";
import { logTelemetryEvent } from "./src/utils/logTelemetryEvent.js";

// 🔹 Injected at build time by Vite
declare const __DISABLE_TELEMETRY__: boolean;

/**
 * Tracks telemetry events in both frontend and backend contexts.
 * Uses App Insights JS SDK in browser, and devServer.mts in Node.
 */
export async function track(
  name: string,
  properties: Record<string, any>
): Promise<void> {
  if (typeof __DISABLE_TELEMETRY__ !== "undefined" && __DISABLE_TELEMETRY__) {
    return;
  }

  try {
    if (typeof window !== "undefined") {
      const mod = await safeImport("./telemetryClient.js");
      const didSend = await mod?.trackEvent?.(name, properties);
      logTelemetryEvent(
        didSend ? "success" : "noop",
        "browser",
        name,
        didSend ? undefined : "telemetry disabled or client unavailable"
      );
    } else {
      const mod = await safeImport(new URL("./devServer.mjs", import.meta.url).href);
      const didSend = mod?.default?.trackEvent?.({ name, properties });
      logTelemetryEvent(
        didSend ? "success" : "noop",
        "server",
        name,
        didSend ? undefined : "telemetry disabled or client unavailable"
      );
    }
  } catch (err) {
    logTelemetryEvent("failed", typeof window !== "undefined" ? "browser" : "server", name, "exception during track()");
    logError("track.telemetryFailed", {
      eventName: name,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
