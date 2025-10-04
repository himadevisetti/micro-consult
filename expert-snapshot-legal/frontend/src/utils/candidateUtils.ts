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
 * Merge candidates, deduping by schemaField + normalized value.
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

export function isDateLike(field: string | null): boolean {
  return !!field && field.toLowerCase().includes("date");
}

export function parseIsoDate(raw: string): string | undefined {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

// Optional logical order (if you still want it for testing)
export const FIELD_ORDER = [
  "title",
  "effectiveDate",
  "executionDate",
  "expirationDate",
  "partyA",
  "partyB",
  "governingLaw",
  "feeAmount",
  "retainerAmount",
  "scopeOfRepresentation",
];

export function sortCandidatesLogical(cands: Candidate[]): Candidate[] {
  return [...cands].sort((a, b) => {
    const ai = FIELD_ORDER.indexOf(a.schemaField ?? "");
    const bi = FIELD_ORDER.indexOf(b.schemaField ?? "");
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

// Sort by document order using page + yPosition
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

// Debug helper: log all raw lines from prebuilt-read
export function logAllReadFields(readResult: any) {
  if (!readResult) {
    console.log("No read result");
    return;
  }

  // PDF / image path: pages[].lines populated
  if (readResult.pages?.some((p: any) => (p.lines ?? []).length > 0)) {
    readResult.pages.forEach((page: any, idx: number) => {
      console.log(`--- Page ${idx + 1} ---`);
      (page.lines ?? []).forEach((line: any) => {
        console.log(`Line: "${line.content}"`);
      });
    });
    return;
  }

  // DOCX path: fall back to paragraphs
  if (readResult.paragraphs?.length) {
    console.log("--- Paragraphs ---");
    readResult.paragraphs.forEach((p: any, idx: number) => {
      const page = p.boundingRegions?.[0]?.pageNumber ?? "?";
      console.log(`[p${idx}] (page ${page}) "${p.content}"`);
    });
    return;
  }

  // Fallback: just dump content
  if (readResult.content) {
    console.log("--- Content ---");
    console.log(readResult.content);
  } else {
    console.log("No lines, paragraphs, or content found");
  }
}

// --- Keyword sets for detectors ---
const FEE_STRUCTURE_KEYWORDS: Record<string, string[]> = {
  Flat: ["flat"],
  Hourly: ["hour", "per hour"],
  Monthly: ["monthly", "per month"],
  Contingency: ["contingency", "contingent"],
};

const FEE_CONTEXT_KEYWORDS = [
  "fee", "fees", "compensation", "payment", "remuneration",
  "charges", "billing", "consideration", "retainer", "deposit", "advance"
];

const GOVERNING_LAW_KEYWORDS = [
  "governing law", "jurisdiction", "laws of", "construed in accordance"
];

const SCOPE_KEYWORDS = [
  "represent", "representation", "engage", "engagement",
  "services", "scope", "responsibilities", "duties", "work to be performed"
];

/**
 * Derive structured candidates from prebuilt-read output.
 */
export function deriveCandidatesFromRead(readResult: any): Candidate[] {
  const candidates: Candidate[] = [];
  if (!readResult || !readResult.pages) return candidates;

  const fullText = String(readResult.content ?? "");

  // --- 1) Fee structure ---
  for (const page of readResult.pages) {
    for (const [lineIdx, line] of (page.lines ?? []).entries()) {
      if (Object.values(FEE_STRUCTURE_KEYWORDS).some(keys =>
        keys.some(k => line.content.toLowerCase().includes(k))
      )) {
        candidates.push({
          rawValue: "flat", // or normalized keyword
          schemaField: "feeStructure",
          candidates: ["feeStructure"],
          confidence: null,
          normalized: "flat",
          pageNumber: page.pageNumber,
          yPosition: line.boundingBox?.[1] ?? lineIdx,
        });
        break;
      }
    }
  }

  // --- 2) Amounts ---
  const amountRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const isFeeCue = (text: string) =>
    FEE_CONTEXT_KEYWORDS.some(k => text.includes(k));
  const isRetainerCue = (text: string) =>
    text.includes("retainer") || text.includes("deposit") || text.includes("advance");

  for (const page of readResult.pages) {
    const lines = page.lines ?? [];
    for (let i = 0; i < lines.length; i++) {
      const curr = lines[i].content ?? "";
      const prev = lines[i - 1]?.content ?? "";
      const next = lines[i + 1]?.content ?? "";

      const currLower = curr.toLowerCase();
      const prevLower = prev.toLowerCase();
      const nextLower = next.toLowerCase();

      const feeIdx = (() => {
        const keys = FEE_CONTEXT_KEYWORDS.filter(k => currLower.includes(k));
        if (!keys.length) return -1;
        return Math.max(...keys.map(k => currLower.lastIndexOf(k)));
      })();
      const retainerIdx = (() => {
        const keys = ["retainer", "deposit", "advance"].filter(k => currLower.includes(k));
        if (!keys.length) return -1;
        return Math.max(...keys.map(k => currLower.lastIndexOf(k)));
      })();

      let m: RegExpExecArray | null;
      while ((m = amountRegex.exec(curr)) !== null) {
        const raw = `$${m[1]}`;
        const amountPos = m.index;
        let schemaField: string | null = null;

        if (feeIdx >= 0 && retainerIdx >= 0) {
          const feeDist = Math.abs(amountPos - feeIdx);
          const retDist = Math.abs(amountPos - retainerIdx);
          schemaField = feeDist <= retDist ? "feeAmount" : "retainerAmount";
        } else if (feeIdx >= 0) {
          schemaField = "feeAmount";
        } else if (retainerIdx >= 0) {
          schemaField = "retainerAmount";
        } else if (isRetainerCue(prevLower) || isRetainerCue(nextLower)) {
          schemaField = "retainerAmount";
        } else if (isFeeCue(prevLower) || isFeeCue(nextLower)) {
          schemaField = "feeAmount";
        }

        candidates.push({
          rawValue: raw,
          schemaField,
          candidates: schemaField ? [schemaField] : ["feeAmount", "retainerAmount"],
          confidence: null,
          pageNumber: page.pageNumber,
          yPosition: lines[i].boundingBox?.[1] ?? i,
        });
      }
    }
  }

  // --- 3) Dates: Effective, Expiration (inline) + Execution (signature block only) ---
  const monthDateRegex =
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/gi;

  const emitDate = (
    rawDate: string,
    schemaField: "effectiveDate" | "expirationDate" | "executionDate",
    pageNumber: number,
    yPosition: number
  ) => {
    const iso = parseIsoDate(rawDate);
    candidates.push({
      rawValue: rawDate,
      schemaField,
      candidates: [schemaField],
      confidence: null,
      normalized: iso,
      displayValue: iso
        ? new Date(rawDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        : undefined,
      pageNumber,
      yPosition,
    });
  };

  // A) Inline Effective / Expiration only
  for (const page of readResult.pages) {
    for (const [lineIdx, line] of (page.lines ?? []).entries()) {
      const text = String(line.content ?? "");
      const lower = text.toLowerCase();
      let dm: RegExpExecArray | null;

      while ((dm = monthDateRegex.exec(text)) !== null) {
        const rawDate = dm[0];

        if (lower.includes("effective")) {
          emitDate(rawDate, "effectiveDate", page.pageNumber, line.boundingBox?.[1] ?? lineIdx);
        } else if (
          lower.includes("terminate") ||
          lower.includes("termination") ||
          lower.includes("expiration") ||
          lower.includes("expire")
        ) {
          emitDate(rawDate, "expirationDate", page.pageNumber, line.boundingBox?.[1] ?? lineIdx);
        }
      }
    }
  }

  // B) Execution date from signature block (prefer content after "Signatures")
  interface LineAnchor {
    text: string;
    page: number;
    y: number;
  }

  const lastPage = readResult.pages[readResult.pages.length - 1];
  const lastLines: LineAnchor[] = (lastPage?.lines ?? []).map((line: any, idx: number) => ({
    text: String(line.content ?? ""),
    page: lastPage.pageNumber,
    y: line.boundingBox?.[1] ?? idx,
  }));

  // Prefer lines after a "Signatures" heading; otherwise use the full last page
  const sigStartIdx = lastLines.findIndex(l => /signatures/i.test(l.text));
  const sigBlock = sigStartIdx >= 0 ? lastLines.slice(sigStartIdx) : lastLines;

  // Scan with a 2‑line window to catch split dates
  for (let i = 0; i < sigBlock.length; i++) {
    const curr = sigBlock[i];
    const next = sigBlock[i + 1];
    const windowText = `${curr.text} ${next ? next.text : ""}`;
    const windowLower = windowText.toLowerCase();

    const hasCue = /(executed on|signed on|signed this|dated|as of)/.test(windowLower);
    const dateMatch = windowText.match(monthDateRegex);

    if (hasCue && dateMatch && dateMatch.length) {
      emitDate(dateMatch[0], "executionDate", curr.page, curr.y);
      break; // stop after the first valid signature date
    }
  }

  // --- 4) Parties ---
  for (const page of readResult.pages) {
    for (const [lineIdx, line] of (page.lines ?? []).entries()) {
      const partyRegex = /between\s+(.+?)\s+and\s+(.+?)(?:\.|,|$)/i;
      const match = line.content.match(partyRegex);
      if (match) {
        candidates.push({
          rawValue: match[1].trim(),
          schemaField: "partyA",
          candidates: ["partyA"],
          confidence: null,
          roleHint: "Client",
          pageNumber: page.pageNumber,
          yPosition: line.boundingBox?.[1] ?? lineIdx,
        });
        candidates.push({
          rawValue: match[2].trim(),
          schemaField: "partyB",
          candidates: ["partyB"],
          confidence: null,
          roleHint: "Provider",
          pageNumber: page.pageNumber,
          yPosition: line.boundingBox?.[1] ?? lineIdx,
        });
      }
    }
  }

  // --- 5) Governing law ---
  for (const page of readResult.pages) {
    for (const [lineIdx, line] of (page.lines ?? []).entries()) {
      const lower = line.content.toLowerCase();
      if (GOVERNING_LAW_KEYWORDS.some(k => lower.includes(k))) {
        const match = line.content.match(/laws of\s+([A-Za-z\s]+)/i);
        if (match) {
          candidates.push({
            rawValue: match[1].trim(),
            schemaField: "governingLaw",
            candidates: ["governingLaw"],
            confidence: null,
            pageNumber: page.pageNumber,
            yPosition: line.boundingBox?.[1] ?? lineIdx,
          });
        }
      }
    }
  }

  // --- 6) Scope of Representation: single candidate, no redundant heading, UI preview ---
  const scopeHeadingRegex = /^\s*scope of representation\s*$/i;
  let scopeFragments: { text: string; page: number; y: number }[] = [];

  for (const page of readResult.pages) {
    for (const [lineIdx, line] of (page.lines ?? []).entries()) {
      const text = String(line.content ?? "").trim();
      const lower = text.toLowerCase();

      // Skip pure heading lines
      if (scopeHeadingRegex.test(lower)) continue;

      if (SCOPE_KEYWORDS.some(k => lower.includes(k))) {
        // Trim trailing punctuation like commas or stray dots
        const cleaned = text.replace(/[,\.]\s*$/, "");
        scopeFragments.push({
          text: cleaned,
          page: page.pageNumber,
          y: line.boundingBox?.[1] ?? lineIdx,
        });
      }
    }
  }

  if (scopeFragments.length > 0) {
    const fullScope = scopeFragments.map(f => f.text).join(" ").replace(/\s+/g, " ").trim();

    // First sentence or trimmed preview up to ~200 chars
    const firstSentence = fullScope.match(/[^.]{1,200}\./)?.[0]?.trim();
    const previewSource = firstSentence ?? fullScope;
    const preview =
      previewSource.length > 200
        ? `${previewSource.slice(0, 200)}…`
        : previewSource;

    candidates.push({
      rawValue: fullScope,        // full clause for detail view
      displayValue: preview,      // short preview for table cell
      schemaField: "scopeOfRepresentation",
      candidates: ["scopeOfRepresentation"],
      confidence: null,
      pageNumber: scopeFragments[0].page,
      yPosition: scopeFragments[0].y,
    });
  }

  return candidates;
}
