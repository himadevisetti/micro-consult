// src/server/utils/acquireAccessToken.ts
import { logDebug, logError } from "../../utils/logger.js";

export async function acquireAccessToken(): Promise<string> {
  const clientId = process.env.GRAPH_CLIENT_ID!;
  const refreshToken = process.env.GRAPH_REFRESH_TOKEN!;
  const tenant = process.env.GRAPH_TENANT || "consumers";

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "Files.ReadWrite.All offline_access",
  });

  logDebug("acquireAccessToken.request", {
    tenant,
    clientId: clientId.slice(0, 6) + "...", // mask sensitive values
    hasRefreshToken: !!refreshToken,
    scope: params.get("scope"),
    grant_type: params.get("grant_type"),
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  const text = await response.text();
  if (!response.ok) {
    logError("acquireAccessToken.error", {
      status: response.status,
      statusText: response.statusText,
      body: text,
    });
    throw new Error(
      `Failed to acquire access token: ${response.status} ${response.statusText}`
    );
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch (err) {
    logError("acquireAccessToken.parseError", { text });
    throw err;
  }

  return json.access_token as string;
}
