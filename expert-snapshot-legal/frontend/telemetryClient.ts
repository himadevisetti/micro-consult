// telemetryClient.ts

import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { logWarn, logDebug } from "./src/utils/logger.js";
import { logTelemetryEvent } from "./src/utils/logTelemetryEvent.js";

// 🔹 Injected at build time by Vite
declare const __DISABLE_TELEMETRY__: boolean;

let appInsights: ApplicationInsights | null = null;

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
}

initializeTelemetry();

export async function trackEvent(name: string, properties: Record<string, any>): Promise<boolean> {
  await telemetryReady;

  if (typeof window === "undefined") {
    logTelemetryEvent("noop", "server", name, "not in browser");
    return false;
  }

  if (__DISABLE_TELEMETRY__) {
    logTelemetryEvent("noop", "browser", name, "telemetry disabled");
    return false;
  }

  if (!appInsights || typeof appInsights.trackEvent !== "function") {
    logTelemetryEvent("noop", "browser", name, "appInsights.trackEvent missing");
    return false;
  }

  try {
    appInsights.trackEvent({ name, properties });
    logTelemetryEvent("success", "browser", name);
    return true;
  } catch (err) {
    logTelemetryEvent("failed", "browser", name, "exception during trackEvent()");
    logWarn("track.failed.browser", {
      name,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
