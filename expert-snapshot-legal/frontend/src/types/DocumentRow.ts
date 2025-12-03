// src/types/DocumentRow.ts

export interface DocumentRow {
  id: number;
  customerId: string;
  flowName: string;
  documentType: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  storageType: string;
  storagePath: string;
  metadata?: string;       // only optional field
  createdAt: string;       // normalized to ISO string
  updatedAt: string;       // normalized to ISO string
}
