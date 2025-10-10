// candidateUtils.ts

import {
  CONTRACT_KEYWORDS,
  PLACEHOLDER_KEYWORDS,
  PLACEHOLDER_REGEX
} from "../constants/contractKeywords.js";

import { Candidate } from "../types/Candidate";
import { TextAnchor } from "../types/TextAnchor";
import { normalizeBySchema } from "../utils/normalizeValue.js";
import { extractActors } from "./candidateExtractors/actors.js";
import { extractFeeStructure } from "./candidateExtractors/fees.js";
import { extractAmounts } from "./candidateExtractors/amounts.js";
import { extractDatesAndFilingParty } from "./candidateExtractors/dates.js";
import { extractGoverningLaw } from "./candidateExtractors/governingLaw.js";
import { extractScope } from "./candidateExtractors/scope.js";
import { extractIPRandL } from "./candidateExtractors/iprAndL.js";
import { logDebug, logWarn } from "./logger.js";

function normalizeHeading(h?: string): string {
  return (h ?? "").trim().toLowerCase();
}

function isPreferredHeadingForGoverningLaw(roleHint?: string): boolean {
  const h = normalizeHeading(roleHint);
  return h === "governing law" || h === "jurisdiction";
}

export function isPreferredHeadingForInventionAssignment(roleHint?: string): boolean {
  const h = normalizeHeading(roleHint);
  return (
    h === "invention assignment" ||
    h === "assignment of inventions" ||
    h === "assignment of intellectual property"
  );
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

    // Preferred-heading logic
    let shouldReplace = false;
    if (c.schemaField === "governingLaw") {
      const existingPreferred = isPreferredHeadingForGoverningLaw(existing.roleHint);
      const incomingPreferred = isPreferredHeadingForGoverningLaw(c.roleHint);

      logDebug(
        `DUP key=${key} existingIdx=${existingIdx} ` +
        `existing(roleHint="${existing.roleHint ?? ""}", preferred=${existingPreferred}, page=${existing.pageNumber}, y=${existing.yPosition}) ` +
        `incoming(roleHint="${c.roleHint ?? ""}", preferred=${incomingPreferred}, page=${c.pageNumber}, y=${c.yPosition})`
      );

      if (!existingPreferred && incomingPreferred) {
        shouldReplace = true;
        logDebug(
          `REPLACE_DECISION: governingLaw incoming is preferred-heading, existing is not. key=${key}`
        );
      } else {
        logDebug(
          `KEEP_DECISION: governingLaw prefers first occurrence or both preferred; merging metadata only. key=${key}`
        );
      }
    } else if (c.schemaField?.toLowerCase().startsWith("inventionassignment")) {
      const existingPreferred = isPreferredHeadingForInventionAssignment(existing.roleHint);
      const incomingPreferred = isPreferredHeadingForInventionAssignment(c.roleHint);

      logDebug(
        `DUP key=${key} existingIdx=${existingIdx} ` +
        `existing(roleHint="${existing.roleHint ?? ""}", preferred=${existingPreferred}, page=${existing.pageNumber}, y=${existing.yPosition}) ` +
        `incoming(roleHint="${c.roleHint ?? ""}", preferred=${incomingPreferred}, page=${c.pageNumber}, y=${c.yPosition})`
      );

      if (!existingPreferred && incomingPreferred) {
        shouldReplace = true;
        logDebug(
          `REPLACE_DECISION: inventionAssignment incoming is preferred-heading, existing is not. key=${key}`
        );
      } else {
        logDebug(
          `KEEP_DECISION: inventionAssignment prefers first occurrence or both preferred; merging metadata only. key=${key}`
        );
      }
    } else {
      logDebug(
        `DUP key=${key} field=${c.schemaField} -> KEEP first occurrence; merging metadata only. ` +
        `existing(roleHint="${existing.roleHint ?? ""}") incoming(roleHint="${c.roleHint ?? ""}")`
      );
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
export function deriveCandidatesFromRead(readResult: any): Candidate[] {
  if (!readResult) return [];

  const anchors: TextAnchor[] = getTextAnchors(readResult);

  // First extract actors
  const actorCandidates = extractActors(anchors);

  // Pull out inventor, partyA, partyB from actorCandidates
  const inventorNames = actorCandidates
    .filter(c => c.schemaField?.toLowerCase().startsWith("inventor"))
    .map(c => c.rawValue)
    .filter(Boolean);

  const ambiguousParties = actorCandidates.filter(
    c => c.schemaField === null && c.candidates?.includes("partyA")
  );

  let partyA = actorCandidates.find(c => c.schemaField?.toLowerCase() === "partya")?.rawValue ?? "";
  let partyB = actorCandidates.find(c => c.schemaField?.toLowerCase() === "partyb")?.rawValue ?? "";

  if (!partyA && ambiguousParties.length > 0) {
    partyA = ambiguousParties[0].rawValue;
  }
  if (!partyB && ambiguousParties.length > 1) {
    partyB = ambiguousParties[1].rawValue;
  }

  const candidates: Candidate[] = [
    ...actorCandidates,
    ...extractFeeStructure(anchors),
    ...extractAmounts(anchors),
    ...extractDatesAndFilingParty(anchors, { inventorNames, partyA, partyB }),
    ...extractGoverningLaw(anchors),
    ...extractScope(anchors),
    ...extractIPRandL(anchors, { inventorNames, partyA, partyB }),
  ];

  logDebug(">>> deriveCandidatesFromRead OUTPUT:");
  candidates.forEach((c, i) => {
    logDebug(
      `[${i}] field=${c.schemaField} page=${c.pageNumber} y=${c.yPosition} roleHint="${c.roleHint ?? ""}" raw="${c.rawValue}"`
    );
  });

  return candidates;
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
    logDebug(">>> getTextAnchors: PDF/image branch");
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
            logDebug(`PDF EMIT body: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
            buffer = "";
          }
          currentHeading = content;
          const y = getY(line.boundingBox, lineIdx);
          anchors.push({ text: content, page: page.pageNumber, y, roleHint: currentHeading });
          logDebug(`PDF HEADING: page=${page.pageNumber} y=${y} heading="${currentHeading}"`);
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
          logDebug(`PDF EMIT sentence: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
          buffer = "";
        }
      }

      if (buffer) {
        anchors.push({ text: buffer, page: page.pageNumber, y: bufferY, roleHint: currentHeading });
        logDebug(`PDF EMIT tail: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
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

      const wasHeading = isHeading(text);
      logDebug(`DOCX PARA[${idx}] page=${pageNum} wasHeading=${wasHeading} text="${text}"`);

      if (wasHeading) {
        currentHeading = text;
        const y = idx * 100;
        anchors.push({ text, page: pageNum, y, roleHint: currentHeading });
        logDebug(`  -> SET currentHeading="${currentHeading}" EMIT heading: page=${pageNum} y=${y}`);
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
        logDebug(`  EMIT sentence: page=${pageNum} y=${y} roleHint="${currentHeading ?? ""}" text="${s}"`);
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
        const wasHeading = isHeading(line);
        if (wasHeading) {
          currentHeading = line;
          anchors.push({ text: line, page: 1, y: idx, roleHint: currentHeading });
          logDebug(`FALLBACK HEADING: page=1 y=${idx} heading="${currentHeading}"`);
        } else {
          anchors.push({ text: line, page: 1, y: idx, roleHint: currentHeading });
          logDebug(`FALLBACK EMIT: page=1 y=${idx} roleHint="${currentHeading ?? ""}" text="${line}"`);
        }
      });
    logDebug(`>>> getTextAnchors OUTPUT (Fallback): count=${anchors.length}`);
  }

  return anchors;
}

/**
 * Given the original document buffer and extracted candidates,
 * produce a placeholderized copy of the document and enrich candidates
 * with a `placeholder` property.
 */
export function placeholderizeDocument(
  buffer: Buffer,
  candidates: Candidate[]
): { placeholderBuffer: Buffer; enrichedCandidates: Candidate[] } {
  let text = buffer.toString("utf8");

  const enrichedCandidates = candidates.map((c) => {
    let placeholder: string | undefined;

    // Only build a placeholder when schemaField is explicitly set.
    const sourceRaw = c.schemaField ?? null;
    const source = sourceRaw?.trim() || null;

    if (source) {
      const digits = (source.match(/\d+$/) || [])[0];
      const base = source.replace(/\d+$/, "").toLowerCase();
      const keyword = PLACEHOLDER_KEYWORDS[base];

      logDebug("placeholderizeDocument.result", {
        schemaField: c.schemaField,
        candidates: c.candidates,
        base,
        keyword,
        digits,
        raw: c.rawValue,
      });

      if (keyword) {
        placeholder = digits ? `{{${keyword}${digits}}}` : `{{${keyword}}}`;

        if (c.rawValue && !PLACEHOLDER_REGEX.test(c.rawValue)) {
          const safeRaw = escapeRegExp(c.rawValue.trim());
          const regex = new RegExp(safeRaw, "m");
          text = text.replace(regex, placeholder);
          logDebug("placeholderizeDocument.replace", {
            source,
            raw: c.rawValue,
            placeholder,
          });
        }
      } else {
        logWarn("placeholderizeDocument.noKeyword", {
          source,
          base,
          raw: c.rawValue,
        });
      }
    } else {
      // Ambiguous row (no schemaField yet). Do not auto-assign a placeholder.
      logDebug("placeholderizeDocument.ambiguousNoSchema", {
        candidates: c.candidates,
        raw: c.rawValue,
      });
    }

    return {
      ...c,
      placeholder,
      normalized: c.normalized
        ? normalizeBySchema(c.normalized, c.schemaField)
        : c.normalized,
    };
  });

  const placeholderBuffer = Buffer.from(text, "utf8");
  return { placeholderBuffer, enrichedCandidates };
}

// Utility to escape regex special chars in raw text
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
