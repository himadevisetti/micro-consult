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

  // NEW FIELDS
  matchValues?: string[];        // one or more exact anchor strings for placeholderization
  primaryMatch?: string;         // convenience: the anchor we actually replace
  isExpandable?: boolean;        // only true for clause‑type fields
}
