import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeBySchema } from "../normalizeValue.js";
import { logDebug } from "../logger.js";

export function extractFeeStructure(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  for (const anchor of anchors) {
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
        });

        logDebug(">>> Fee structure detected:", { norm, rawMatch });
        break;
      }
    }
  }

  return candidates;
}

