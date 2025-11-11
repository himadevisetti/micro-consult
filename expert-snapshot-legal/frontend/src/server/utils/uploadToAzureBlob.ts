// src/server/utils/uploadToAzureBlob.ts

import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";

const containerName = "documents";

export async function uploadToAzureBlob(
  buffer: Buffer,
  filename: string,
  customerId: string,
  contentType: string = "application/octet-stream" // ✅ fallback if not specified
): Promise<string> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `${customerId}/${uuidv4()}-${filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType }, // ✅ dynamic MIME type
  });

  return blockBlobClient.url;
}
