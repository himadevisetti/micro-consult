// candidateUtils.ts

import {
  CONTRACT_KEYWORDS,
  PLACEHOLDER_KEYWORDS,
  PLACEHOLDER_REGEX
} from "../constants/contractKeywords.js";

import { Candidate } from "../types/Candidate";
import { TextAnchor } from "../types/TextAnchor";
import { normalizeHeading, normalizeBySchema } from "../utils/normalizeValue.js";
import { extractActors } from "./candidateExtractors/actors.js";
import { extractFeeStructure } from "./candidateExtractors/fees.js";
import { extractAmounts } from "./candidateExtractors/amounts.js";
import { extractDatesAndFilingParty } from "./candidateExtractors/dates.js";
import { extractGoverningLaw } from "./candidateExtractors/governingLaw.js";
import { extractScope } from "./candidateExtractors/scope.js";
import { extractIPRandL } from "./candidateExtractors/iprAndL.js";
import JSZip from "jszip";
import { logDebug, logWarn } from "./logger.js";

export function isPreferredHeading(schemaField: string, roleHint?: string): boolean {
  const h = normalizeHeading(roleHint);
  const variants = (CONTRACT_KEYWORDS.headings.byField as Record<string, string[]>)[schemaField] ?? [];
  return variants.map(normalizeHeading).includes(h);
}

/**
 * Merge candidates, deduping by schemaField + normalized value.
 */
export function mergeCandidates(candidates: Candidate[]): Candidate[] {
  // INPUT LOG
  logDebug(">>> mergeCandidates INPUT:");
  candidates.forEach((c, i) => {
    const schema = c.schemaField ?? "null";
    const normKey = c.schemaField
      ? `${c.schemaField}::${normalizeBySchema(c.rawValue, c.schemaField)}`
      : "(passthrough)";
    logDebug(
      `[${i}] field=${schema} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" normalized="${c.normalized ?? ""}" raw="${c.rawValue}" key=${normKey}`
    );
  });

  const indexByKey = new Map<string, number>();
  const out: Candidate[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];

    if (c.schemaField == null) {
      out.push({ ...c });
      continue;
    }

    const norm = normalizeBySchema(c.rawValue, c.schemaField);
    const key = `${c.schemaField}::${norm}`;
    const existingIdx = indexByKey.get(key);

    if (existingIdx == null) {
      const next: Candidate = { ...c };
      // ✅ Only lowercase for the check, never mutate schemaField
      if (!next.normalized && c.schemaField && c.schemaField.toLowerCase().includes("date")) {
        const d = new Date(c.rawValue);
        if (!isNaN(d.getTime())) {
          next.normalized = d.toISOString().slice(0, 10);
        }
      }
      indexByKey.set(key, out.length);
      out.push(next);
      logDebug(
        `ADD key=${key} @outIdx=${out.length - 1} field=${c.schemaField} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" raw="${c.rawValue}"`
      );
      continue;
    }

    const existing = out[existingIdx];

    // Preferred-heading logic (generic across all schema fields)
    let shouldReplace = false;
    {
      const existingPreferred = isPreferredHeading(c.schemaField, existing.roleHint);
      const incomingPreferred = isPreferredHeading(c.schemaField, c.roleHint);

      logDebug(
        `DUP key=${key} existingIdx=${existingIdx} ` +
        `existing(roleHint="${existing.roleHint ?? ""}", preferred=${existingPreferred}, page=${existing.pageNumber}, y=${existing.yPosition}) ` +
        `incoming(roleHint="${c.roleHint ?? ""}", preferred=${incomingPreferred}, page=${c.pageNumber}, y=${c.yPosition})`
      );

      if (!existingPreferred && incomingPreferred) {
        shouldReplace = true;
        logDebug(
          `REPLACE_DECISION: ${c.schemaField} incoming is preferred-heading, existing is not. key=${key}`
        );
      } else {
        logDebug(
          `KEEP_DECISION: ${c.schemaField} prefers first occurrence or both preferred; merging metadata only. key=${key}`
        );
      }
    }

    if (shouldReplace) {
      out[existingIdx] = { ...existing, ...c };
      logDebug(
        `REPLACED key=${key} @outIdx=${existingIdx} with incoming (page=${c.pageNumber}, y=${c.yPosition}, roleHint="${c.roleHint ?? ""}")`
      );
    } else {
      const mergedLabels = Array.from(
        new Set([...(existing.candidates ?? []), ...(c.candidates ?? [])])
      );
      if (mergedLabels.length) existing.candidates = mergedLabels;
      if (!existing.normalized && c.normalized) existing.normalized = c.normalized;
      if (!existing.displayValue && c.displayValue) existing.displayValue = c.displayValue;
      if (!existing.roleHint && c.roleHint) existing.roleHint = c.roleHint;

      logDebug(
        `MERGED_METADATA key=${key} @outIdx=${existingIdx} ` +
        `normalized="${existing.normalized ?? ""}" displayValue="${existing.displayValue ?? ""}" roleHint="${existing.roleHint ?? ""}"`
      );
    }
  }

  // OUTPUT LOG
  logDebug(">>> mergeCandidates OUTPUT:");
  out.forEach((c, i) => {
    const schema = c.schemaField ?? "null";
    const normKey = c.schemaField
      ? `${c.schemaField}::${normalizeBySchema(c.rawValue, c.schemaField)}`
      : "(passthrough)";
    logDebug(
      `[${i}] field=${schema} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" normalized="${c.normalized ?? ""}" raw="${c.rawValue}" key=${normKey}`
    );
  });

  return out;
}

