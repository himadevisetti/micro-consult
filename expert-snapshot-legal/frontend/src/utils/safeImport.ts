// src/utils/safeImport.ts

import { logError } from "./logger.js";

/**
 * Dynamically imports a module using absolute path resolution in browser,
 * and absolute file URL in Node (passed from caller).
 */
export async function safeImport<T = any>(specifier: string): Promise<T | null> {
  try {
    let resolved: string;

    if (typeof window !== "undefined") {
      resolved = new URL(specifier, window.location.origin).href;
    } else {
      resolved = specifier; // already absolute file:// URL from caller
    }

    const dynamicImport = new Function("specifier", "return import(specifier);");
    return await dynamicImport(resolved);
  } catch (err) {
    logError("safeImport.failed", {
      specifier,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
