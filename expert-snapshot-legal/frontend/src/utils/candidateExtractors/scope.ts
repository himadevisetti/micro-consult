import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { normalizeHeading } from "../normalizeValue.js";
import { CONTRACT_KEYWORDS } from "../../constants/contractKeywords.js";
import { logDebug } from "../logger.js";
import { collectSectionBody } from "../sectionUtils.js";

function firstSentence(text: string): string {
  return text.match(/[^.?!]+[.?!]/)?.[0]?.trim() ?? text;
}

export function extractScope(anchors: TextAnchor[]): Candidate[] {
  const candidates: Candidate[] = [];

  // Normalized heading variants for scope
  const SCOPE_HEADINGS = CONTRACT_KEYWORDS.headings.byField.scope.map(normalizeHeading);

  // Use helper to collect section body
  const section = collectSectionBody(anchors, SCOPE_HEADINGS);
  if (!section) {
    logDebug(">>> scope.notEmitted", { reason: "No scope heading found" });
    return candidates;
  }

  const { bodyAnchors } = section;

  if (bodyAnchors.length > 0) {
    // Concatenate for full display (UI expands to this)
    const fullScope = bodyAnchors
      .map(a => a.text.trim())
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    // Always placeholderize the first anchor of the block
    const firstAnchor = bodyAnchors[0];
    const matchText = firstAnchor.text.trim();

    // Preview is the first sentence of the full block
    const preview = firstSentence(fullScope);

    candidates.push({
      rawValue: matchText,
      displayValue: preview,
      schemaField: "scope",
      candidates: ["scope"],
      pageNumber: firstAnchor.page,
      yPosition: firstAnchor.y,
      roleHint: firstAnchor.roleHint,
      sourceText: fullScope,
      isExpandable: fullScope.length > preview.length,
    });

    logDebug(">>> scope.detected", {
      previewLength: preview.length,
      fullLength: fullScope.length,
      isExpandable: fullScope.length > preview.length,
      page: firstAnchor.page,
      y: firstAnchor.y,
      roleHint: firstAnchor.roleHint,
      preview,
      rawValue: matchText,
      sourcePreview: fullScope,
    });
  } else {
    logDebug(">>> scope.notEmitted", { reason: "No body text found after heading" });
  }

  return candidates;
}
