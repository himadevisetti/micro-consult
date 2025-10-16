import type { Candidate } from "../../types/Candidate.js";
import { ENUM_OPTIONS } from "../../constants/contractKeywords.js";

export function enrichMapping(c: Candidate) {
  if (!c.schemaField) {
    return {
      raw: c.rawValue,
      normalized: c.normalized,
      schemaField: "",
      placeholder: c.placeholder ?? "",
      label: "",
      inputType: "text" as const,
    };
  }

  const label = c.schemaField
    .replace(/([A-Z])/g, " $1")        // split camelCase
    .replace(/(\d+)$/, " #$1")         // turn trailing digits into #n
    .replace(/^./, (ch) => ch.toUpperCase())
    .trim();

  let inputType: "text" | "date" | "currency" | "textarea" | "select" = "text";
  let options: string[] | undefined;
  let fullValue: string | undefined;

  const raw = c.normalized ?? c.rawValue;

  if (isIsoDate(raw)) {
    inputType = "date";
  } else if (looksLikeCurrency(raw)) {
    inputType = "currency";
  }

  // schema-based override for amounts/fees
  if (c.schemaField.toLowerCase().includes("amount") || c.schemaField.toLowerCase().includes("fee")) {
    inputType = "currency";
  }

  // clause-type fields from extractor
  if (c.isExpandable && c.sourceText) {
    inputType = "textarea";
    fullValue = c.sourceText;
  }

  // enum lookup
  if (ENUM_OPTIONS[c.schemaField]) {
    inputType = "select";
    options = ENUM_OPTIONS[c.schemaField];
  }

  // optional heuristic fallback for unexpected long text
  if (inputType === "text" && raw && raw.length > 80) {
    inputType = "textarea";
  }

  return {
    raw: c.rawValue,
    normalized: c.normalized,
    schemaField: c.schemaField,
    placeholder: c.placeholder,
    label,
    inputType,
    ...(options ? { options } : {}),
    ...(fullValue ? { fullValue } : {}),
  };
}

function isIsoDate(val?: string) {
  return !!val && /^\d{4}-\d{2}-\d{2}$/.test(val);
}

function looksLikeCurrency(val?: string) {
  return !!val && /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(val);
}
