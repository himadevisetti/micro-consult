// src/server/utils/convertDocxToPdf.ts

import { acquireAccessToken } from "./acquireAccessToken.js";
import { logDebug, logError } from "../../utils/logger.js";

export async function convertDocxToPdf(mergedBuffer: Buffer): Promise<Buffer> {
  const token = await acquireAccessToken(); // personal account, delegation flow
  const uploadMeta = await uploadDocxToOneDrive(token, mergedBuffer);
  const pdfBuffer = await downloadPdfFromGraph(token, uploadMeta.id);

  try {
    await deleteFileFromOneDrive(token, uploadMeta.id);
    logDebug("[Graph Cleanup] DOCX deleted from OneDrive", { itemId: uploadMeta.id });
  } catch (err) {
    logError("[Graph Cleanup] Failed to delete DOCX", {
      itemId: uploadMeta.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return pdfBuffer;
}

async function uploadDocxToOneDrive(token: string, buffer: Buffer) {
  const filename = `GeneratedDocs/${Date.now()}.docx`;

  const resp = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/root:/${filename}:/content`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      body: new Uint8Array(buffer),
    }
  );

  if (!resp.ok) {
    throw new Error(`Upload failed: ${resp.status} ${resp.statusText}`);
  }

  const meta = await resp.json();

  logDebug("[Graph Upload] Item ID:", meta.id);
  logDebug("[Graph Upload] Web URL:", meta.webUrl);

  return meta;
}

async function downloadPdfFromGraph(token: string, itemId: string): Promise<Buffer> {
  const resp = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/content?format=pdf`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!resp.ok) {
    throw new Error(`Convert/download failed: ${resp.status} ${resp.statusText}`);
  }

  const arrayBuf = await resp.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function deleteFileFromOneDrive(token: string, itemId: string): Promise<void> {
  const resp = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!resp.ok) {
    throw new Error(`Delete failed: ${resp.status} ${resp.statusText}`);
  }
}
