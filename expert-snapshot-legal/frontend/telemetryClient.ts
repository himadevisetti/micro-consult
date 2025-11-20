// telemetryClient.ts

import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { logDebug, logWarn } from "./src/utils/logger.js";

// 🔹 Injected at build time by Vite
declare const __DISABLE_TELEMETRY__: boolean;

let appInsights: ApplicationInsights | null = null;

// Expose a readiness promise
let telemetryReady: Promise<void>;
let resolveReady: () => void;

telemetryReady = new Promise((resolve) => {
  resolveReady = resolve;
});

async function initializeTelemetry() {
  if (__DISABLE_TELEMETRY__) {
    logDebug("telemetryClient.disabled", { reason: "__DISABLE_TELEMETRY__ = true" });
    resolveReady();
    return;
  }

  let connectionString = "";
  let instrumentationKey = "";

  try {
    const res = await fetch("/config.json");
    const config = await res.json();
    connectionString = config.APPLICATIONINSIGHTS_CONNECTION_STRING || "";
    instrumentationKey = config.APPINSIGHTS_INSTRUMENTATIONKEY || "";
  } catch (err) {
    logWarn("telemetryClient.configLoadFailed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  appInsights = new ApplicationInsights({
    config: {
      ...(connectionString
        ? { connectionString }
        : { instrumentationKey }),
      enableAutoRouteTracking: true,
    },
  });

  appInsights.loadAppInsights();
  resolveReady();

  logDebug("telemetryClient.ready", {
    method: connectionString
      ? "connectionString"
      : instrumentationKey
        ? "instrumentationKey"
        : "none",
  });
}

initializeTelemetry();

export async function trackEvent(name: string, properties: Record<string, any>): Promise<boolean> {
  await telemetryReady;

  if (typeof window === "undefined") {
    logDebug("track.noop.server", { name });
    return false;
  }

  if (__DISABLE_TELEMETRY__) {
    logDebug("track.noop.disabled", { name });
    return false;
  }

  if (!appInsights || typeof appInsights.trackEvent !== "function") {
    logDebug("track.noop.browser", {
      name,
      reason: "appInsights.trackEvent missing",
    });
    return false;
  }

  try {
    appInsights.trackEvent({ name, properties });
    logDebug("track.success.browser", { name });
    return true;
  } catch (err) {
    logWarn("track.failed.browser", {
      name,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
