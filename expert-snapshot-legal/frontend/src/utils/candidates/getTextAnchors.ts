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

  const emitHeading = (
    pageNum: number,
    y: number,
    text: string,
    reason: string,
    currentHeading: string | undefined,
    offset?: number,
    length?: number
  ) => {
    anchors.push({
      text,
      page: pageNum,
      y,
      roleHint: text,
      wasHeading: true,
      offset,
      length,
    });
    if (TRACE) {
      logDebug(
        `EMIT heading: page=${pageNum} y=${y} wasHeading=true reason="${reason}" heading="${text}" offset=${offset} length=${length}`
      );
    }
  };

  const emitSentence = (
    pageNum: number,
    y: number,
    text: string,
    currentHeading: string | undefined,
    offset?: number,
    length?: number
  ) => {
    anchors.push({
      text,
      page: pageNum,
      y,
      roleHint: currentHeading,
      wasHeading: false,
      offset,
      length,
    });
    if (TRACE) {
      logDebug(
        `EMIT sentence: page=${pageNum} y=${y} roleHint="${currentHeading ?? ""}" text="${text}" offset=${offset} length=${length}`
      );
    }
  };

  // Case A: PDF/image
  if (readResult.pages?.some((p: any) => (p.lines ?? []).length > 0)) {
    logDebug(">>> getTextAnchors: PDF/image branch");

    // 🔹 Persist across pages
    let currentHeading: string | undefined;

    for (const page of readResult.pages) {
      let bufferText = "";
      let bufferStartY: number | undefined;
      let bufferOffset: number | undefined;
      let bufferLength: number | undefined;

      const flushBuffer = () => {
        if (!bufferText) return;
        const parts = bufferText.split(/(?<=[.?!])\s+(?=[A-Z])/).map(norm).filter(Boolean);
        for (let j = 0; j < parts.length; j++) {
          const s = parts[j];
          emitSentence(
            page.pageNumber,
            (bufferStartY ?? 0) + j,
            s,
            currentHeading,
            bufferOffset,
            bufferLength
          );
        }
        bufferText = "";
        bufferStartY = undefined;
        bufferOffset = undefined;
        bufferLength = undefined;
      };

      for (const [lineIdx, line] of (page.lines ?? []).entries()) {
        const content = norm(String(line.content ?? ""));
        if (!content) continue;

        const firstSpan = line.spans?.[0];
        const offset = firstSpan?.offset;
        const length = firstSpan?.length;

        const h = isHeading(content);
        const words = content.split(/\s+/);
        const looksSentence =
          /[.?!]/.test(content) ||
          /\b(is|are|was|were|shall|will|includes?|pertains?|constitutes|agrees?|licensed?|executed)\b/i.test(content) ||
          /[$]\s*\d|USD|\b\d{4}\b/.test(content) ||
          words.length > 12 ||
          content.length > 80;
        const shouldDowngrade =
          h.is && h.reason !== "keyword" && h.reason !== "fallbackAllCapsShort" && looksSentence;
        const wasHeading = h.is && !shouldDowngrade;

        const y = lineIdx;

        const inSignatureSection =
          currentHeading &&
          CONTRACT_KEYWORDS.headings.byField.signatures
            .map(normalizeHeading)
            .includes(normalizeHeading(currentHeading));

        if (wasHeading) {
          logDebug("PDF.headingCandidate", {
            text: content,
            reason: h.reason,
            currentHeading,
            inSignatureSection,
            wasHeading,
            page: page.pageNumber,
            y,
          });

          if (inSignatureSection && h.reason === "fallbackTitleCaseShort") {
            emitSentence(
              page.pageNumber,
              y,
              content,
              currentHeading,
              offset,
              length
            );
            if (TRACE) {
              logDebug("terminal.emitLine.PDF", {
                page: page.pageNumber,
                heading: currentHeading,
                text: content,
              });
            }
            continue;
          }

          flushBuffer();
          currentHeading = content;
          emitHeading(
            page.pageNumber,
            y,
            content,
            h.reason,
            currentHeading,
            offset,
            length
          );
          continue;
        }

        if (!bufferText) {
          bufferStartY = y;
          bufferOffset = offset;
          bufferLength = length;
        }
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

  // Case B: DOCX
  if (readResult.paragraphs?.length) {
    logDebug(">>> getTextAnchors: DOCX branch");
    let currentHeading: string | undefined;
    readResult.paragraphs.forEach((p: any, idx: number) => {
      const pageNum = p.boundingRegions?.[0]?.pageNumber ?? 1;
      const text = norm(String(p.content ?? ""));
      if (!text) return;

      const firstSpan = p.spans?.[0];
      const offset = firstSpan?.offset;
      const length = firstSpan?.length;

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
          emitSentence(pageNum, idx * 100, text, currentHeading, offset, length);
          if (TRACE) logDebug("terminal.emitLine.DOCX", { page: pageNum, heading: currentHeading, text });
          return;
        }
        currentHeading = text;
        const y = idx * 100;
        emitHeading(pageNum, y, text, h.reason, currentHeading, offset, length);
      } else {
        const parts = text
          .split(/(?<=[.?!])\s+(?=[A-Z])/)
          .map(norm)
          .filter(Boolean);
        for (let j = 0; j < parts.length; j++) {
          const s = parts[j];
          const y = idx * 100 + j;
          emitSentence(pageNum, y, s, currentHeading, offset, length);
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
            emitSentence(1, idx, line, currentHeading, undefined, undefined);
            if (TRACE) logDebug("terminal.emitLine.FALLBACK", { heading: currentHeading, text: line });
            return;
          }
          currentHeading = line;
          emitHeading(1, idx, line, h.reason, currentHeading, undefined, undefined);
        } else {
          const parts = line
            .split(/(?<=[.?!])\s+(?=[A-Z])/)
            .map(norm)
            .filter(Boolean);
          if (parts.length === 0) {
            emitSentence(1, idx, line, currentHeading, undefined, undefined);
          } else {
            for (let j = 0; j < parts.length; j++) {
              const s = parts[j];
              emitSentence(1, idx + j, s, currentHeading, undefined, undefined);
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
