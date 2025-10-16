// src/types/manifest.ts

export interface ManifestVariable {
  raw: string;              // raw text from the document
  normalized?: string;      // normalized form (ISO date, number, enum)
  schemaField: string;      // canonical schema field name
  placeholder: string;      // {{Placeholder}} in the template

  // --- UI enrichment ---
  label: string;            // human-friendly label (e.g. "Effective Date")
  inputType: "text" | "date" | "currency" | "textarea" | "select";
  options?: string[];       // for enums (feeStructure, licenseScope, etc.)
  fullValue?: string;   // for clause-type fields like scope
}

