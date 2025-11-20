// track.ts

import { logDebug, logWarn, logError } from "./src/utils/logger.js";
import { safeImport } from "./src/utils/safeImport.js";

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
  logDebug("track.firing", { name, properties });

  // 🔹 Short-circuit if telemetry is disabled (Vite-injected constant)
  if (typeof __DISABLE_TELEMETRY__ !== "undefined" && __DISABLE_TELEMETRY__) {
    logDebug("track.noop.disabled", { name });
    return;
  }

  try {
    const isBrowser = typeof window !== "undefined";

    if (isBrowser) {
      const mod = await safeImport("./telemetryClient.js");
      if (mod?.trackEvent) {
        const didSend = await mod.trackEvent(name, properties);
        if (didSend) {
          logDebug("track.success.browser", { name });
        } else {
          logDebug("track.noop.browser", { name, reason: "telemetry disabled or client unavailable" });
        }
      } else {
        logWarn("track.noop.browser", {
          name,
          reason: "trackEvent missing in telemetryClient",
        });
      }
    } else {
      const mod = await safeImport(new URL("./devServer.mjs", import.meta.url).href);
      if (mod?.default?.trackEvent) {
        const didSend = mod.default.trackEvent({ name, properties });
        if (didSend) {
          logDebug("track.success.server", { name });
        } else {
          logDebug("track.noop.server", { name, reason: "telemetry disabled or client unavailable" });
        }
      } else {
        logWarn("track.noop.server", {
          name,
          reason: "trackEvent missing in default export",
        });
      }
    }
  } catch (err) {
    logError("track.telemetryFailed", {
      eventName: name,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
