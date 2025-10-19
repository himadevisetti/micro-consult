// src/utils/docxPlaceholderization.ts
//
// Placeholderization logic for DOCX templates.
// - Iterates over extracted Candidates
// - Builds [[placeholders]] based on schemaField
// - Replaces matching text in document.xml with placeholders
//
// Notes:
// - Clause-type fields (isExpandable === true) use sourceText (full block) as match target
// - Short fields use rawValue (exact snippet)
// - Normalization encodes XML entities (& -> &amp;) so matches align with DOCX XML

import JSZip from "jszip";
import { Candidate } from "../../types/Candidate";
import { logDebug } from "../logger.js";
import {
  PLACEHOLDER_KEYWORDS,
  PLACEHOLDER_REGEX
} from "../../constants/contractKeywords.js";

const TRACE = process.env.DEBUG_TRACE === "true";

export async function placeholderizeDocx(
  buffer: Buffer,
  candidates: Candidate[]
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates: Candidate[] }> {
  const zip = await JSZip.loadAsync(buffer);
  const docXmlPath = "word/document.xml";
  const fileEntry = zip.file(docXmlPath);
  if (!fileEntry) throw new Error("DOCX missing document.xml");

  let docXml: string = await fileEntry.async("string");

  const enrichedCandidates = candidates.map((c) => {
    let placeholder: string | undefined;

    if (c.schemaField) {
      const digits = (c.schemaField.match(/\d+$/) || [])[0] ?? "";
      const base = c.schemaField.replace(/\d+$/, "").toLowerCase();
      const keyword = PLACEHOLDER_KEYWORDS[base]; // dictionary value is camelCase

      // Clause-type fields (scope, etc.) are marked isExpandable
      const isClause = c.isExpandable === true;
      const candidateText = isClause ? c.sourceText : c.rawValue;

      if (keyword) {
        // Build camelCase placeholder, append digits if present
        const tag = digits ? `${keyword}${digits}` : keyword;
        placeholder = `[[${tag}]]`;

        /**
         * Replacement target selection:
         * - Clause-type fields (isExpandable === true): use sourceText (full block).
         * - Short fields: use rawValue (exact snippet found in DOCX).
         *
         * Notes:
         * - sourceText exists for all candidates as section anchoring context,
         *   but it should only be used to replace when the candidate represents
         *   a multi-sentence clause (isExpandable true).
         * - We never match text that already contains a placeholder.
         */
        const isClauseInner = c.isExpandable === true;
        const candidateTextInner = isClauseInner ? c.sourceText : c.rawValue;

        if (candidateTextInner && !PLACEHOLDER_REGEX.test(candidateTextInner)) {
          // Normalize for XML entity encoding (& -> &amp;, etc.)
          const normalizedMatch = normalizeForXmlMatch(candidateTextInner);
          const safeMatch = escapeRegExp(normalizedMatch);

          // Scoped replacement:
          // - Parties: replace once within the anchor text (avoid touching other sections).
          // - Others: replace globally within the section (still scoped if sourceText is present).
          if (c.roleHint === "Parties") {
            docXml = replaceScopedOnce(
              docXml,
              safeMatch,
              placeholder,
              c.sourceText
            );
          } else {
            docXml = replaceScopedGlobal(
              docXml,
              safeMatch,
              placeholder,
              c.sourceText
            );
          }

          if (TRACE) {
            logDebug("placeholderizeDocx.replace", {
              field: c.schemaField,
              strategy: isClauseInner ? "sourceText" : "rawValue",
              usedLength: candidateTextInner.length,
            });
          }
        }
      }
    }
    return { ...c, placeholder };
  });

  zip.file(docXmlPath, docXml);
  const placeholderBuffer = await zip.generateAsync({ type: "nodebuffer" });

  const placeholders = enrichedCandidates
    .filter((c) => c.placeholder)
    .map((c) => ({ field: c.schemaField, placeholder: c.placeholder }));

  if (TRACE) {
    logDebug(">>> placeholderizeDocx.done (detailed)", {
      candidateCount: enrichedCandidates.length,
      placeholders,
    });
  } else {
    logDebug(
      `>>> placeholderizeDocx.done: candidates=${enrichedCandidates.length}, placeholders=${placeholders.length}`
    );
  }

  return { placeholderBuffer, enrichedCandidates };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalize candidate text for XML matching:
 * - Collapse whitespace
 * - Encode XML entities (&, <, >, quotes)
 */
function normalizeForXmlMatch(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Replace exactly once within an optional scoped sourceText block (if provided).
 * If scope is provided, we first try to limit replacement within that block
 * to avoid over-matching elsewhere.
 */
function replaceScopedOnce(
  docXml: string,
  safeMatch: string,
  placeholder: string,
  sourceText?: string
) {
  const oneValueRegex = new RegExp(safeMatch, "m");
  if (sourceText) {
    const safeScope = escapeRegExp(normalizeForXmlMatch(sourceText));
    const scopeRegex = new RegExp(safeScope, "m");
    const scopeMatch = docXml.match(scopeRegex);
    if (scopeMatch) {
      const scopeText = scopeMatch[0];
      const replacedScope = scopeText.replace(oneValueRegex, placeholder);
      return docXml.replace(scopeRegex, replacedScope);
    }
  }
  return docXml.replace(oneValueRegex, placeholder);
}

/**
 * Replace all occurrences within an optional scoped sourceText block (if provided).
 * This is used for non-Parties fields where multiple instances may appear.
 */
function replaceScopedGlobal(
  docXml: string,
  safeMatch: string,
  placeholder: string,
  sourceText?: string
) {
  const valueRegex = new RegExp(safeMatch, "gm");
  if (sourceText) {
    const safeScope = escapeRegExp(normalizeForXmlMatch(sourceText));
    const scopeRegex = new RegExp(safeScope, "m");
    const scopeMatch = docXml.match(scopeRegex);
    if (scopeMatch) {
      const scopeText = scopeMatch[0];
      const replacedScope = scopeText.replace(valueRegex, placeholder);
      return docXml.replace(scopeRegex, replacedScope);
    }
  }
  return docXml.replace(valueRegex, placeholder);
}
