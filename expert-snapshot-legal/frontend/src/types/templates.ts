// src/types/templates.ts

export type TemplateVariable = {
  rawValue: string;              // detected value or placeholder (from Azure or regex)
  normalized?: string;           // optional normalized form (e.g. ISO date)
  displayValue?: string;         // optional preformatted string for UI (e.g. "Oct 1, 2025")
  schemaField: string | null;    // canonical variable name (user‑mapped or backend guess)
  roleHint?: string;             // optional role context (e.g. "Client", "Provider")
  candidates?: string[];         // optional list of suggested schema fields
  confidence?: number;           // optional confidence score (0–1) from backend
  placeholder?: string;          // placeholder mapping (e.g. {{partyA}})

  // NEW optional fields for richer UI/placeholderization
  sourceText?: string;           // full block for expand/collapse in UI
  primaryMatch?: string;         // anchor actually used for placeholderization
  isExpandable?: boolean;        // only true for clause‑type fields
};
