// src/utils/downloadWithAuth.ts
// ------------------------------------
// Utility to securely download files with JWT auth.
// - For backend URLs: attaches Authorization header, handles 401/403 by redirecting to login.
// - For blob URLs: triggers a direct download.
// ------------------------------------

import { logError } from "@/utils/logger";
import { NavigateFunction } from "react-router-dom";

/**
 * Download a file either from a backend endpoint (with JWT auth) or from a blob URL.
 *
 * @param url       Backend API endpoint OR blob URL
 * @param fileName  Suggested filename for download
 * @param navigate  React Router navigate function for redirects
 */
export async function downloadWithAuth(
  url: string,
  fileName: string,
  navigate: NavigateFunction
) {
  // Handle blob URLs directly (already generated in browser)
  if (url.startsWith("blob:")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Handle backend URLs requiring JWT auth
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }
      throw new Error(`Download failed: ${res.statusText}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    logError("downloadWithAuth.error", { error: err });
    alert("Failed to download document");
  }
}
