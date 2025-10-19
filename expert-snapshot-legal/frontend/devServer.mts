// devServer.mts
import "./patch-path-to-regexp.js"; // must be first
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { fileURLToPath } from "url";
import exportPdfRoute from "./src/server/routes/exportPdf.js";
import listTemplatesRoute from "./src/server/routes/listTemplates.js";
import uploadTemplateRoute from "./src/server/routes/uploadTemplate.js";
import confirmMappingRoute from "./src/server/routes/confirmMapping.js";
import getManifestRoute from './src/server/routes/getManifest.js';
import generateDocumentRoute from './src/server/routes/generateDocument.js';
import { logDebug } from "./src/utils/logger.js";

// Shared config
import {
  frontendSourcePath,
  frontendBuildPath,
  indexPath,
} from "./src/server/config.js";

// TTL log
const ttlMs = parseInt(process.env.CANDIDATE_TTL_MS || "", 10) || 60 * 60 * 1000;
logDebug("server.ttl", { ttlMs });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";

async function startDevServer() {
  const app = express();
  app.use(express.json());

  // Serve styles if needed (dev only)
  app.use("/src/styles", express.static(path.resolve(__dirname, "src/styles")));

  // API routes
  app.use("/api", exportPdfRoute);
  app.use("/api", listTemplatesRoute);
  app.use("/api", uploadTemplateRoute);
  app.use("/api", confirmMappingRoute);
  app.use('/api', getManifestRoute);
  app.use('/api', generateDocumentRoute);

  if (isDev) {
    // Vite in middleware mode handles HMR + frontend assets
    const vite = await createViteServer({
      server: { middlewareMode: true },
      root: frontendSourcePath,
    });
    app.use(vite.middlewares);
  } else {
    logDebug("server.staticConfig", {
      frontendBuildPath,
      indexExists: fs.existsSync(indexPath),
    });

    // Serve static assets
    app.use(express.static(frontendBuildPath));

    // SPA fallback for React Router
    app.get("*", (req, res) => {
      logDebug("server.frontendRoute", { url: req.url });
      res.sendFile(indexPath);
    });
  }

  const PORT = parseInt(process.env.PORT || "3001", 10);
  app.listen(PORT, "127.0.0.1", () => {
    logDebug("server.started", {
      url: `http://localhost:${PORT}`,
      mode: isDev ? "development" : "production",
      azureEndpoint: process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
    });
  });
}

startDevServer();
