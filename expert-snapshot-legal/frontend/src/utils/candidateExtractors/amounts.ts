// src/utils/candidateExtractors/amounts.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading } from "../normalizeValue.js";

export function extractAmounts(blocks: ClauseBlock[]): Candidate[] {
  const candidates: Candidate[] = [];
  const amountRegex = /\$\s?\d[\d,]*(?:\.\d{2})?/g;

  // Normalized heading list for Fees
  const FEES_HEADINGS = CONTRACT_KEYWORDS.headings.byField.fees.map(normalizeHeading);

  // Find the Fees block
  const block = blocks.find(
    b => b.roleHint && FEES_HEADINGS.includes(normalizeHeading(b.roleHint))
  );
  if (!block) {
    logDebug(">>> amounts.notEmitted", { reason: "No Fees heading found" });
    return candidates;
  }

  logDebug(">>> amounts.sectionFound", {
    heading: block.heading,
    roleHint: block.roleHint,
    page: block.pageNumber,
    y: block.yPosition,
  });

  const lines = block.body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const curr = lines[i];
    const prev = lines[i - 1] ?? "";
    const next = lines[i + 1] ?? "";

    const currLower = curr.toLowerCase();
    const prevLower = prev.toLowerCase();
    const nextLower = next.toLowerCase();

    let m: RegExpExecArray | null;
    while ((m = amountRegex.exec(curr)) !== null) {
      const raw = m[0];

      const hasFeeCue = CONTRACT_KEYWORDS.amounts.feeContext.some(
        k => currLower.includes(k) || prevLower.includes(k) || nextLower.includes(k)
      );
      const hasRetainerCue = ["retainer", "deposit", "advance"].some(
        k => currLower.includes(k) || prevLower.includes(k) || nextLower.includes(k)
      );

      let schemaField: "feeAmount" | "retainerAmount" | null = null;
      let options: string[] = [];

      if (hasFeeCue && !hasRetainerCue) {
        schemaField = "feeAmount";
        options = ["feeAmount"];
      } else if (hasRetainerCue && !hasFeeCue) {
        schemaField = "retainerAmount";
        options = ["retainerAmount"];
      } else {
        schemaField = null;
        options = ["feeAmount", "retainerAmount"];
      }

      candidates.push({
        rawValue: raw,
        schemaField,
        candidates: options,
        pageNumber: block.pageNumber,
        yPosition: block.yPosition,
        roleHint: block.roleHint,
        sourceText: curr,
      });

      logDebug(">>> amount.detected", {
        raw,
        schemaField,
        options,
        page: block.pageNumber,
        y: block.yPosition,
        sourcePreview: curr.slice(0, 80),
      });
    }
  }

  return candidates;
}
