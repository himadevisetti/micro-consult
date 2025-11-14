// src/utils/safeImport.ts

/**
 * Dynamically imports a module without triggering Vite's static analysis.
 * Safe for backend-only imports like devServer.mts.
 */
export async function safeImport<T = any>(specifier: string): Promise<T | null> {
  try {
    const dynamicImport = new Function(
      'specifier',
      'return import(specifier);'
    );
    return await dynamicImport(specifier);
  } catch {
    return null;
  }
}