// Sort by document order using page + yPosition (or docIndex if present)
export function sortCandidatesByDocumentOrder(cands: Candidate[]): Candidate[] {
  return [...cands].sort((a, b) => {
    // --- Handle pageNumber undefined cases ---
    if (a.pageNumber == null && b.pageNumber == null) return 0;
    if (a.pageNumber == null) return 1; // unanchored goes last
    if (b.pageNumber == null) return -1;

    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber;
    }

    // --- Optional docIndex tie-breaker ---
    if ((a as any).docIndex != null && (b as any).docIndex != null) {
      return (a as any).docIndex - (b as any).docIndex;
    }

    // --- Handle yPosition undefined cases ---
    if (a.yPosition == null && b.yPosition == null) return 0;
    if (a.yPosition == null) return 1;
    if (b.yPosition == null) return -1;

    return a.yPosition - b.yPosition;
  });
}

// Debug helper: log all raw lines from prebuilt-read
export function logAllReadFields(readResult: any) {
  if (!readResult) {
    logWarn("logAllReadFields: No read result");
    return;
  }

  // PDF / image path: pages[].lines populated
  if (readResult.pages?.some((p: any) => (p.lines ?? []).length > 0)) {
    readResult.pages.forEach((page: any, idx: number) => {
      logDebug(`logAllReadFields: --- Page ${idx + 1} ---`);
      (page.lines ?? []).forEach((line: any) => {
        logDebug(`Line: "${line.content}"`);
      });
    });
    return;
  }

  // DOCX path: fall back to paragraphs
  if (readResult.paragraphs?.length) {
    logDebug("logAllReadFields: --- Paragraphs ---");
    readResult.paragraphs.forEach((p: any, idx: number) => {
      const page = p.boundingRegions?.[0]?.pageNumber ?? "?";
      logDebug(`[p${idx}] (page ${page}) "${p.content}"`);
    });
    return;
  }

  // Fallback: just dump content
  if (readResult.content) {
    logDebug("logAllReadFields: --- Content ---");
    logDebug(readResult.content);
  } else {
    logWarn("logAllReadFields: No lines, paragraphs, or content found");
  }
}

/**
 * Derive structured candidates from prebuilt-read output.
 */
