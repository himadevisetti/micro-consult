// src/utils/candidateExtractors/licenseScope.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../normalizeValue.js";
import { headingMatches } from "../headingMatches.js";
import { escapeRegExp } from "../escapeRegExp.js";
import { logDebug } from "../logger.js";

export function extractLicenseScope(blocks: ClauseBlock[]): Candidate[] {
  const LICENSE_HEADINGS =
    CONTRACT_KEYWORDS.headings.byField.licenseTerms?.map(normalizeHeading) ?? [];
  const candidates: Candidate[] = [];

  // Find the License Terms block
  const block = blocks.find(
    b => b.roleHint && headingMatches(b.roleHint, LICENSE_HEADINGS)
  );
  if (!block) return candidates;

  logDebug(">>> licenseScope.sectionFound", {
    heading: block.heading,
    roleHint: block.roleHint,
    page: block.pageNumber,
    y: block.yPosition,
  });

  const lines = block.body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    const cue = CONTRACT_KEYWORDS.ip.licenseScopeCues.find(k => lower.includes(k));
    if (cue) {
      // Preserve original casing by extracting substring from line
      const regex = new RegExp(`\\b${escapeRegExp(cue)}\\b`, "i");
      const match = regex.exec(line);
      const raw = match ? match[0] : cue;

      candidates.push({
        rawValue: raw,
        schemaField: "licenseScope",
        candidates: ["licenseScope"],
        pageNumber: block.pageNumber,
        yPosition: block.yPosition,
        roleHint: block.roleHint,
        sourceText: line,
      });

      logDebug(">>> ip.licenseScopeDetected", {
        cue,
        rawValue: raw,
        page: block.pageNumber,
        y: block.yPosition,
        sourcePreview: line.slice(0, 80),
        detectedFrom: "licenseTerms",
      });
    }
  }

  return candidates;
}
