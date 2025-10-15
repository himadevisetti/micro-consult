// src/server/config.ts
import * as dotenv from "dotenv";
// Load .env first, then override with .env.local if present
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import path from "path";
import { fileURLToPath } from "url";
import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";

// Resolve __dirname for relative fallbacks
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -----------------------------
// Root resolution
// -----------------------------
export const root =
  process.env.PROJECT_ROOT ||
  // fallback: repo root (4 levels up from src/server/config.ts)
  path.resolve(__dirname, "..", "..", "..", "..");

// -----------------------------
// Frontend source (for Vite dev server)
// -----------------------------
export const frontendSourcePath =
  process.env.FRONTEND_SOURCE_PATH || path.resolve(root, "frontend");

// -----------------------------
// Frontend build paths (for production)
// -----------------------------
export const frontendBuildPath =
  process.env.FRONTEND_BUILD_PATH ||
  path.resolve(root, "frontend/build/frontend");

export const indexPath = path.join(frontendBuildPath, "index.html");

// -----------------------------
// Storage path (for templates/manifests)
// -----------------------------
export const storageBasePath =
  process.env.STORAGE_PATH || path.resolve(root, "frontend/storage");

// -----------------------------
// Allowed template extensions
// -----------------------------
export const allowedExtensions = new Set([".docx", ".pdf"]);

// -----------------------------
// Azure Form Recognizer client
// -----------------------------
const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const key = process.env.AZURE_FORM_RECOGNIZER_KEY;

if (!endpoint || !key) {
  throw new Error(
    "Missing AZURE_FORM_RECOGNIZER_ENDPOINT or AZURE_FORM_RECOGNIZER_KEY in environment"
  );
}

export const formRecClient = new DocumentAnalysisClient(
  endpoint,
  new AzureKeyCredential(key)
);

// -----------------------------
// Helpers
// -----------------------------
export function getCustomerTemplatePath(customerId: string) {
  return path.join(storageBasePath, customerId, "templates");
}

export function getCustomerManifestPath(customerId: string) {
  return path.join(storageBasePath, customerId, "manifests");
}
