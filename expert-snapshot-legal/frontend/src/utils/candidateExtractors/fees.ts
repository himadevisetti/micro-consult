// src/utils/candidateExtractors/fees.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { normalizeHeading, normalizeBySchema } from "../normalizeValue.js";
import { headingMatches } from "../headingMatches.js";

export function extractFees(blocks: ClauseBlock[]): Candidate[] {
  const candidates: Candidate[] = [];
  const amountRegex = /\$\s?\d[\d,]*(?:\.\d{2})?/g;

  const FEES_HEADINGS = CONTRACT_KEYWORDS.headings.byField.fees.map(normalizeHeading);

  const block = blocks.find(b => b.roleHint && headingMatches(b.roleHint, FEES_HEADINGS));
  if (!block) {
    logDebug(">>> fees.notEmitted", { reason: "No Fees heading found" });
    return candidates;
  }

  logDebug(">>> fees.sectionFound", {
    heading: block.heading,
    roleHint: block.roleHint,
    page: block.pageNumber,
    y: block.yPosition,
    sourcePreview: block.body.slice(0, 120),
  });

  // --- Fee Structure ---
  const text = block.body.toLowerCase();
  for (const [norm, keywords] of Object.entries(CONTRACT_KEYWORDS.amounts.feeStructure)) {
    const matchKeyword = keywords.find(k => text.includes(k.toLowerCase()));
    if (!matchKeyword) continue;

    const regex = new RegExp(`\\b${matchKeyword}\\b`, "i");
    const rawMatch = block.body.match(regex)?.[0] ?? matchKeyword;

    candidates.push({
      rawValue: rawMatch,
      schemaField: "feeStructure",
      candidates: ["feeStructure"],
      normalized: normalizeBySchema(rawMatch, "feeStructure"),
      pageNumber: block.pageNumber,
      yPosition: block.yPosition,
      roleHint: block.roleHint,
      sourceText: block.body, // full clause body
      blockIdx: block.idx,    // 🔹 attach owning block
    });

    logDebug(">>> fee.structureDetected", {
      norm,
      rawMatch,
      page: block.pageNumber,
      y: block.yPosition,
      sourcePreview: block.body.slice(0, 120),
    });
    break; // usually only one structure per clause
  }

  // --- Amounts ---
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
        sourceText: block.body, // full clause body
        blockIdx: block.idx,    // 🔹 attach owning block
      });

      logDebug(">>> fee.amountDetected", {
        raw,
        schemaField,
        options,
        page: block.pageNumber,
        y: block.yPosition,
        sourcePreview: block.body.slice(0, 120),
      });
    }
  }

  return candidates;
}
