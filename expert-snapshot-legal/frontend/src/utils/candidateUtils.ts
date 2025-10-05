// candidateUtils.ts

import { CONTRACT_KEYWORDS } from "../constants/contractKeywords.js";

export interface Candidate {
  rawValue: string;
  schemaField: string | null;
  candidates?: string[];
  normalized?: string;   // canonical normalized form (e.g. ISO date)
  displayValue?: string; // optional preformatted string for UI
  roleHint?: string;     // e.g. "Client" or "Provider"
  pageNumber: number;
  yPosition: number;
}

const DEBUG = process.env.NODE_ENV === "development";

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

function normalizeHeading(h?: string): string {
  return (h ?? "").trim().toLowerCase();
}

function isPreferredHeadingForGoverningLaw(roleHint?: string): boolean {
  const h = normalizeHeading(roleHint);
  return h === "governing law" || h === "jurisdiction";
}

/**
 * Merge candidates, deduping by schemaField + normalized value.
 */
export function mergeCandidates(candidates: Candidate[]): Candidate[] {
  // INPUT LOG
  if (DEBUG) {
    console.log(">>> mergeCandidates INPUT:");
    candidates.forEach((c, i) => {
      const schema = c.schemaField ?? "null";
      const normKey = c.schemaField
        ? `${c.schemaField}::${normalizeValue(c.rawValue, c.schemaField)}`
        : "(passthrough)";
      console.log(
        `[${i}] field=${schema} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" normalized="${c.normalized ?? ""}" raw="${c.rawValue}" key=${normKey}`
      );
    });
  }

  const indexByKey = new Map<string, number>();
  const out: Candidate[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];

    if (c.schemaField == null) {
      out.push({ ...c });
      continue;
    }

    const norm = normalizeValue(c.rawValue, c.schemaField);
    const key = `${c.schemaField}::${norm}`;
    const existingIdx = indexByKey.get(key);

    if (existingIdx == null) {
      const next: Candidate = { ...c };
      if (!next.normalized && c.schemaField?.toLowerCase().includes("date")) {
        const d = new Date(c.rawValue);
        if (!isNaN(d.getTime())) next.normalized = d.toISOString().slice(0, 10);
      }
      indexByKey.set(key, out.length);
      out.push(next);
      if (DEBUG) {
        console.log(
          `ADD key=${key} @outIdx=${out.length - 1} field=${c.schemaField} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" raw="${c.rawValue}"`
        );
      }
      continue;
    }

    const existing = out[existingIdx];

    // Preferred-heading logic for governingLaw with fallback
    let shouldReplace = false;
    if (c.schemaField === "governingLaw") {
      const existingPreferred = isPreferredHeadingForGoverningLaw(existing.roleHint);
      const incomingPreferred = isPreferredHeadingForGoverningLaw(c.roleHint);

      if (DEBUG) {
        console.log(
          `DUP key=${key} existingIdx=${existingIdx} ` +
          `existing(roleHint="${existing.roleHint ?? ""}", preferred=${existingPreferred}, page=${existing.pageNumber}, y=${existing.yPosition}) ` +
          `incoming(roleHint="${c.roleHint ?? ""}", preferred=${incomingPreferred}, page=${c.pageNumber}, y=${c.yPosition})`
        );
      }

      if (!existingPreferred && incomingPreferred) {
        shouldReplace = true;
        if (DEBUG) {
          console.log(
            `REPLACE_DECISION: governingLaw incoming is preferred-heading, existing is not. key=${key}`
          );
        }
      } else {
        if (DEBUG) {
          console.log(
            `KEEP_DECISION: governingLaw prefers first occurrence or both preferred; merging metadata only. key=${key}`
          );
        }
      }
    } else {
      if (DEBUG) {
        console.log(
          `DUP key=${key} field=${c.schemaField} -> KEEP first occurrence; merging metadata only. ` +
          `existing(roleHint="${existing.roleHint ?? ""}") incoming(roleHint="${c.roleHint ?? ""}")`
        );
      }
    }

    if (shouldReplace) {
      out[existingIdx] = { ...existing, ...c };
      if (DEBUG) {
        console.log(
          `REPLACED key=${key} @outIdx=${existingIdx} with incoming (page=${c.pageNumber}, y=${c.yPosition}, roleHint="${c.roleHint ?? ""}")`
        );
      }
    } else {
      const mergedLabels = Array.from(
        new Set([...(existing.candidates ?? []), ...(c.candidates ?? [])])
      );
      if (mergedLabels.length) existing.candidates = mergedLabels;
      if (!existing.normalized && c.normalized) existing.normalized = c.normalized;
      if (!existing.displayValue && c.displayValue) existing.displayValue = c.displayValue;
      if (!existing.roleHint && c.roleHint) existing.roleHint = c.roleHint;

      if (DEBUG) {
        console.log(
          `MERGED_METADATA key=${key} @outIdx=${existingIdx} ` +
          `normalized="${existing.normalized ?? ""}" displayValue="${existing.displayValue ?? ""}" roleHint="${existing.roleHint ?? ""}"`
        );
      }
    }
  }

  // OUTPUT LOG
  if (DEBUG) {
    console.log(">>> mergeCandidates OUTPUT:");
    out.forEach((c, i) => {
      const schema = c.schemaField ?? "null";
      const normKey = c.schemaField
        ? `${c.schemaField}::${normalizeValue(c.rawValue, c.schemaField)}`
        : "(passthrough)";
      console.log(
        `[${i}] field=${schema} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" normalized="${c.normalized ?? ""}" raw="${c.rawValue}" key=${normKey}`
      );
    });
  }

  return out;
}

