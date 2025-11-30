// src/utils/authToken.ts

import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/Auth";
import { logError, logWarn } from "@/utils/logger";

/**
 * Safely decode the JWT from sessionStorage.
 * Returns null if missing, invalid, or expired.
 */
export function getDecodedToken(): DecodedToken | null {
  const token = sessionStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (decoded.exp && decoded.exp * 1000 > Date.now()) {
      // ✅ Valid token
      return decoded;
    } else {
      // ⚠️ Expired or missing exp
      logWarn("AuthToken.tokenExpiredOrInvalid", { decoded });
      sessionStorage.removeItem("token");
      return null;
    }
  } catch (err) {
    logError("AuthToken.decodeError", { error: err });
    sessionStorage.removeItem("token");
    return null;
  }
}

/**
 * Convenience check for authentication status.
 */
export function isAuthenticated(): boolean {
  return getDecodedToken() !== null;
}
