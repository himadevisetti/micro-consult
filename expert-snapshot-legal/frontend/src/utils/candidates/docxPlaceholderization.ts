// src/utils/docxPlaceholderization.ts

import JSZip from "jszip";
import { Candidate } from "../../types/Candidate";
import { logDebug, logWarn } from "../logger.js";
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
      const digits = (c.schemaField.match(/\d+$/) || [])[0];
      const base = c.schemaField.replace(/\d+$/, "").toLowerCase();
      const keyword = PLACEHOLDER_KEYWORDS[base];
      const matchText = c.rawValue;

      if (keyword) {
        placeholder = digits ? `{{${keyword}${digits}}}` : `{{${keyword}}}`;

        if (matchText && !PLACEHOLDER_REGEX.test(matchText)) {
          const normalizedMatch = matchText.trim().replace(/\s+/g, " ");
          const safeMatch = escapeRegExp(normalizedMatch);

          if (c.roleHint === "Parties") {
            docXml = replaceScopedOnce(docXml, safeMatch, placeholder, c.sourceText);
          } else {
            docXml = replaceScopedGlobal(docXml, safeMatch, placeholder, c.sourceText);
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

function replaceScopedOnce(
  docXml: string,
  safeMatch: string,
  placeholder: string,
  sourceText?: string
) {
  const oneValueRegex = new RegExp(safeMatch);
  if (sourceText) {
    const safeScope = escapeRegExp(sourceText.trim().replace(/\s+/g, " "));
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

function replaceScopedGlobal(
  docXml: string,
  safeMatch: string,
  placeholder: string,
  sourceText?: string
) {
  const valueRegex = new RegExp(safeMatch, "g");
  if (sourceText) {
    const safeScope = escapeRegExp(sourceText.trim().replace(/\s+/g, " "));
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
