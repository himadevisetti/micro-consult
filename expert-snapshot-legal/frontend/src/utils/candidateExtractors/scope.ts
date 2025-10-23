// src/utils/candidateExtractors/scope.ts

import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { normalizeHeading } from "../normalizeValue.js";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";

function firstSentence(text: string): string {
  return text.match(/[^.?!]+[.?!]/)?.[0]?.trim() ?? text;
}

export function extractScope(blocks: ClauseBlock[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading variants for scope
  const SCOPE_HEADINGS = CONTRACT_KEYWORDS.headings.byField.scope.map(normalizeHeading);

  // Find the Scope block
  const block = blocks.find(
    b => b.roleHint && SCOPE_HEADINGS.includes(normalizeHeading(b.roleHint))
  );
  if (!block) {
    logDebug(">>> scope.notEmitted", { reason: "No scope heading found" });
    return candidates;
  }

  const fullScope = block.body
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (fullScope.length > 0) {
    // Preview is the first sentence of the full block
    const preview = firstSentence(fullScope);

    candidates.push({
      rawValue: fullScope, // use full text as rawValue
      displayValue: preview,
      schemaField: "scope",
      candidates: ["scope"],
      pageNumber: block.pageNumber,
      yPosition: block.yPosition,
      roleHint: block.roleHint,
      sourceText: fullScope,
      isExpandable: fullScope.length > preview.length,
    });

    logDebug(">>> scope.detected", {
      previewLength: preview.length,
      fullLength: fullScope.length,
      isExpandable: fullScope.length > preview.length,
      page: block.pageNumber,
      y: block.yPosition,
      roleHint: block.roleHint,
      preview,
      rawValue: fullScope.slice(0, 80),
      sourcePreview: fullScope,
    });
  } else {
    logDebug(">>> scope.notEmitted", { reason: "No body text found in block" });
  }

  return candidates;
}
