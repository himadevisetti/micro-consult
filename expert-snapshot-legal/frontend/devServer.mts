// devServer.mts

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
import getManifestRoute from './src/server/routes/getManifest.js';
import generateDocumentRoute from './src/server/routes/generateDocument.js';
import runtimeConfigRouter from "./src/server/routes/runtimeConfig.js";
import { logDebug } from "./src/utils/logger.js";

// Shared config
import {
  frontendSourcePath,
  frontendBuildPath,
  indexPath,
} from "./src/server/config.js";

// Telemetry setup
import appInsights from "applicationinsights";

const disableTelemetry = process.env.DISABLE_TELEMETRY === "true";
const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "";
const instrumentationKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "";

let client = null;

// Only initialize if telemetry is enabled and a key is present
if (!disableTelemetry && (connectionString || instrumentationKey)) {
  const setup = connectionString || instrumentationKey;
  appInsights
    .setup(setup)
    .setInternalLogging(false, false)
    .start();

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

const isDev = process.env.NODE_ENV !== "production";

async function startDevServer() {
  // Must be first to patch Express routing behavior
  await import(pathToFileURL(path.join(__dirname, "patch-path-to-regexp.js")).href);

  // Early boot log for Azure diagnostics
  console.log("Bootstrapping server...");

  const app = express();
  app.use(express.json());

  // ✅ Serve telemetry files from /app
  app.use(express.static(__dirname, {
    extensions: ["js"],
    index: false,
  }));

  // Serve styles if needed (dev only)
  app.use("/src/styles", express.static(path.resolve(__dirname, "src/styles")));

  // API routes
  app.use("/api", exportPdfRoute);
  app.use("/api", exportDocxRoute);
  app.use("/api", listTemplatesRoute);
  app.use("/api", uploadTemplateRoute);
  app.use("/api", confirmMappingRoute);
  app.use('/api', getManifestRoute);
  app.use('/api', generateDocumentRoute);
  app.use("/", runtimeConfigRouter);

  if (isDev) {
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
    app.get("*", (req, res) => {
      logDebug("server.frontendRoute", { url: req.url });
      res.sendFile(indexPath);
    });
  }

  // Bind to Azure-injected port and host
  const PORT = parseInt(process.env.PORT || "3001", 10);
  const HOST = process.env.BIND_HOST || "127.0.0.1";

  // Diagnostic logs for Azure startup probe
  console.log("Attempting to start server...");
  console.log("PORT =", PORT);
  console.log("HOST =", HOST);

  try {
    app.listen(PORT, HOST, () => {
      console.log("Server started successfully.");
      logDebug("server.started", {
        url: `http://${HOST}:${PORT}`,
        mode: isDev ? "development" : "production",
        azureEndpoint: process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
      });
    });
  } catch (err) {
    logDebug("server.startFailed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

startDevServer();
