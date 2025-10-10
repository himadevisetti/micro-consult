import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { logDebug } from "../logger.js";

export function extractParties(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  for (const anchor of anchors) {
    const partyRegex = /between\s+(.+?)\s+and\s+([^.,]+)(?:[.,]|$)/i;
    const match = anchor.text.match(partyRegex);
    if (!match) continue;

    const clean = (s: string) =>
      s.replace(/\s*,?\s*effective as of.*$/i, "")
        .replace(/\s*,?\s*dated.*$/i, "")
        .trim();

    let partyA = clean(match[1]);
    let partyB = clean(match[2]);

    const labelRegex = /\(the\s+["“]?([A-Za-z]+)["”]?\)/i;
    const labelA = partyA.match(labelRegex)?.[1];
    const labelB = partyB.match(labelRegex)?.[1];

    partyA = partyA.replace(labelRegex, "").trim();
    partyB = partyB.replace(labelRegex, "").trim();

    if (partyA && partyB) {
      const baseRoleHint = anchor.roleHint ?? "Parties";

      if (labelA || labelB) {
        // Explicit labels → map directly
        candidates.push({
          rawValue: partyA,
          schemaField: "partyA",
          candidates: ["partyA"],
          roleHint: labelA || baseRoleHint,
          pageNumber: anchor.page,
          yPosition: anchor.y,
        });
        candidates.push({
          rawValue: partyB,
          schemaField: "partyB",
          candidates: ["partyB"],
          roleHint: labelB || baseRoleHint,
          pageNumber: anchor.page,
          yPosition: anchor.y,
        });
      } else {
        // No labels → ambiguous, force dropdown
        candidates.push({
          rawValue: partyA,
          schemaField: null,
          candidates: ["partyA", "partyB"],
          roleHint: baseRoleHint,
          pageNumber: anchor.page,
          yPosition: anchor.y,
        });
        candidates.push({
          rawValue: partyB,
          schemaField: null,
          candidates: ["partyA", "partyB"],
          roleHint: baseRoleHint,
          pageNumber: anchor.page,
          yPosition: anchor.y,
        });
      }

      candidates.slice(-2).forEach((c, i) => {
        logDebug("parties.emitted", {
          idx: i,
          schemaField: c.schemaField,
          candidates: c.candidates,
          rawValue: c.rawValue,
          page: c.pageNumber,
          y: c.yPosition,
          roleHint: c.roleHint,
        });
      });

      logDebug(">>> Parties detected:", { partyA, partyB, labelA, labelB });
      break;
    }
  }

  return candidates;
}
