// src/utils/getTextAnchors.ts

import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../../utils/normalizeValue.js";
import { groupByRoleHint } from "../groupByRoleHint.js";
import { logClauseBlocks } from "../logClauseBlocks.js";
import { logDebug } from "../logger.js";

const TRACE = process.env.DEBUG_TRACE === "true";

export function getTextAnchors(readResult: any): ClauseBlock[] {
  const anchors: any[] = [];
  if (!readResult) return [];

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

  const getY = (bb?: number[] | { x: number; y: number }[], fallback = 0): number => {
    if (Array.isArray(bb) && bb.length >= 4) {
      if (typeof bb[0] === "number") {
        const ys = [bb[1], bb[3], bb[5], bb[7]].filter(v => typeof v === "number");
        if (ys.length) return Math.min(...(ys as number[]));
      } else {
        const ys = (bb as { x: number; y: number }[]).map(p => p.y);
        if (ys.length) return Math.min(...ys);
      }
    }
    return fallback;
  };

  const emitHeading = (pageNum: number, y: number, text: string, reason: string, currentHeading: string | undefined) => {
    anchors.push({ text, page: pageNum, y, roleHint: text, wasHeading: true });
    if (TRACE) logDebug(`EMIT heading: page=${pageNum} y=${y} wasHeading=true reason="${reason}" heading="${text}"`);
  };

  const emitSentence = (pageNum: number, y: number, text: string, currentHeading: string | undefined) => {
    anchors.push({ text, page: pageNum, y, roleHint: currentHeading, wasHeading: false });
    if (TRACE) logDebug(`EMIT sentence: page=${pageNum} y=${y} roleHint="${currentHeading ?? ""}" text="${text}"`);
  };

  // Case A: PDF/image
  if (readResult.pages?.some((p: any) => (p.lines ?? []).length > 0)) {
    logDebug(">>> getTextAnchors: PDF/image branch");
    for (const page of readResult.pages) {
      let currentHeading: string | undefined;
      let bufferText = "";
      let bufferStartY: number | undefined;

      const flushBuffer = () => {
        if (!bufferText) return;
        const parts = bufferText.split(/(?<=[.?!])\s+(?=[A-Z])/).map(norm).filter(Boolean);
        for (let j = 0; j < parts.length; j++) {
          const s = parts[j];
          emitSentence(page.pageNumber, (bufferStartY ?? 0) + j, s, currentHeading);
        }
        bufferText = "";
        bufferStartY = undefined;
      };

      for (const [lineIdx, line] of (page.lines ?? []).entries()) {
        const content = norm(String(line.content ?? ""));
        if (!content) continue;

        const h = isHeading(content);
        const words = content.split(/\s+/);
        const looksSentence =
          /[.?!]/.test(content) ||
          /\b(is|are|was|were|shall|will|includes?|pertains?|constitutes|agrees?|licensed?|executed)\b/i.test(content) ||
          /[$]\s*\d|USD|\b\d{4}\b/.test(content) ||
          words.length > 12 ||
          content.length > 80;
        const shouldDowngrade = h.is && h.reason !== "keyword" && h.reason !== "fallbackAllCapsShort" && looksSentence;
        const wasHeading = h.is && !shouldDowngrade;

        const y = getY(line.polygon ?? line.boundingBox, lineIdx);

        const inSignatureSection =
          currentHeading &&
          CONTRACT_KEYWORDS.headings.byField.signatures
            .map(normalizeHeading)
            .includes(normalizeHeading(currentHeading));

        if (wasHeading) {
          if (inSignatureSection && h.reason === "fallbackTitleCaseShort") {
            emitSentence(page.pageNumber, y, content, currentHeading);
            if (TRACE) logDebug("terminal.emitLine.PDF", { page: page.pageNumber, heading: currentHeading, text: content });
            continue;
          }
          flushBuffer();
          currentHeading = content;
          emitHeading(page.pageNumber, y, content, h.reason, currentHeading);
          continue;
        }

        if (!bufferText) bufferStartY = y;
        bufferText = bufferText ? `${bufferText} ${content}` : content;
        if (/[.?!]$/.test(content)) flushBuffer();
      }
      flushBuffer();
    }

    logDebug(`>>> getTextAnchors OUTPUT (PDF): count=${anchors.length}`);
    const clauseBlocks = groupByRoleHint(anchors);
    logClauseBlocks(clauseBlocks, "PDF");
    return clauseBlocks;
  }

  // Case B: DOCX  // Case B: DOCX
  if (readResult.paragraphs?.length) {
    logDebug(">>> getTextAnchors: DOCX branch");
    let currentHeading: string | undefined;
    readResult.paragraphs.forEach((p: any, idx: number) => {
      const pageNum = p.boundingRegions?.[0]?.pageNumber ?? 1;
      const text = norm(String(p.content ?? ""));
      if (!text) return;

      const h = isHeading(text);
      const words = text.split(/\s+/);
      const looksSentence =
        /[.?!]/.test(text) ||
        /\b(is|are|was|were|shall|will|includes?|pertains?|constitutes|agrees?|licensed?|executed)\b/i.test(text) ||
        /[$]\s*\d|USD|\b\d{4}\b/.test(text) ||
        words.length > 12 ||
        text.length > 80;
      const shouldDowngrade =
        h.is && h.reason !== "keyword" && h.reason !== "fallbackAllCapsShort" && looksSentence;
      const wasHeading = h.is && !shouldDowngrade;

      const inSignatureSection =
        currentHeading &&
        CONTRACT_KEYWORDS.headings.byField.signatures
          .map(normalizeHeading)
          .includes(normalizeHeading(currentHeading));

      if (wasHeading) {
        if (inSignatureSection && h.reason === "fallbackTitleCaseShort") {
          emitSentence(pageNum, idx * 100, text, currentHeading);
          if (TRACE) logDebug("terminal.emitLine.DOCX", { page: pageNum, heading: currentHeading, text });
          return;
        }
        currentHeading = text;
        const y = idx * 100;
        emitHeading(pageNum, y, text, h.reason, currentHeading);
      } else {
        const parts = text
          .split(/(?<=[.?!])\s+(?=[A-Z])/)
          .map(norm)
          .filter(Boolean);
        for (let j = 0; j < parts.length; j++) {
          const s = parts[j];
          const y = idx * 100 + j;
          emitSentence(pageNum, y, s, currentHeading);
        }
      }
    });
    logDebug(`>>> getTextAnchors OUTPUT (DOCX): count=${anchors.length}`);
    const clauseBlocks = groupByRoleHint(anchors);
    logClauseBlocks(clauseBlocks, "DOCX");
    return clauseBlocks;
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
        const words = line.split(/\s+/);
        const looksSentence =
          /[.?!]/.test(line) ||
          /\b(is|are|was|were|shall|will|includes?|pertains?|constitutes|agrees?|licensed?|executed)\b/i.test(line) ||
          /[$]\s*\d|USD|\b\d{4}\b/.test(line) ||
          words.length > 12 ||
          line.length > 80;

        const shouldDowngrade =
          h.is && h.reason !== "keyword" && h.reason !== "fallbackAllCapsShort" && looksSentence;
        const wasHeading = h.is && !shouldDowngrade;

        const inSignatureSection =
          currentHeading &&
          CONTRACT_KEYWORDS.headings.byField.signatures
            .map(normalizeHeading)
            .includes(normalizeHeading(currentHeading));

        if (wasHeading) {
          if (inSignatureSection && h.reason === "fallbackTitleCaseShort") {
            emitSentence(1, idx, line, currentHeading);
            if (TRACE) logDebug("terminal.emitLine.FALLBACK", { heading: currentHeading, text: line });
            return;
          }
          currentHeading = line;
          emitHeading(1, idx, line, h.reason, currentHeading);
        } else {
          const parts = line
            .split(/(?<=[.?!])\s+(?=[A-Z])/)
            .map(norm)
            .filter(Boolean);
          if (parts.length === 0) {
            emitSentence(1, idx, line, currentHeading);
          } else {
            for (let j = 0; j < parts.length; j++) {
              const s = parts[j];
              emitSentence(1, idx + j, s, currentHeading);
            }
          }
        }
      });
    logDebug(`>>> getTextAnchors OUTPUT (Fallback): count=${anchors.length}`);
    const clauseBlocks = groupByRoleHint(anchors);
    logClauseBlocks(clauseBlocks, "Fallback");
    return clauseBlocks;
  }

  // Default return if no branch matched
  const clauseBlocks = groupByRoleHint(anchors);
  logClauseBlocks(clauseBlocks, "Default");
  return clauseBlocks;
}