export function isDateLike(field: string | null): boolean {
  return !!field && field.toLowerCase().includes("date");
}

export function parseIsoDate(raw: string): string | undefined {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

// Sort by document order using page + yPosition (or docIndex if present)
export function sortCandidatesByDocumentOrder(cands: Candidate[]): Candidate[] {
  return [...cands].sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber;
    }
    if ((a as any).docIndex != null && (b as any).docIndex != null) {
      return (a as any).docIndex - (b as any).docIndex;
    }
    return a.yPosition - b.yPosition;
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

/**
 * Derive structured candidates from prebuilt-read output.
 */
export function deriveCandidatesFromRead(readResult: any): Candidate[] {
  const candidates: Candidate[] = [];
  if (!readResult) return candidates;

  const anchors: TextAnchor[] = getTextAnchors(readResult);

  // --- Parties ---
  for (const anchor of anchors) {
    const partyRegex = /between\s+(.+?)\s+and\s+([^.,]+)(?:[.,]|$)/i;
    const match = anchor.text.match(partyRegex);
    if (match) {
      const clean = (s: string) =>
        s
          .replace(/\s*,?\s*effective as of.*$/i, "")
          .replace(/\s*,?\s*dated.*$/i, "")
          .trim();

      let partyA = clean(match[1]);
      let partyB = clean(match[2]);

      const labelRegex = /\(the\s+["“]?([A-Za-z]+)["”]?\)/i;
      const labelA = partyA.match(labelRegex)?.[1];
      const labelB = partyB.match(labelRegex)?.[1];

      partyA = partyA.replace(labelRegex, "").trim();
      partyB = partyB.replace(labelRegex, "").trim();

      if (partyA && partyB) {
        if (labelA || labelB) {
          candidates.push({
            rawValue: partyA,
            schemaField: "partyA",
            candidates: ["partyA"],
            roleHint: labelA ?? anchor.roleHint ?? "PartyA",
            pageNumber: anchor.page,
            yPosition: anchor.y,
          });
          candidates.push({
            rawValue: partyB,
            schemaField: "partyB",
            candidates: ["partyB"],
            roleHint: labelB ?? anchor.roleHint ?? "PartyB",
            pageNumber: anchor.page,
            yPosition: anchor.y,
          });
        } else {
          candidates.push({
            rawValue: partyA,
            schemaField: null,
            candidates: ["partyA", "partyB"],
            roleHint: anchor.roleHint ?? "Parties",
            pageNumber: anchor.page,
            yPosition: anchor.y,
          });
          candidates.push({
            rawValue: partyB,
            schemaField: null,
            candidates: ["partyA", "partyB"],
            roleHint: anchor.roleHint ?? "Parties",
            pageNumber: anchor.page,
            yPosition: anchor.y,
          });
        }
        if (DEBUG) console.log(">>> Parties detected:", { partyA, partyB, labelA, labelB });
        break;
      }
    }
  }

  // --- Fee Structure ---
  for (const anchor of anchors) {
    const lower = anchor.text.toLowerCase();
    for (const [norm, keywords] of Object.entries(CONTRACT_KEYWORDS.amounts.feeStructure)) {
      const match = keywords.find(k => lower.includes(k));
      if (match) {
        const regex = new RegExp(`\\b${match}\\b`, "i");
        const rawMatch = anchor.text.match(regex)?.[0] ?? match;

        candidates.push({
          rawValue: rawMatch,
          schemaField: "feeStructure",
          candidates: ["feeStructure"],
          normalized: normalizeValue(rawMatch, "feeStructure"),
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
        });

        if (DEBUG) console.log(">>> Fee structure detected:", { norm, rawMatch });
        break;
      }
    }
  }

  // --- Amounts ---
  const amountRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const isFeeCue = (t: string) =>
    CONTRACT_KEYWORDS.amounts.feeContext.some(k => t.includes(k));
  const isRetainerCue = (t: string) =>
    CONTRACT_KEYWORDS.amounts.retainerCues.some(k => t.includes(k));

  let seenFee = false;
  let seenRetainer = false;

  for (let i = 0; i < anchors.length; i++) {
    const curr = anchors[i].text;
    const prev = anchors[i - 1]?.text ?? "";
    const next = anchors[i + 1]?.text ?? "";

    const currLower = curr.toLowerCase();
    const prevLower = prev.toLowerCase();
    const nextLower = next.toLowerCase();

    let m: RegExpExecArray | null;
    while ((m = amountRegex.exec(curr)) !== null) {
      const raw = `$${m[1]}`;

      const hasFeeCue =
        isFeeCue(currLower) || isFeeCue(prevLower) || isFeeCue(nextLower);
      const hasRetainerCue =
        isRetainerCue(currLower) || isRetainerCue(prevLower) || isRetainerCue(nextLower);

      let schemaField: "feeAmount" | "retainerAmount" | null = null;
      let options: string[] = [];

      if (hasFeeCue && !hasRetainerCue) {
        schemaField = "feeAmount";
        options = ["feeAmount"];
        seenFee = true;
      } else if (hasRetainerCue && !hasFeeCue) {
        schemaField = "retainerAmount";
        options = ["retainerAmount"];
        seenRetainer = true;
      } else {
        schemaField = null;
        options = ["feeAmount", "retainerAmount"];
        if (seenFee && !seenRetainer) {
          options = ["retainerAmount"];
        } else if (seenRetainer && !seenFee) {
          options = ["feeAmount"];
        }
      }

      candidates.push({
        rawValue: raw,
        schemaField,
        candidates: options,
        pageNumber: anchors[i].page,
        yPosition: anchors[i].y,
        roleHint: anchors[i].roleHint,
      });

      if (DEBUG) console.log(">>> Amount detected:", { raw, schemaField, options });
    }
  }

  // --- Dates ---
  const monthDateRegex = CONTRACT_KEYWORDS.dates.monthDateRegex;

  const emitDate = (
    rawDate: string,
    schemaField: "effectiveDate" | "expirationDate" | "executionDate",
    anchor: TextAnchor
  ) => {
    const iso = parseIsoDate(rawDate);
    candidates.push({
      rawValue: rawDate,
      schemaField,
      candidates: [schemaField],
      normalized: iso,
      displayValue: iso
        ? new Date(rawDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        : rawDate,
      pageNumber: anchor.page,
      yPosition: anchor.y,
      roleHint: anchor.roleHint,
    });
    if (DEBUG) console.log(`>>> Date emitted: ${schemaField} = ${rawDate}`);
  };

  // Inline dates
  for (const anchor of anchors) {
    let dm: RegExpExecArray | null;
    while ((dm = monthDateRegex.exec(anchor.text)) !== null) {
      const rawDate = dm[0];
      const lower = anchor.text.toLowerCase();

      if (CONTRACT_KEYWORDS.dates.effective.some(k => lower.includes(k))) {
        emitDate(rawDate, "effectiveDate", anchor);
      } else if (CONTRACT_KEYWORDS.dates.expiration.some(k => lower.includes(k))) {
        emitDate(rawDate, "expirationDate", anchor);
      } else if (CONTRACT_KEYWORDS.dates.execution.some(k => lower.includes(k))) {
        emitDate(rawDate, "executionDate", anchor);
      } else {
        // No cues → ambiguous
        candidates.push({
          rawValue: rawDate,
          schemaField: null,
          candidates: ["effectiveDate", "expirationDate"],
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
        });
        if (DEBUG) console.log(`>>> Ambiguous date emitted: ${rawDate}`);
      }
    }
  }

  // Execution date from signature block (extra guard)
  const sigStartIdx = anchors.findIndex(a => /signatures/i.test(a.text));
  const sigBlock = sigStartIdx >= 0 ? anchors.slice(sigStartIdx) : anchors.slice(-20);

  for (let i = 0; i < sigBlock.length; i++) {
    const curr = sigBlock[i];
    const next = sigBlock[i + 1];
    const windowText = `${curr.text} ${next ? next.text : ""}`;
    const windowLower = windowText.toLowerCase();

    if (CONTRACT_KEYWORDS.dates.execution.some(k => windowLower.includes(k))) {
      const dateMatch = windowText.match(monthDateRegex);
      if (dateMatch) {
        emitDate(dateMatch[0], "executionDate", curr);
        break;
      }
    }
  }

  // --- Governing Law ---
  for (const anchor of anchors) {
    const lower = anchor.text.toLowerCase();
    if (CONTRACT_KEYWORDS.governingLaw.cues.some(k => lower.includes(k))) {
      const match = anchor.text.match(/laws of\s+([A-Za-z\s]+)/i);
      if (match) {
        candidates.push({
          rawValue: match[1].trim(),
          schemaField: "governingLaw",
          candidates: ["governingLaw"],
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
        });
        if (DEBUG) console.log(`>>> Governing law detected: ${match[1].trim()}`);
      }
    }
  }

  // --- Scope of Representation ---
  const scopeHeadingRegex = /^\s*scope of representation\s*$/i;
  const scopeFragments = anchors.filter(
    a =>
      !scopeHeadingRegex.test(a.text.toLowerCase()) &&
      CONTRACT_KEYWORDS.scope.cues.some(k => a.text.toLowerCase().includes(k))
  );

  if (scopeFragments.length) {
    const fullScope = scopeFragments
      .map(f => f.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const firstSentence = fullScope.match(/[^.]{1,200}\./)?.[0]?.trim();
    const preview = firstSentence ?? fullScope;
    candidates.push({
      rawValue: fullScope,
      displayValue: preview.length > 200 ? `${preview.slice(0, 200)}…` : preview,
      schemaField: "scopeOfRepresentation",
      candidates: ["scopeOfRepresentation"],
      pageNumber: scopeFragments[0].page,
      yPosition: scopeFragments[0].y,
      roleHint: scopeFragments[0].roleHint,
    });
    if (DEBUG) console.log(">>> Scope of representation detected");
  }

  // --- Final instrumentation ---
  if (DEBUG) {
    console.log(">>> deriveCandidatesFromRead OUTPUT:");
    candidates.forEach((c, i) => {
      console.log(
        `[${i}] field=${c.schemaField} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" raw="${c.rawValue}"`
      );
    });
  }

  return candidates;
}

export interface TextAnchor {
  text: string;
  page: number;
  y: number;
  roleHint?: string;
}

export function getTextAnchors(readResult: any): TextAnchor[] {
  const anchors: TextAnchor[] = [];
  if (!readResult) return anchors;

  const HEADING_KEYWORDS = CONTRACT_KEYWORDS.headings.clauseKeywords;

  const norm = (s: string) =>
    s.replace(/\u00A0/g, " ") // normalize NBSP
      .trim()
      .replace(/\s+/g, " ");

  const isHeading = (raw: string): boolean => {
    let text = norm(raw).replace(/[:\-–]\s*$/, ""); // strip trailing colon/dash
    if (!text) return false;

    const lower = text.toLowerCase();
    if (HEADING_KEYWORDS.some(k => lower.includes(k))) return true;

    // heuristic fallback (short, title-like, no sentence end)
    if (/[.?!]$/.test(text)) return false;
    const words = text.split(" ");
    if (words.length > 8) return false;
    if (/^[A-Z0-9][A-Z0-9\s&:–-]+$/.test(text)) return true;
    if (/^[A-Z][A-Za-z0-9\s&:–-]+$/.test(text)) return true;

    return false;
  };

  const getY = (bb?: number[], fallback = 0): number => {
    if (Array.isArray(bb) && bb.length >= 8) {
      const ys = [bb[1], bb[3], bb[5], bb[7]].filter((v) => typeof v === "number");
      if (ys.length) return Math.min(...ys as number[]);
    }
    return fallback;
  };

  // Case A: PDF/image
  if (readResult.pages?.some((p: any) => (p.lines ?? []).length > 0)) {
    if (DEBUG) console.log(">>> getTextAnchors: PDF/image branch");
    for (const page of readResult.pages) {
      let buffer = "";
      let bufferY = 0;
      let currentHeading: string | undefined;

      for (const [lineIdx, line] of (page.lines ?? []).entries()) {
        const content = norm(String(line.content ?? ""));
        if (!content) continue;

        const heading = isHeading(content);
        if (heading) {
          if (buffer) {
            anchors.push({ text: buffer, page: page.pageNumber, y: bufferY, roleHint: currentHeading });
            if (DEBUG) console.log(`PDF EMIT body: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
            buffer = "";
          }
          currentHeading = content;
          const y = getY(line.boundingBox, lineIdx);
          anchors.push({ text: content, page: page.pageNumber, y, roleHint: currentHeading });
          if (DEBUG) console.log(`PDF HEADING: page=${page.pageNumber} y=${y} heading="${currentHeading}"`);
          continue;
        }

        if (!buffer) {
          buffer = content;
          bufferY = getY(line.boundingBox, lineIdx);
        } else {
          buffer += " " + content;
        }

        if (/[.?!]$/.test(content)) {
          anchors.push({ text: buffer, page: page.pageNumber, y: bufferY, roleHint: currentHeading });
          if (DEBUG) console.log(`PDF EMIT sentence: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
          buffer = "";
        }
      }

      if (buffer) {
        anchors.push({ text: buffer, page: page.pageNumber, y: bufferY, roleHint: currentHeading });
        if (DEBUG) console.log(`PDF EMIT tail: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
        buffer = "";
      }
    }
    if (DEBUG) console.log(`>>> getTextAnchors OUTPUT (PDF): count=${anchors.length}`);
    return anchors;
  }

  // Case B: DOCX
  if (readResult.paragraphs?.length) {
    if (DEBUG) console.log(">>> getTextAnchors: DOCX branch");
    let currentHeading: string | undefined;

    readResult.paragraphs.forEach((p: any, idx: number) => {
      const pageNum = p.boundingRegions?.[0]?.pageNumber ?? 1;
      const rawPara = String(p.content ?? "");
      const text = norm(rawPara);
      if (!text) return;

      const wasHeading = isHeading(text);
      if (DEBUG) console.log(`DOCX PARA[${idx}] page=${pageNum} wasHeading=${wasHeading} text="${text}"`);

      if (wasHeading) {
        currentHeading = text;
        const y = idx * 100;
        anchors.push({ text, page: pageNum, y, roleHint: currentHeading });
        if (DEBUG) console.log(`  -> SET currentHeading="${currentHeading}" EMIT heading: page=${pageNum} y=${y}`);
        return;
      }

      const parts = text
        .split(/(?<=[.?!])\s+(?=[A-Z])/)
        .map(norm)
        .filter(Boolean);

      for (let j = 0; j < parts.length; j++) {
        const s = parts[j];
        const y = idx * 100 + j;
        anchors.push({ text: s, page: pageNum, y, roleHint: currentHeading });
        if (DEBUG) console.log(`  EMIT sentence: page=${pageNum} y=${y} roleHint="${currentHeading ?? ""}" text="${s}"`);
      }
    });

    if (DEBUG) console.log(`>>> getTextAnchors OUTPUT (DOCX): count=${anchors.length}`);
    return anchors;
  }

  // Case C: fallback
  if (readResult.content) {
    if (DEBUG) console.log(">>> getTextAnchors: Fallback branch");
    let currentHeading: string | undefined;
    String(readResult.content)
      .split(/\r?\n/)
      .map(norm)
      .filter(Boolean)
      .forEach((line, idx) => {
        const wasHeading = isHeading(line);
        if (wasHeading) {
          currentHeading = line;
          anchors.push({ text: line, page: 1, y: idx, roleHint: currentHeading });
          if (DEBUG) console.log(`FALLBACK HEADING: page=1 y=${idx} heading="${currentHeading}"`);
        } else {
          anchors.push({ text: line, page: 1, y: idx, roleHint: currentHeading });
          if (DEBUG) console.log(`FALLBACK EMIT: page=1 y=${idx} roleHint="${currentHeading ?? ""}" text="${line}"`);
        }
      });
    if (DEBUG) console.log(`>>> getTextAnchors OUTPUT (Fallback): count=${anchors.length}`);
  }

  return anchors;
}
