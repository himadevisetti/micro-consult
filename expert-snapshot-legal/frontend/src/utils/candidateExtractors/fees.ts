import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeBySchema, normalizeHeading } from "../normalizeValue.js";
import { logDebug } from "../logger.js";
import { collectSectionBody } from "../sectionUtils.js";

/**
 * Fee Structure extraction:
 * - Scoped to the "Fees" section (between Fees heading and next heading)
 * - Extracts structure keywords like flat, hourly, monthly, contingency
 * - Normalizes values via normalizeBySchema
 */
export function extractFeeStructure(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading list for Fees
  const FEES_HEADINGS = CONTRACT_KEYWORDS.headings.byField.fees.map(normalizeHeading);

  // Use helper to collect section body
  const section = collectSectionBody(anchors, FEES_HEADINGS);
  if (!section) return candidates;

  const { bodyAnchors } = section;

  for (const anchor of bodyAnchors) {
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
          normalized: normalizeBySchema(rawMatch, "feeStructure"),
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
          sourceText: anchor.text,
        });

        logDebug(">>> feeStructure.detected", {
          norm,
          rawMatch,
          page: anchor.page,
          y: anchor.y,
          sourcePreview: anchor.text.slice(0, 80),
        });
        break; // stop after first match in this anchor
      }
    }
  }

  return candidates;
}
