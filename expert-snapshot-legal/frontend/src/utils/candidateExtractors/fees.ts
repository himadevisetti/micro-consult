// src/utils/candidateExtractors/fees.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeBySchema } from "../normalizeValue.js";
import { logDebug } from "../logger.js";

/**
 * Fee Structure extraction:
 * - Looks up the "Fees" ClauseBlock by roleHint
 * - Parses the whole block body to avoid split-line misses
 * - Extracts structure keywords like flat, hourly, monthly, contingency
 * - Normalizes values via normalizeBySchema
 */
export function extractFeeStructure(blocks: ClauseBlock[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Find the Fees block by roleHint
  const block = blocks.find(
    b => b.roleHint && b.roleHint.toLowerCase().includes("fee")
  );
  if (!block) return candidates;

  const text = block.body.toLowerCase();

  // Scan for fee structure keywords in block body
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
      sourceText: block.body,
    });

    logDebug(">>> feeStructure.detected", {
      norm,
      rawMatch,
      page: block.pageNumber,
      y: block.yPosition,
      sourcePreview: block.body,
      // sourcePreview: block.body.slice(0, 80),
    });

    // Single structure per section is typical; break after first positive
    break;
  }

  return candidates;
}
