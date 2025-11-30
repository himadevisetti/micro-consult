/**
 * Utility to assert that Azure AD RBAC is correctly configured
 * and that the target container exists.
 *
 * - Acquires a token for Azure Storage using DefaultAzureCredential.
 * - Fails fast if token acquisition fails.
 * - Verifies that the configured container exists.
 */

import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { logDebug, logError } from "../../utils/logger.js";

export async function assertAzureCredential(): Promise<void> {
  const credential = new DefaultAzureCredential();

  // 🔹 Step 1: Token acquisition check
  try {
    const token = await credential.getToken("https://storage.azure.com/.default");
    logDebug("azureCredential.tokenAcquired", {
      audience: "https://storage.azure.com/.default",
      expiresOn: token?.expiresOnTimestamp,
      hasToken: !!token,
    });
  } catch (err) {
    logError("azureCredential.tokenError", {
      message: err instanceof Error ? err.message : String(err),
    });
    logError("azureCredential.startupFailed", {
      reason: "Unable to acquire Azure Storage token via DefaultAzureCredential",
    });
    process.exit(1);
  }

  // 🔹 Step 2: Container existence check
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "documents";

  if (!accountName) {
    logError("azureCredential.startupFailed", {
      reason: "AZURE_STORAGE_ACCOUNT_NAME is not set",
    });
    process.exit(1);
  }

  try {
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const exists = await containerClient.exists();
    if (!exists) {
      logError("azureCredential.startupFailed", {
        reason: `Container '${containerName}' does not exist in account '${accountName}'`,
      });
      process.exit(1);
    }

    logDebug("azureCredential.containerExists", { accountName, containerName });
  } catch (err) {
    logError("azureCredential.containerError", {
      message: err instanceof Error ? err.message : String(err),
    });
    logError("azureCredential.startupFailed", {
      reason: "Unable to verify container existence",
    });
    process.exit(1);
  }
}
