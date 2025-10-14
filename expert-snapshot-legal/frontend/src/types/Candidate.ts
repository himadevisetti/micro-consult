// src/types/Candidate.ts

export interface Candidate {
  rawValue: string;              // legacy: often the anchor text, but ambiguous
  schemaField: string | null;
  candidates?: string[];
  normalized?: string;           // canonical normalized form (e.g. ISO date)
  displayValue?: string;         // short preview for UI
  roleHint?: string;             // e.g. "Client" or "Provider"
  pageNumber?: number;
  yPosition?: number;
  placeholder?: string;
  sourceText?: string;           // full block for UI expand/collapse
  isExpandable?: boolean;        // only true for clause‑type fields
}
