// src/utils/sectionUtils.ts
import { TextAnchor } from "../types/TextAnchor";
import { normalizeHeading } from "./normalizeValue.js";
import { logDebug } from "./logger.js";

/**
 * Collect all anchors that were marked as headings.
 * Useful for debugging and for section-based extractors.
 */
export function collectHeadingAnchors(anchors: TextAnchor[]): TextAnchor[] {
  const headingAnchors = anchors.filter(a => a.wasHeading);
  logDebug(">>> heading.count", { total: headingAnchors.length });

  return headingAnchors;
}

/**
 * Collects the body anchors for a section starting at a heading.
 *
 * Uses heading-driven logic: only considers anchors marked with wasHeading.
 * Finds the first heading whose normalized text matches one of the keywords,
 * then slices until the next heading (or end of anchors).
 *
 * @param anchors - full list of anchors
 * @param headingKeywords - normalized keyword variants for the section
 * @returns start index and body anchors, or null if not found
 */
export function collectSectionBody(
  anchors: TextAnchor[],
  headingKeywords: string[]
): { startIdx: number; bodyAnchors: TextAnchor[] } | null {
  const normalizedKeywords = headingKeywords.map(normalizeHeading);

  // Get all heading anchors, but filter out the document title (page=1, y=0)
  const headingAnchors = collectHeadingAnchors(anchors).filter(
    h => !(h.page === 1 && h.y === 0)
  );

  // Find the first heading anchor that matches any keyword
  const matchedHeading = headingAnchors.find(h =>
    normalizedKeywords.some(k => normalizeHeading(h.text).includes(k))
  );
  if (!matchedHeading) return null;

  const startIdx = anchors.indexOf(matchedHeading);

  // Find the next heading anchor after this one
  const nextHeading = headingAnchors.find(
    h => h !== matchedHeading && h.y > matchedHeading.y
  );
  const endIdx = nextHeading ? anchors.indexOf(nextHeading) : anchors.length;

  // Debug log to confirm which heading was matched
  logDebug(">>> section.matchedHeading", {
    raw: matchedHeading.text,
    normalized: normalizeHeading(matchedHeading.text),
    page: matchedHeading.page,
    y: matchedHeading.y,
    startIdx,
    endIdx,
    bodyCount: endIdx - (startIdx + 1),
  });

  return {
    startIdx,
    bodyAnchors: anchors.slice(startIdx + 1, endIdx),
  };
}
