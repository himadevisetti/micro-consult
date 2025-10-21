import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../normalizeValue.js";
import { collectSectionBody } from "../sectionUtils.js";
import { escapeRegExp } from "../escapeRegExp.js";
import { logDebug } from "../logger.js";

export function extractIPType(anchors: TextAnchor[]): Candidate[] {
  const IPTYPE_HEADINGS =
    CONTRACT_KEYWORDS.headings.byField.ipValidity?.map(normalizeHeading) ?? [];
  const ipSection = collectSectionBody(anchors, IPTYPE_HEADINGS);
  const candidates: Candidate[] = [];

  if (ipSection) {
    logDebug(">>> ipType.sectionFound", {
      startIdx: ipSection.startIdx,
      bodyCount: ipSection.bodyAnchors.length,
    });

    for (const anchor of ipSection.bodyAnchors) {
      const lower = anchor.text.toLowerCase();
      const cue = CONTRACT_KEYWORDS.ip.typeCues.find(k =>
        lower.includes(k)
      );
      if (cue) {
        // Preserve original casing by extracting substring from anchor.text
        const regex = new RegExp(`\\b${escapeRegExp(cue)}\\b`, "i");
        const match = regex.exec(anchor.text);
        const raw = match ? match[0] : cue;

        candidates.push({
          rawValue: raw,
          schemaField: "ipType",
          candidates: ["ipType"],
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
          sourceText: anchor.text,
        });

        logDebug(">>> ip.ipTypeDetected", {
          cue,
          rawValue: raw,
          page: anchor.page,
          y: anchor.y,
          sourcePreview: anchor.text.slice(0, 80),
          detectedFrom: "ipValidity",
        });
      }
    }
  }

  return candidates;
}
