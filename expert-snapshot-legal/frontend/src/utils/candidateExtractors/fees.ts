import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeBySchema, normalizeHeading } from "../normalizeValue.js";
import { logDebug } from "../logger.js";

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

  // Find the start of the Fees section
  const startIdx = anchors.findIndex(a =>
    FEES_HEADINGS.includes(normalizeHeading(a.text))
  );
  if (startIdx === -1) {
    return candidates; // no Fees section found
  }

  // Find the end (next heading after Fees)
  let endIdx = anchors.length;
  for (let i = startIdx + 1; i < anchors.length; i++) {
    const norm = normalizeHeading(anchors[i].text);
    if (
      Object.values(CONTRACT_KEYWORDS.headings.byField)
        .flat()
        .map(normalizeHeading)
        .includes(norm)
    ) {
      endIdx = i;
      break;
    }
  }

  // Collect body anchors between start and end
  const bodyAnchors = anchors.slice(startIdx + 1, endIdx);

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
          roleHint: anchor.roleHint, // ✅ propagate from getTextAnchors
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
