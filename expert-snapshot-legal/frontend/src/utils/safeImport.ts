// src/utils/safeImport.ts

/**
 * Dynamically imports a module using absolute path resolution in browser,
 * and absolute file URL in Node (passed from caller).
 */
export async function safeImport<T = any>(specifier: string): Promise<T | null> {
  try {
    const isBrowser = typeof window !== "undefined";

    const resolved = isBrowser
      ? new URL(specifier, window.location.origin).href
      : specifier;

    const dynamicImport = new Function("specifier", "return import(specifier);");
    return await dynamicImport(resolved);
  } catch (err) {
    console.error("safeImport failed", { specifier, err });
    return null;
  }
}
