import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

export function extractGoverningLaw(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  for (const anchor of anchors) {
    const lower = anchor.text.toLowerCase();
    if (CONTRACT_KEYWORDS.governingLaw.cues.some(k => lower.includes(k))) {
      const match = anchor.text.match(/laws of\s+([A-Za-z\s]+)/i);
      if (match) {
        candidates.push({
          rawValue: match[1].trim(),
          schemaField: "governingLaw",
          candidates: ["governingLaw"],
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
        });
        logDebug(">>> Governing law detected:", { governingLaw: match[1].trim() });
      }
    }
  }

  return candidates;
}

