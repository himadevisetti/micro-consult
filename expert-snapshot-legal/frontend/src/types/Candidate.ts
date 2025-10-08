export interface Candidate {
  rawValue: string;
  schemaField: string | null;
  candidates?: string[];
  normalized?: string;   // canonical normalized form (e.g. ISO date)
  displayValue?: string; // optional preformatted string for UI
  roleHint?: string;     // e.g. "Client" or "Provider"
  pageNumber: number;
  yPosition: number;
  placeholder?: string;
}

