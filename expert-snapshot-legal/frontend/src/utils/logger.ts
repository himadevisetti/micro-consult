// src/utils/logger.ts

const isBrowser = typeof window !== "undefined";

function isDebug(): boolean {
  if (isBrowser) {
    if (process.env.NEXT_PUBLIC_DEBUG_LOGS) {
      return process.env.NEXT_PUBLIC_DEBUG_LOGS === "true";
    }
    if (process.env.REACT_APP_DEBUG) {
      return process.env.REACT_APP_DEBUG === "true";
    }
    if ((import.meta as any)?.env?.VITE_DEBUG) {
      return (import.meta as any).env.VITE_DEBUG === "true";
    }
    return true; // default to true in browser if nothing set
  } else {
    return (
      process.env.NEXT_PUBLIC_DEBUG_LOGS === "true" ||
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    );
  }
}

export function logDebug(...args: any[]) {
  if (isDebug()) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export function logWarn(...args: any[]) {
  if (isDebug()) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}

export function logError(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);
}