export function deriveCandidatesFromRead(
  readResult: any
): { candidates: Candidate[] } {
  if (!readResult) {
    logDebug(">>> deriveCandidatesFromRead.emptyInput");
    return { candidates: [] };
  }

  // Still build anchors internally for the extractors
  const anchors: TextAnchor[] = getTextAnchors(readResult);

  // First extract all actors (partyA, partyB, inventors)
  const actorCandidates = extractActors(anchors);

  // Pull out inventor names (handles both "Inventor" and "InventorN")
  const inventorNames = actorCandidates
    .filter(c => c.schemaField && c.schemaField.toLowerCase().startsWith("inventor"))
    .map(c => c.rawValue)
    .filter(Boolean);

  // Handle ambiguous parties
  const ambiguousParties = actorCandidates.filter(
    c => c.schemaField === null && c.candidates?.includes("partyA")
  );

  let partyA =
    actorCandidates.find(c => c.schemaField?.toLowerCase() === "partya")
      ?.rawValue ?? "";
  let partyB =
    actorCandidates.find(c => c.schemaField?.toLowerCase() === "partyb")
      ?.rawValue ?? "";

  if (!partyA && ambiguousParties.length > 0) {
    partyA = ambiguousParties[0].rawValue;
  }
  if (!partyB && ambiguousParties.length > 1) {
    partyB = ambiguousParties[1].rawValue;
  }

  // Merge all candidates
  const candidates: Candidate[] = [
    ...actorCandidates,
    ...extractFeeStructure(anchors),
    ...extractAmounts(anchors),
    ...extractDatesAndFilingParty(anchors, { inventorNames, partyA, partyB }),
    ...extractGoverningLaw(anchors),
    ...extractScope(anchors),
    ...extractIPRandL(anchors, { inventorNames, partyA, partyB }),
  ];

  logDebug(">>> deriveCandidatesFromRead.output", {
    candidateCount: candidates.length,
    sample: candidates.slice(0, 10).map((c, i) => ({
      i,
      field: c.schemaField,
      page: c.pageNumber,
      y: c.yPosition,
      roleHint: c.roleHint ?? "",
      raw: c.rawValue,
    })),
  });

  return { candidates };
}

