// candidateUtils.ts

export interface Candidate {
  rawValue: string;
  schemaField: string | null;
  candidates?: string[];
  confidence: number | null;
  normalized?: string;   // canonical normalized form (e.g. ISO date)
  displayValue?: string; // optional preformatted string for UI
  roleHint?: string;     // e.g. "Client" or "Provider"
  // For document-order sorting
  pageNumber?: number;
  yPosition?: number;
}

/**
 * Normalize values for deduplication
 */
export function normalizeValue(raw: string, schemaField: string | null): string {
  let val = raw.trim();

  if (!isDateLike(schemaField)) {
    val = val.replace(/[,\.]\s*$/, "");
  }

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
 */
export function mergeCandidates(candidates: Candidate[]): Candidate[] {
  const seen = new Map<string, Candidate>();
  const passthrough: Candidate[] = [];

  for (const c of candidates) {
    if (c.schemaField == null) {
      passthrough.push({ ...c });
      continue;
    }

    const norm = normalizeValue(c.rawValue, c.schemaField);
    const key = `${c.schemaField}::${norm}`;

    if (!seen.has(key)) {
      const next: Candidate = { ...c };
      if (!next.normalized && c.schemaField?.toLowerCase().includes("date")) {
        const d = new Date(c.rawValue);
        if (!isNaN(d.getTime())) next.normalized = d.toISOString().slice(0, 10);
      }
      seen.set(key, next);
    } else {
      const existing = seen.get(key)!;
      const mergedCandidates = Array.from(
        new Set([...(existing.candidates ?? []), ...(c.candidates ?? [])])
      );
      if (mergedCandidates.length) existing.candidates = mergedCandidates;

      const existingConf = existing.confidence ?? 0;
      const newConf = c.confidence ?? 0;
      if (newConf > existingConf) existing.confidence = c.confidence;

      if (!existing.normalized && c.normalized) existing.normalized = c.normalized;
      if (!existing.displayValue && c.displayValue) existing.displayValue = c.displayValue;
      if (!existing.roleHint && c.roleHint) existing.roleHint = c.roleHint;
    }
  }

  return [...Array.from(seen.values()), ...passthrough];
}

export function canonicalField(fieldName: string): string {
  switch (fieldName) {
    case "Title":
      return "title";
    case "EffectiveDate":
      return "effectiveDate";
    case "StartDate":
      return "startDate";
    case "EndDate":
    case "TerminationDate":
    case "ExpirationDate":
      return "endDate";
    case "Parties":
      return "parties";
    case "Jurisdictions":
      return "jurisdictions";
    case "ContractValue":
    case "TotalAmount":
    case "Amount":
    case "Fee":
    case "FeeAmount":
      return "feeAmount";
    case "Retainer":
    case "RetainerAmount":
      return "retainerAmount";
    default:
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

// Existing logical order (optional)
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

export function sortCandidatesLogical(cands: Candidate[]): Candidate[] {
  return [...cands].sort((a, b) => {
    const ai = FIELD_ORDER.indexOf(a.schemaField ?? "");
    const bi = FIELD_ORDER.indexOf(b.schemaField ?? "");
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

// New: sort by document order
export function sortCandidatesByDocumentOrder(cands: Candidate[]): Candidate[] {
  return [...cands].sort((a, b) => {
    const pa = a.pageNumber ?? 9999;
    const pb = b.pageNumber ?? 9999;
    if (pa !== pb) return pa - pb;
    const ya = a.yPosition ?? 999999;
    const yb = b.yPosition ?? 999999;
    return ya - yb;
  });
}

// Debug helper: log all raw fields from prebuilt_contract
// Top-level fields from the official prebuilt-contract schema (2024-11-30 GA).
// You can expand this list further if you want to cover every documented field.
const CONTRACT_SCHEMA_FIELDS = [
  "Title",
  "ContractId",
  "Parties",
  "ExecutionDate",
  "EffectiveDate",
  "ExpirationDate",
  "ContractDuration",
  "RenewalDate",
  "Jurisdictions"
];

// Recursively print all fields, including nested properties and arrays
export function logAllContractFields(fr: any) {
  if (!fr.documents) {
    console.log("No documents returned by Form Recognizer");
    return;
  }

  for (const doc of fr.documents) {
    console.log(`\n=== Document type: ${doc.docType} ===`);
    printFields(doc.fields, 0);
  }
}

function printFields(fields: Record<string, any>, indent: number) {
  const pad = "  ".repeat(indent);

  for (const [fieldName, fieldVal] of Object.entries(fields)) {
    if (!fieldVal) continue;

    // Arrays (e.g. Parties, Jurisdictions)
    if (Array.isArray(fieldVal.values)) {
      console.log(`${pad}${fieldName}:`);
      fieldVal.values.forEach((v: any, idx: number) => {
        if (v?.properties) {
          console.log(`${pad}  [${idx}]`);
          printFields(v.properties, indent + 2);
        } else {
          const val = v.content ?? v.value;
          if (val) {
            console.log(
              `${pad}  [${idx}] ${val} (confidence: ${v.confidence ?? "n/a"})`
            );
          }
        }
      });
    }
    // Objects with nested properties
    else if (fieldVal.properties) {
      console.log(`${pad}${fieldName}:`);
      printFields(fieldVal.properties, indent + 1);
    }
    // Scalars
    else {
      const val = fieldVal.content ?? fieldVal.value;
      if (val) {
        const conf = fieldVal.confidence ?? "n/a";
        const page = fieldVal.boundingRegions?.[0]?.pageNumber ?? "?";
        console.log(
          `${pad}${fieldName} => ${val} (confidence: ${conf}) page: ${page}`
        );
      }
    }
  }
}

// Compare actual fields against schema and log missing ones
export function logMissingContractFields(fr: any) {
  if (!fr.documents) return;

  for (const doc of fr.documents) {
    const present = Object.keys(doc.fields ?? {});
    const missing = CONTRACT_SCHEMA_FIELDS.filter(
      f => !present.includes(f)
    );

    console.log("\n=== Missing fields compared to schema ===");
    console.log(missing.length > 0 ? missing.join(", ") : "None — all present");
  }
}

// Regex-based amount detection from full text
export function logRegexAmounts(fr: any) {
  const fullText = fr.content ?? "";
  const moneyRegex = /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
  const matches = fullText.match(moneyRegex) || [];

  if (matches.length > 0) {
    console.log("\n=== Regex-detected amounts ===");
    matches.forEach((m: string, idx: number) => {
      console.log(`  [${idx}] ${m}`);
    });
  } else {
    console.log("\n=== Regex-detected amounts ===");
    console.log("  None found");
  }
}