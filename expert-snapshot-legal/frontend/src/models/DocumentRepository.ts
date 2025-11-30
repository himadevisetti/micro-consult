// src/models/DocumentRepository.ts

import { poolPromise } from "../db/connection.js";
import sql from "mssql";

/**
 * Insert a new document record.
 * Used by uploadToAzureBlob.ts, uploadTemplate.ts, confirmMapping.ts.
 */
export async function createDocument(
  customerId: string,
  flowName: string,
  documentType: string,
  filePath: string,
  fileName: string,
  fileSize?: number,
  storageType?: string,
  storagePath?: string,
  metadata?: string
) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("customerId", sql.NVarChar(50), customerId)
    .input("flowName", sql.NVarChar(100), flowName)
    .input("documentType", sql.NVarChar(100), documentType)
    .input("filePath", sql.NVarChar(500), filePath)
    .input("fileName", sql.NVarChar(255), fileName)
    .input("fileSize", sql.BigInt, fileSize ?? null)
    .input("storageType", sql.NVarChar(50), storageType ?? null)
    .input("storagePath", sql.NVarChar(500), storagePath ?? null)
    .input("metadata", sql.NVarChar(sql.MAX), metadata ?? null)
    .query(`
      INSERT INTO Documents (
        customerId, flowName, documentType,
        filePath, fileName, fileSize,
        storageType, storagePath, metadata, createdAt
      )
      OUTPUT INSERTED.id, INSERTED.customerId, INSERTED.flowName,
             INSERTED.documentType, INSERTED.filePath, INSERTED.fileName,
             INSERTED.storageType, INSERTED.storagePath, INSERTED.createdAt
      VALUES (
        @customerId, @flowName, @documentType,
        @filePath, @fileName, @fileSize,
        @storageType, @storagePath, @metadata, GETDATE()
      )
    `);

  return result.recordset[0];
}

/**
 * Find a document by its ID.
 */
export async function findDocumentById(documentId: number) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("documentId", sql.Int, documentId)
    .query(`SELECT * FROM Documents WHERE id = @documentId`);
  return result.recordset[0];
}

/**
 * Find all documents for a given customer.
 */
export async function findDocumentsByCustomer(customerId: string) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("customerId", sql.NVarChar(50), customerId)
    .query(`
      SELECT id, customerId, flowName, documentType,
             filePath, fileName, fileSize,
             storageType, storagePath, metadata,
             createdAt, updatedAt
      FROM Documents
      WHERE customerId = @customerId
      ORDER BY createdAt DESC
    `);
  return result.recordset;
}

/**
 * Update document fields (filePath, fileName, fileSize, storageType, storagePath, metadata).
 */
export async function updateDocument(
  documentId: number,
  filePath?: string,
  fileName?: string,
  fileSize?: number,
  storageType?: string,
  storagePath?: string,
  metadata?: string
) {
  const pool = await poolPromise;
  const request = pool.request().input("documentId", sql.Int, documentId);

  if (filePath) request.input("filePath", sql.NVarChar(500), filePath);
  if (fileName) request.input("fileName", sql.NVarChar(255), fileName);
  if (fileSize !== undefined) request.input("fileSize", sql.BigInt, fileSize);
  if (storageType) request.input("storageType", sql.NVarChar(50), storageType);
  if (storagePath) request.input("storagePath", sql.NVarChar(500), storagePath);
  if (metadata) request.input("metadata", sql.NVarChar(sql.MAX), metadata);

  const setClauses: string[] = [];
  if (filePath) setClauses.push("filePath = @filePath");
  if (fileName) setClauses.push("fileName = @fileName");
  if (fileSize !== undefined) setClauses.push("fileSize = @fileSize");
  if (storageType) setClauses.push("storageType = @storageType");
  if (storagePath) setClauses.push("storagePath = @storagePath");
  if (metadata) setClauses.push("metadata = @metadata");

  if (setClauses.length === 0) {
    throw new Error("No fields provided to update");
  }

  const result = await request.query(`
    UPDATE Documents
    SET ${setClauses.join(", ")}, updatedAt = GETDATE()
    OUTPUT INSERTED.id, INSERTED.filePath, INSERTED.fileName,
           INSERTED.fileSize, INSERTED.storageType, INSERTED.storagePath,
           INSERTED.metadata, INSERTED.updatedAt
    WHERE id = @documentId
  `);

  return result.recordset[0];
}
