// src/utils/getTextAnchors.ts

import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../../utils/normalizeValue.js";
import { logDebug } from "../logger.js";

const TRACE = process.env.DEBUG_TRACE === "true";

export function getTextAnchors(readResult: any): TextAnchor[] {
  const anchors: TextAnchor[] = [];
  if (!readResult) return anchors;

  const norm = (s: string) =>
    s.replace(/\u00A0/g, " ")
      .trim()
      .replace(/\s+/g, " ");

  const ALL_HEADING_VARIANTS = Object.values(CONTRACT_KEYWORDS.headings.byField)
    .flat()
    .map(normalizeHeading);

  const isHeading = (raw: string): { is: boolean; reason: string } => {
    const text = norm(raw).replace(/[:\-–]\s*$/, "");
    if (!text) return { is: false, reason: "empty" };
    const hNorm = normalizeHeading(text);
    if (ALL_HEADING_VARIANTS.includes(hNorm)) return { is: true, reason: "keyword" };
    if (/[.?!]$/.test(text)) return { is: false, reason: "sentencePunct" };
    const words = text.split(/\s+/);
    const hasVerb = /\b(is|are|was|were|shall|will|includes?|pertains?|constitutes|agrees?|licensed?|executed)\b/i.test(text);
    const hasCurrencyOrNumber = /[$]\s*\d|USD|\b\d{4}\b/.test(text);
    const tooLong = words.length > 12 || text.length > 80;
    if (hasVerb || hasCurrencyOrNumber || tooLong) {
      return { is: false, reason: "sentenceLike" };
    }
    const isAllCapsShort = /^[A-Z\s&]+$/.test(text) && words.length <= 4;
    const isTitleCaseShort = /^[A-Z][A-Za-z0-9\s&:–-]+$/.test(text) && words.length <= 4;
    if (isAllCapsShort || isTitleCaseShort) {
      return { is: true, reason: isAllCapsShort ? "fallbackAllCapsShort" : "fallbackTitleCaseShort" };
    }
    return { is: false, reason: "defaultBody" };
  };

  const getY = (bb?: number[], fallback = 0): number => {
    if (Array.isArray(bb) && bb.length >= 8) {
      const ys = [bb[1], bb[3], bb[5], bb[7]].filter(v => typeof v === "number");
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
            anchors.push({ text: buffer, page: page.pageNumber, y: bufferY, roleHint: currentHeading });
            if (TRACE) logDebug(`PDF EMIT body: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
            buffer = "";
          }
          currentHeading = content;
          const y = getY(line.boundingBox, lineIdx);
          anchors.push({ text: content, page: page.pageNumber, y, roleHint: currentHeading });
          if (TRACE) logDebug(`PDF HEADING: page=${page.pageNumber} y=${y} heading="${currentHeading}"`);
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
          if (TRACE) logDebug(`PDF EMIT sentence: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
          buffer = "";
        }
      }

      if (buffer) {
        anchors.push({ text: buffer, page: page.pageNumber, y: bufferY, roleHint: currentHeading });
        if (TRACE) logDebug(`PDF EMIT tail: page=${page.pageNumber} y=${bufferY} roleHint="${currentHeading ?? ""}" text="${buffer}"`);
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

      const shouldDowngrade = h.is && h.reason !== "keyword" && h.reason !== "fallbackAllCapsShort" && looksSentence;
      const wasHeading = h.is && !shouldDowngrade;

      if (TRACE) logDebug(`DOCX PARA[${idx}] page=${pageNum} wasHeading=${wasHeading} reason="${h.reason}" text="${text}"`);

      if (wasHeading) {
        currentHeading = text;
        const y = idx * 100;
        anchors.push({ text, page: pageNum, y, roleHint: currentHeading });
        if (TRACE) logDebug(`  -> SET currentHeading="${currentHeading}" EMIT heading: page=${pageNum} y=${y}`);
        return;
      }

      const parts = text.split(/(?<=[.?!])\s+(?=[A-Z])/).map(norm).filter(Boolean);
      for (let j = 0; j < parts.length; j++) {
        const s = parts[j];
        const y = idx * 100 + j;
        anchors.push({ text: s, page: pageNum, y, roleHint: currentHeading });
        if (TRACE) logDebug(`  EMIT sentence: page=${pageNum} y=${y} roleHint="${currentHeading ?? ""}" text="${s}"`);
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
          if (TRACE) logDebug(`FALLBACK HEADING: page=1 y=${idx} heading="${currentHeading}"`);
        } else {
          anchors.push({ text: line, page: 1, y: idx, roleHint: currentHeading });
          if (TRACE) logDebug(`FALLBACK EMIT: page=1 y=${idx} roleHint="${currentHeading ?? ""}" text="${line}"`);
        }
      });
    logDebug(`>>> getTextAnchors OUTPUT (Fallback): count=${anchors.length}`);
    return anchors;
  }

  return anchors;
}
