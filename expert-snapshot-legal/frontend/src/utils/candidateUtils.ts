// candidateUtils.ts

export interface Candidate {
  rawValue: string;
  schemaField: string | null;
  candidates?: string[];
  confidence: number | null;
  normalized?: string;   // canonical normalized form (e.g. ISO date)
  displayValue?: string; // optional preformatted string for UI
  roleHint?: string;     // e.g. "Client" or "Provider"
}

/**
 * Normalize values for deduplication
 */
export function normalizeValue(raw: string, schemaField: string | null): string {
  let val = raw.trim();

  // Strip trailing commas/periods for all non-date fields
  if (!isDateLike(schemaField)) {
    val = val.replace(/[,\.]\s*$/, "");
  }

  // Normalize dates to ISO for stable dedupe
  if (schemaField?.toLowerCase().includes("date")) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }

  return val;
}

/**
 * Merge Azure candidates, deduping by schemaField + normalized value.
 * IMPORTANT:
 * - Do NOT merge rows where schemaField is null (defensive passthrough).
 * - Preserve normalized/displayValue/roleHint; union candidate lists; prefer higher confidence.
 * - Different roles with the same normalized value (e.g., effectiveDate == startDate) remain as distinct rows.
 */
export function mergeCandidates(candidates: Candidate[]): Candidate[] {
  const seen = new Map<string, Candidate>();
  const passthrough: Candidate[] = []; // keep schemaField === null rows distinct

  for (const c of candidates) {
    if (c.schemaField == null) {
      passthrough.push({ ...c });
      continue;
    }

    const norm = normalizeValue(c.rawValue, c.schemaField);
    const key = `${c.schemaField}::${norm}`;

    if (!seen.has(key)) {
      const next: Candidate = { ...c };
      // If date and normalized is missing, compute it; keep rawValue as-is for UI
      if (!next.normalized && c.schemaField?.toLowerCase().includes("date")) {
        const d = new Date(c.rawValue);
        if (!isNaN(d.getTime())) next.normalized = d.toISOString().slice(0, 10);
      }
      seen.set(key, next);
    } else {
      const existing = seen.get(key)!;

      // union candidate lists
      const mergedCandidates = Array.from(
        new Set([...(existing.candidates ?? []), ...(c.candidates ?? [])])
      );
      if (mergedCandidates.length) existing.candidates = mergedCandidates;

      // prefer higher confidence
      const existingConf = existing.confidence ?? 0;
      const newConf = c.confidence ?? 0;
      if (newConf > existingConf) existing.confidence = c.confidence;

      // preserve normalized/displayValue/roleHint if missing
      if (!existing.normalized && c.normalized) existing.normalized = c.normalized;
      if (!existing.displayValue && c.displayValue) existing.displayValue = c.displayValue;
      if (!existing.roleHint && c.roleHint) existing.roleHint = c.roleHint;
    }
  }

  return [...Array.from(seen.values()), ...passthrough];
}

export function canonicalField(fieldName: string): string {
  switch (fieldName) {
    // Primary text fields
    case "Title":
      return "title";

    // Dates (map Azure variants to our schema)
    case "EffectiveDate":
      return "effectiveDate";
    case "StartDate":
      return "startDate";
    case "EndDate":
      return "endDate";
    case "TerminationDate":
      return "endDate";
    case "ExpirationDate":
      return "endDate";

    // Parties / jurisdictions
    case "Parties":
      return "parties"; // array; we remap items to partyA/partyB
    case "Jurisdictions":
      return "jurisdictions"; // array; we remap items to governingLaw

    // Amounts (map common Azure money fields)
    case "ContractValue":
      return "feeAmount";
    case "TotalAmount":
      return "feeAmount";
    case "Amount":
      return "feeAmount";
    case "Fee":
      return "feeAmount";
    case "FeeAmount":
      return "feeAmount";
    case "Retainer":
      return "retainerAmount";
    case "RetainerAmount":
      return "retainerAmount";

    default:
      // Generic PascalCase → camelCase
      return fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
  }
}

export function isDateLike(field: string | null): boolean {
  return !!field && field.toLowerCase().includes("date");
}

export function parseIsoDate(raw: string): string | undefined {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

export const FIELD_ORDER = [
  "title",
  "startDate",
  "effectiveDate",
  "endDate",
  "partyA",
  "partyB",
  "governingLaw",
  "feeAmount",
  "retainerAmount",
];

export function sortCandidates(cands: Candidate[]): Candidate[] {
  return [...cands].sort((a, b) => {
    const ai = FIELD_ORDER.indexOf(a.schemaField ?? "");
    const bi = FIELD_ORDER.indexOf(b.schemaField ?? "");
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}
