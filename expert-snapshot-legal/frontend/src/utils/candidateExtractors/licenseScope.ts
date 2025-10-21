import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../normalizeValue.js";
import { collectSectionBody } from "../sectionUtils.js";
import { escapeRegExp } from "../escapeRegExp.js";
import { logDebug } from "../logger.js";

export function extractLicenseScope(anchors: TextAnchor[]): Candidate[] {
  const LICENSE_HEADINGS =
    CONTRACT_KEYWORDS.headings.byField.licenseTerms?.map(normalizeHeading) ?? [];
  const licSection = collectSectionBody(anchors, LICENSE_HEADINGS);
  const candidates: Candidate[] = [];

  if (licSection) {
    logDebug(">>> licenseScope.sectionFound", {
      startIdx: licSection.startIdx,
      bodyCount: licSection.bodyAnchors.length,
    });

    for (const anchor of licSection.bodyAnchors) {
      const lower = anchor.text.toLowerCase();
      const cue = CONTRACT_KEYWORDS.ip.licenseScopeCues.find(k =>
        lower.includes(k)
      );
      if (cue) {
        // Preserve original casing by extracting substring from anchor.text
        const regex = new RegExp(`\\b${escapeRegExp(cue)}\\b`, "i");
        const match = regex.exec(anchor.text);
        const raw = match ? match[0] : cue;

        candidates.push({
          rawValue: raw,
          schemaField: "licenseScope",
          candidates: ["licenseScope"],
          pageNumber: anchor.page,
          yPosition: anchor.y,
          roleHint: anchor.roleHint,
          sourceText: anchor.text,
        });

        logDebug(">>> ip.licenseScopeDetected", {
          cue,
          rawValue: raw,
          page: anchor.page,
          y: anchor.y,
          sourcePreview: anchor.text.slice(0, 80),
          detectedFrom: "licenseTerms",
        });
      }
    }
  }

  return candidates;
}
