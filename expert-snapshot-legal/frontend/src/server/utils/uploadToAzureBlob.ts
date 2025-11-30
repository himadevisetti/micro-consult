// src/server/utils/uploadToAzureBlob.ts
// --------------------------------------
// Upload a file buffer to Azure Blob Storage using Azure AD RBAC,
// then persist metadata into the Documents table.

import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { v4 as uuidv4 } from "uuid";
import { createDocument } from "../../models/DocumentRepository.js";
import { logDebug, logError } from "../../utils/logger.js";

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "documents";

export async function uploadToAzureBlob(
  buffer: Buffer,
  filename: string,
  customerId: string,
  documentType: string,
  contentType: string = "application/octet-stream"
): Promise<string> {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME is not set");
  }

  // Use the same credential chain validated at startup
  const credential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `${customerId}/${uuidv4()}-${filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    logDebug("uploadToAzureBlob.success", { blobName, contentType });
  } catch (err) {
    logError("uploadToAzureBlob.uploadError", {
      blobName,
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  const filePath = blockBlobClient.url;       // full URL
  const fileSize = buffer.length;
  const storageType = "AzureBlob";
  const storagePath = `${containerName}/${blobName}`; // 🔹 logical path inside container

  // Persist metadata into Documents table
  await createDocument(
    customerId,
    "uploadToAzureBlob", // flowName for traceability
    documentType,
    filePath,
    filename,
    fileSize,
    storageType,
    storagePath
  );

  return filePath;
}
