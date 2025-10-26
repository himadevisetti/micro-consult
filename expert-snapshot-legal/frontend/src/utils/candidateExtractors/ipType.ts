// src/utils/candidateExtractors/ipType.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { normalizeHeading } from "../normalizeValue.js";
import { headingMatches } from "../headingMatches.js";
import { escapeRegExp } from "../escapeRegExp.js";
import { logDebug } from "../logger.js";

export function extractIPType(blocks: ClauseBlock[]): Candidate[] {
  const IPTYPE_HEADINGS =
    CONTRACT_KEYWORDS.headings.byField.ipValidity?.map(normalizeHeading) ?? [];
  const candidates: Candidate[] = [];

  // Find the IP Validity block
  const block = blocks.find(
    b => b.roleHint && headingMatches(b.roleHint, IPTYPE_HEADINGS)
  );
  if (!block) {
    logDebug(">>> ipType.notEmitted", { reason: "No IP Validity heading found" });
    return candidates;
  }

  logDebug(">>> ipType.sectionFound", {
    heading: block.heading,
    roleHint: block.roleHint,
    page: block.pageNumber,
    y: block.yPosition,
    sourcePreview: block.body.slice(0, 120),
  });

  const lines = block.body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    const cue = CONTRACT_KEYWORDS.ip.typeCues.find(k => lower.includes(k));
    if (cue) {
      // Preserve original casing by extracting substring from line
      const regex = new RegExp(`\\b${escapeRegExp(cue)}\\b`, "i");
      const match = regex.exec(line);
      const raw = match ? match[0] : cue;

      candidates.push({
        rawValue: raw,
        schemaField: "ipType",
        candidates: ["ipType"],
        pageNumber: block.pageNumber,
        yPosition: block.yPosition,
        roleHint: block.roleHint,
        sourceText: block.body, // full clause body
        blockIdx: block.idx,    // 🔹 attach owning block
      });

      logDebug(">>> ip.ipTypeDetected", {
        cue,
        rawValue: raw,
        page: block.pageNumber,
        y: block.yPosition,
        roleHint: block.roleHint,
        sourcePreview: block.body.slice(0, 120),
        detectedFrom: "ipValidity",
      });
    }
  }

  return candidates;
}