export function getTextAnchors(readResult: any): TextAnchor[] {
  const anchors: TextAnchor[] = [];
  if (!readResult) return anchors;

  const norm = (s: string) =>
    s.replace(/\u00A0/g, " ") // normalize NBSP
      .trim()
      .replace(/\s+/g, " ");

  // Flatten all heading variants into one normalized set
  const ALL_HEADING_VARIANTS = Object.values(CONTRACT_KEYWORDS.headings.byField)
    .flat()
    .map(normalizeHeading);

  // Conservative, keyword-first heading detector with explicit reasons.
  const isHeading = (raw: string): { is: boolean; reason: string } => {
    const text = norm(raw).replace(/[:\-–]\s*$/, "");
    if (!text) return { is: false, reason: "empty" };

    const hNorm = normalizeHeading(text);

    // 1) Explicit clause keywords win
    if (ALL_HEADING_VARIANTS.includes(hNorm)) {
      return { is: true, reason: "keyword" };
    }

    // 2) If it ends with sentence punctuation -> body
    if (/[.?!]$/.test(text)) {
      return { is: false, reason: "sentencePunct" };
    }

    // 3) If it looks sentence-like (contains common verbs, currency, dates, long length) -> body
    const words = text.split(/\s+/);
    const hasVerb = /\b(is|are|was|were|shall|will|includes?|pertains?|constitutes|agrees?|licensed?|executed)\b/i.test(
      text
    );
    const hasCurrencyOrNumber = /[$]\s*\d|USD|\b\d{4}\b/.test(text);
    const tooLong = words.length > 12 || text.length > 80;
    if (hasVerb || hasCurrencyOrNumber || tooLong) {
      return {
        is: false,
        reason: `sentenceLike: verb=${hasVerb} moneyOrNum=${hasCurrencyOrNumber} long=${tooLong}`,
      };
    }

    // 4) Conservative fallback: short ALL-CAPS or short Title-Case tokens only
    const isAllCapsShort = /^[A-Z\s&]+$/.test(text) && words.length <= 4;
    const isTitleCaseShort =
      /^[A-Z][A-Za-z0-9\s&:–-]+$/.test(text) && words.length <= 4;
    if (isAllCapsShort || isTitleCaseShort) {
      return {
        is: true,
        reason: isAllCapsShort
          ? "fallbackAllCapsShort"
          : "fallbackTitleCaseShort",
      };
    }

    // Otherwise body
    return { is: false, reason: "defaultBody" };
  };

  const getY = (bb?: number[], fallback = 0): number => {
    if (Array.isArray(bb) && bb.length >= 8) {
      const ys = [bb[1], bb[3], bb[5], bb[7]].filter(
        (v) => typeof v === "number"
      );
      if (ys.length) return Math.min(...(ys as number[]));
    }
    return fallback;
  };

  // Case A: PDF/image
  if (readResult.pages?.some((p: any) => (p.lines ?? []).length > 0)) {
    logDebug(">>> getTextAnchors: PDF/image branch");
    for (const page of readResult.pages) {
      let buffer = "";
      let bufferY = 0;
      let currentHeading: string | undefined;

      for (const [lineIdx, line] of (page.lines ?? []).entries()) {
        const content = norm(String(line.content ?? ""));
        if (!content) continue;

        const heading = isHeading(content);
        if (heading.is) {
          if (buffer) {
            anchors.push({
              text: buffer,
              page: page.pageNumber,
              y: bufferY,
              roleHint: currentHeading,
            });
            logDebug(
              `PDF EMIT body: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""
              }" text="${buffer}"`
            );
            buffer = "";
          }
          currentHeading = content;
          const y = getY(line.boundingBox, lineIdx);
          anchors.push({
            text: content,
            page: page.pageNumber,
            y,
            roleHint: currentHeading,
          });
          logDebug(
            `PDF HEADING: page=${page.pageNumber} y=${y} heading="${currentHeading}"`
          );
          continue;
        }

        if (!buffer) {
          buffer = content;
          bufferY = getY(line.boundingBox, lineIdx);
        } else {
          buffer += " " + content;
        }

        if (/[.?!]$/.test(content)) {
          anchors.push({
            text: buffer,
            page: page.pageNumber,
            y: bufferY,
            roleHint: currentHeading,
          });
          logDebug(
            `PDF EMIT sentence: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""
            }" text="${buffer}"`
          );
          buffer = "";
        }
      }

      if (buffer) {
        anchors.push({
          text: buffer,
          page: page.pageNumber,
          y: bufferY,
          roleHint: currentHeading,
        });
        logDebug(
          `PDF EMIT tail: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""
          }" text="${buffer}"`
        );
        buffer = "";
      }
    }
    logDebug(`>>> getTextAnchors OUTPUT (PDF): count=${anchors.length}`);
    return anchors;
  }

  // Case B: DOCX
  if (readResult.paragraphs?.length) {
    logDebug(">>> getTextAnchors: DOCX branch");
    let currentHeading: string | undefined;

    readResult.paragraphs.forEach((p: any, idx: number) => {
      const pageNum = p.boundingRegions?.[0]?.pageNumber ?? 1;
      const rawPara = String(p.content ?? "");
      const text = norm(rawPara);
      if (!text) return;

      const h = isHeading(text);
      const words = text.split(/\s+/);
      const looksSentence =
        /[.?!]/.test(text) ||
        /\b(is|are|was|were|shall|will|includes?|pertains?|constitutes|agrees?|licensed?|executed)\b/i.test(text) ||
        /[$]\s*\d|USD|\b\d{4}\b/.test(text) ||
        words.length > 12 ||
        text.length > 80;

      // Never downgrade explicit keyword headings or conservative ALL-CAPS fallback.
      // Only downgrade non-keyword fallback headings that look sentence-like.
      const shouldDowngrade =
        h.is && h.reason !== "keyword" && h.reason !== "fallbackAllCapsShort" && looksSentence;

      const wasHeading = h.is && !shouldDowngrade;

      logDebug(
        `DOCX PARA[${idx}] page=${pageNum} wasHeading=${wasHeading} reason="${h.reason}" text="${text}"`
      );

      if (wasHeading) {
        // Genuine heading
        currentHeading = text;
        const y = idx * 100;
        anchors.push({ text, page: pageNum, y, roleHint: currentHeading });
        logDebug(`  -> SET currentHeading="${currentHeading}" EMIT heading: page=${pageNum} y=${y}`);
        return;
      }

      // Body: split into sentences and emit under currentHeading
      const parts = text
        .split(/(?<=[.?!])\s+(?=[A-Z])/)
        .map(norm)
        .filter(Boolean);

      for (let j = 0; j < parts.length; j++) {
        const s = parts[j];
        const y = idx * 100 + j;
        anchors.push({ text: s, page: pageNum, y, roleHint: currentHeading });
        logDebug(
          `  EMIT sentence: page=${pageNum} y=${y} roleHint="${currentHeading ?? ""}" text="${s}"`
        );
      }
    });

    logDebug(`>>> getTextAnchors OUTPUT (DOCX): count=${anchors.length}`);
    return anchors;
  }

  // Case C: fallback
  if (readResult.content) {
    logDebug(">>> getTextAnchors: Fallback branch");
    let currentHeading: string | undefined;
    String(readResult.content)
      .split(/\r?\n/)
      .map(norm)
      .filter(Boolean)
      .forEach((line, idx) => {
        const h = isHeading(line);
        if (h.is) {
          currentHeading = line;
          anchors.push({ text: line, page: 1, y: idx, roleHint: currentHeading });
          logDebug(`FALLBACK HEADING: page=1 y=${idx} heading="${currentHeading}"`);
        } else {
          anchors.push({ text: line, page: 1, y: idx, roleHint: currentHeading });
          logDebug(
            `FALLBACK EMIT: page=1 y=${idx} roleHint="${currentHeading ?? ""}" text="${line}"`
          );
        }
      });
    logDebug(`>>> getTextAnchors OUTPUT (Fallback): count=${anchors.length}`);
    return anchors;
  }

  return anchors;
}

