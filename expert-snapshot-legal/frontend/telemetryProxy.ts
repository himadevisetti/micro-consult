// telemetryProxy.ts

import { logWarn } from "./src/utils/logger.js";
import { safeImport } from "./src/utils/safeImport.js";

/**
 * Dynamically imports telemetry from devServer.mts and tracks an event.
 * Safe for use in both frontend and backend contexts.
 */
export async function track(
  name: string,
  properties: Record<string, any>
): Promise<void> {
  if (typeof window !== "undefined") return;

  try {
    const mod = await safeImport("./devServer.mts");
    mod?.telemetry?.trackEvent({ name, properties });
  } catch (err) {
    logWarn("telemetryProxy.importFailed", {
      eventName: name,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
