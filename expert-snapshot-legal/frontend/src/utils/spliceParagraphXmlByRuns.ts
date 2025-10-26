import { Candidate } from "../types/Candidate";

/**
 * Escape regex metacharacters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a regex for a candidate rawValue.
 * - If the value is purely alphanumeric, wrap with \b boundaries.
 * - Otherwise, just match the escaped string literally.
 */
function buildTokenRegex(rawValue: string): RegExp {
  const escaped = escapeRegex(rawValue);
  const isWord = /^[A-Za-z0-9]+$/.test(rawValue);
  return new RegExp(isWord ? `\\b${escaped}\\b` : escaped, "g");
}

/**
 * Replace candidate rawValues with [[schemaField]] inside <w:t> runs.
 * - Only applies candidates whose blockIdx matches the current clauseIdx
 * - Works run-by-run, so formatting splits (quotes, italics) don't break it
 * - No hardcoded schema names; uses whatever schemaField is already set
 */
export function spliceParagraphXmlByRuns(
  originalXml: string,
  candidates: Candidate[],
  clauseIdx: number
): string {
  if (!originalXml || candidates.length === 0) return originalXml;

  // Scope candidates to this clause
  const scoped = candidates.filter(c => c.blockIdx === clauseIdx);

  const runRegex = /(<w:t[^>]*>)([\s\S]*?)(<\/w:t>)/g;
  let updatedXml = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = runRegex.exec(originalXml)) !== null) {
    const [full, openTag, runText, closeTag] = match;
    const before = originalXml.slice(lastIndex, match.index);
    let newRunText = runText;

    for (const c of scoped) {
      if (!c.rawValue || !c.schemaField) continue;
      const tokenRegex = buildTokenRegex(c.rawValue);
      newRunText = newRunText.replace(tokenRegex, `[[${c.schemaField}]]`);
    }

    updatedXml += before + openTag + newRunText + closeTag;
    lastIndex = match.index + full.length;
  }

  if (lastIndex < originalXml.length) {
    updatedXml += originalXml.slice(lastIndex);
  }

  return updatedXml;
}
