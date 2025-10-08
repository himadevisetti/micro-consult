import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

export function extractInventors(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  for (const anchor of anchors) {
    const lower = anchor.text.toLowerCase();
    const cue = CONTRACT_KEYWORDS.parties.inventorCues.find(k =>
      lower.includes(k)
    );

    if (cue) {
      const match = anchor.text.match(
        /\b(?:created by|invented by|originated by|conceived by)\s+(.+)/i
      );

      if (match) {
        const inventors = match[1]
          .split(/,|and/i)
          .map(n => n.trim())
          .filter(Boolean);

        for (const inv of inventors) {
          candidates.push({
            rawValue: inv,
            schemaField: "inventor",
            candidates: ["inventor"],
            pageNumber: anchor.page,
            yPosition: anchor.y,
            roleHint: "Inventor",
          });
          logDebug(">>> Inventor detected:", { inv });
        }
      } else {
        candidates.push({
          rawValue: anchor.text.trim(),
          schemaField: "inventor",
          candidates: ["inventor"],
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: "Inventor",
        });
        logDebug(">>> Inventor line detected:", { text: anchor.text.trim() });
      }
    }
  }

  return candidates;
}

