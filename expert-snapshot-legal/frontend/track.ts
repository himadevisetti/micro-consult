// track.ts

import { logWarn } from "./src/utils/logger.js";
import { safeImport } from "./src/utils/safeImport.js";

/**
 * Tracks telemetry events in both frontend and backend contexts.
 * Uses App Insights JS SDK in browser, and devServer.mts in Node.
 */
export async function track(
  name: string,
  properties: Record<string, any>
): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      const { appInsights } = await import("./telemetryClient");
      appInsights.trackEvent({ name, properties });
    } else {
      const mod = await safeImport("./devServer.mts");
      mod?.telemetry?.trackEvent({ name, properties });
    }
  } catch (err) {
    logWarn("track.telemetryFailed", {
      eventName: name,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
