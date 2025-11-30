// devServer.mts
// -----------------------------
// Development + Production server bootstrap
// -----------------------------
// - Loads environment variables and shared config
// - Sets up telemetry (App Insights)
// - Asserts storage mount and Azure RBAC credential (via utility)
// - Configures API routes and SPA fallback
// - Handles dev (Vite middleware) vs prod (static assets)
// - Provides clean shutdown hooks

// Load environment variables first
import {
  frontendSourcePath,
  frontendBuildPath,
  indexPath,
} from "./src/server/config.js";

// Resolve __dirname for ESM
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import fs from "fs";

// API routes
import exportPdfRoute from "./src/server/routes/exportPdf.js";
import exportDocxRoute from "./src/server/routes/exportDocx.js";
import listTemplatesRoute from "./src/server/routes/listTemplates.js";
import uploadTemplateRoute from "./src/server/routes/uploadTemplate.js";
import confirmMappingRoute from "./src/server/routes/confirmMapping.js";
import getManifestRoute from "./src/server/routes/getManifest.js";
import generateDocumentRoute from "./src/server/routes/generateDocument.js";
import runtimeConfigRouter from "./src/server/routes/runtimeConfig.js";
import registerRoute from "./src/server/routes/register.js";
import loginRoute from "./src/server/routes/login.js";
import verifyEmailRoute from "./src/server/routes/verifyEmail.js";
import microsoftLoginRoute from "./src/server/routes/microsoftLogin.js";
import logoutRoute from "./src/server/routes/logout.js";
import { checkPortAvailability } from "./src/server/utils/checkPortAvailability.js";
import { killProcessOnPort } from "./src/server/utils/killProcessOnPort.js";
import { logDebug } from "./src/utils/logger.js";

// 🔹 Import RBAC assertion utility
import { assertAzureCredential } from "./src/server/utils/assertAzureCredential.js";

// Telemetry setup (Application Insights)
import appInsights from "applicationinsights";

const disableTelemetry = process.env.DISABLE_TELEMETRY === "true";
const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "";
const instrumentationKey = process.env.APPINSIGHTS_INSTRUMENTKEY || "";

let client = null;
if (!disableTelemetry && (connectionString || instrumentationKey)) {
  const setup = connectionString || instrumentationKey;
  appInsights.setup(setup).setInternalLogging(false, false).start();
  if (appInsights.defaultClient) {
    (appInsights.defaultClient.config as any).enableAzureVmMetaData = false;
    client = appInsights.defaultClient;
  }
}

// Export telemetry interface for track.ts
export default {
  trackEvent: (event: { name: string; properties: any }) => {
    if (client) {
      client.trackEvent(event);
      return true; // ✅ explicitly signal success
    } else {
      return false; // ✅ signal that event was skipped
    }
  },
};

// TTL log for candidate expiration
const ttlMs = parseInt(process.env.CANDIDATE_TTL_MS || "", 10) || 60 * 60 * 1000;
logDebug("server.ttl", { ttlMs });

// Assert persistent storage mount exists
const storageRoot = process.env.STORAGE_PATH || "/storage";
if (!fs.existsSync(storageRoot)) {
  console.error(`❌ Startup failed: STORAGE_PATH '${storageRoot}' does not exist.`);
  process.exit(1);
}

const isDev = process.env.NODE_ENV !== "production";

async function startDevServer() {
  // Must be first to patch Express routing behavior
  await import(pathToFileURL(path.join(__dirname, "patch-path-to-regexp.js")).href);

  // Early boot log for Azure diagnostics
  console.log("Bootstrapping server...");

  // 🔹 Fail fast if RBAC misconfigured
  await assertAzureCredential();

  const app = express();
  app.use(express.json());

  // ✅ Serve telemetry files from /app
  app.use(express.static(__dirname, { extensions: ["js"], index: false }));

  // Serve styles if needed (dev only)
  app.use("/src/styles", express.static(path.resolve(__dirname, "src/styles")));

  // API routes
  app.use("/api", exportPdfRoute);
  app.use("/api", exportDocxRoute);
  app.use("/api", listTemplatesRoute);
  app.use("/api", uploadTemplateRoute);
  app.use("/api", confirmMappingRoute);
  app.use("/api", getManifestRoute);
  app.use("/api", generateDocumentRoute);
  app.use("/", runtimeConfigRouter);
  app.use("/api", registerRoute);
  app.use("/api", loginRoute);
  app.use("/api", verifyEmailRoute);
  app.use("/api", microsoftLoginRoute);
  app.use("/api", logoutRoute);

  // Bind to Azure-injected port and host
  const PORT = parseInt(process.env.PORT || "8080", 10);
  const HOST = process.env.BIND_HOST || "127.0.0.1";

  if (isDev) {
    // Check if port is already bound (e.g. orphaned process from previous session)
    const portAvailable = await checkPortAvailability(PORT, HOST);
    if (!portAvailable) {
      try {
        const pids = killProcessOnPort(PORT);
        console.warn(`Port ${PORT} was in use. Killed orphaned process(es):`, pids);
        console.log("Proceeding to restart server...");
      } catch (err) {
        console.error("Failed to kill orphaned process:", err);
        process.exit(1);
      }
    }

    // Vite in middleware mode handles HMR + frontend assets
    console.log("Running in development mode. Starting Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      root: frontendSourcePath,
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static assets
    console.log("Running in production mode. Serving static frontend...");
    logDebug("server.staticConfig", {
      frontendBuildPath,
      indexExists: fs.existsSync(indexPath),
    });

    app.use(express.static(frontendBuildPath));

    // SPA fallback for React Router
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next(); // ✅ safeguard: API routes never swallowed by SPA fallback
      }
      logDebug("server.frontendRoute", { url: req.url });
      res.sendFile(indexPath);
    });
  }

  // Diagnostic logs for Azure startup probe
  console.log("Attempting to start server...");
  console.log("PORT =", PORT);
  console.log("HOST =", HOST);

  const server = app.listen(PORT, HOST, () => {
    console.log("Server started successfully.");
    logDebug("server.started", {
      url: `http://${HOST}:${PORT}`,
      mode: isDev ? "development" : "production",
      azureEndpoint: process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
    });
  });

  // Clean shutdown on SIGINT and SIGTERM
  const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down server...`);
    server.close(() => {
      console.log("Server closed. Exiting process.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startDevServer();