/**
 * Given the original document buffer and extracted candidates,
 * produce a placeholderized copy of the document and enrich candidates
 * with a `placeholder` property.
 */
export async function placeholderizeDocument(
  buffer: Buffer,
  candidates: Candidate[],
  ext: string
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates?: Candidate[] }> {
  if (ext.toLowerCase() === "pdf") {
    // No‑op for PDFs
    return { placeholderBuffer: buffer };
  }

  // DOCX branch delegates to the actual implementation
  return placeholderizeDocx(buffer, candidates);
}

async function placeholderizeDocx(
  buffer: Buffer,
  candidates: Candidate[]
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates: Candidate[] }> {
  const zip = await JSZip.loadAsync(buffer);

  const docXmlPath = "word/document.xml";
  const fileEntry = zip.file(docXmlPath);
  if (!fileEntry) {
    throw new Error("DOCX missing document.xml");
  }
  let docXml: string = await fileEntry.async("string");

  const enrichedCandidates = candidates.map((c) => {
    let placeholder: string | undefined;

    if (c.schemaField) {
      const digits = (c.schemaField.match(/\d+$/) || [])[0];
      const base = c.schemaField.replace(/\d+$/, "").toLowerCase();
      const keyword = PLACEHOLDER_KEYWORDS[base];
      const matchText = c.rawValue;

      if (keyword) {
        placeholder = digits ? `{{${keyword}${digits}}}` : `{{${keyword}}}`;

        if (matchText && !PLACEHOLDER_REGEX.test(matchText)) {
          const normalizedMatch = matchText.trim().replace(/\s+/g, " ");
          const safeMatch = escapeRegExp(normalizedMatch);

          if (c.roleHint === "Parties") {
            // Parties: limit to a single replacement (prefer scoped, else first occurrence only)
            if (c.sourceText) {
              const safeScope = escapeRegExp(c.sourceText.trim().replace(/\s+/g, " "));
              const scopeRegex = new RegExp(safeScope, "m");
              const scopeMatch = docXml.match(scopeRegex);

              if (scopeMatch) {
                const scopeText = scopeMatch[0];
                const oneValueRegex = new RegExp(safeMatch); // no 'g' → replace only first
                const replacedScope = scopeText.replace(oneValueRegex, placeholder);
                docXml = docXml.replace(scopeRegex, replacedScope);
              } else {
                const oneValueRegex = new RegExp(safeMatch);
                docXml = docXml.replace(oneValueRegex, placeholder);
              }
            } else {
              const oneValueRegex = new RegExp(safeMatch);
              docXml = docXml.replace(oneValueRegex, placeholder);
            }
          } else {
            // Non-Parties: scoped if possible, else global
            const valueRegex = new RegExp(safeMatch, "g");

            if (c.sourceText) {
              const safeScope = escapeRegExp(c.sourceText.trim().replace(/\s+/g, " "));
              const scopeRegex = new RegExp(safeScope, "m");
              const scopeMatch = docXml.match(scopeRegex);

              if (scopeMatch) {
                const scopeText = scopeMatch[0];
                const replacedScope = scopeText.replace(valueRegex, placeholder);
                docXml = docXml.replace(scopeRegex, replacedScope);
              } else {
                docXml = docXml.replace(valueRegex, placeholder);
              }
            } else {
              docXml = docXml.replace(valueRegex, placeholder);
            }
          }
        }
      }
    }

    return { ...c, placeholder };
  });

  zip.file(docXmlPath, docXml);
  const placeholderBuffer = await zip.generateAsync({ type: "nodebuffer" });

  // Single summary log
  logDebug(">>> placeholderizeDocument.done", {
    candidateCount: enrichedCandidates.length,
    placeholders: enrichedCandidates
      .filter((c) => c.placeholder)
      .map((c) => ({ field: c.schemaField, placeholder: c.placeholder })),
  });

  return { placeholderBuffer, enrichedCandidates };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
