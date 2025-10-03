// src/types/confirmMapping.ts

/**
 * Normalized mapping payload sent to the confirm-mapping API.
 * This is the minimal DTO the backend expects.
 */
export interface NormalizedMapping {
  raw: string;              // raw text from the document
  normalized?: string;      // optional normalized form (e.g. ISO date, number)
  schemaField: string;      // required schema field name
}

