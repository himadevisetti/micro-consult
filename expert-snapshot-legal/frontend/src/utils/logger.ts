// src/utils/logger.ts

const isBrowser = typeof window !== "undefined";

function isDebug(): boolean {
  if (isBrowser) {
    // Vite convention: use VITE_* vars
    if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_DEBUG_LOGS) {
      return (import.meta as any).env.VITE_DEBUG_LOGS === "true";
    }
    // CRA convention (if ever bundled that way)
    if (typeof process !== "undefined" && process.env?.REACT_APP_DEBUG) {
      return process.env.REACT_APP_DEBUG === "true";
    }
    // Next.js convention (if ever bundled that way)
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEBUG_LOGS) {
      return process.env.NEXT_PUBLIC_DEBUG_LOGS === "true";
    }
    // Default: enable debug in browser if nothing set
    return true;
  } else {
    // Server-side: safe to use process.env
    return (
      process.env.NEXT_PUBLIC_DEBUG_LOGS === "true" ||
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    );
  }
}

export function logDebug(...args: any[]) {
  if (isDebug()) {
    console.log(...args);
  }
}

export function logWarn(...args: any[]) {
  if (isDebug()) {
    console.warn(...args);
  }
}

export function logError(...args: any[]) {
  console.error(...args);
}
