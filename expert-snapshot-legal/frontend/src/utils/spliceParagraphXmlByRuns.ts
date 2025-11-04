// src/utils/spliceParagraphXmlByRuns.ts

import { Candidate } from "../types/Candidate";
import { buildTokenRegex } from "./buildTokenRegex.js";
import { logDebug } from "../utils/logger.js";

export function spliceParagraphXmlByRuns(
  originalXml: string,
  candidates: Candidate[],
  clauseIdx: number
): string {
  if (!originalXml || candidates.length === 0) return originalXml;

  const scoped = candidates.filter(c => c.blockIdx === clauseIdx);
  const runRegex = /(<w:t[^>]*>)([\s\S]*?)(<\/w:t>)/g;

  // Concatenate all run texts for full‑clause detection
  const runTexts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = runRegex.exec(originalXml)) !== null) {
    runTexts.push(m[2]); // inner text only
  }
  const concatenated = runTexts.join("");
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

  logDebug("splice.start", {
    clauseIdx,
    runCount: runTexts.length,
    candidateFields: scoped.map(c => c.schemaField),
  });

  // 🔹 Check for full‑clause replacement
  for (const c of scoped) {
    if (!c.rawValue || !c.schemaField) continue;
    if (
      normalize(concatenated) === normalize(c.rawValue) &&
      c.isExpandable &&
      c.sourceText
    ) {
      logDebug("splice.fullClauseReplace", { schemaField: c.schemaField });

      const firstRunIdx = originalXml.search(/<w:r[\s>]/);
      const lastRunCloseIdx = originalXml.lastIndexOf("</w:r>");
      const hasRuns = firstRunIdx !== -1 && lastRunCloseIdx !== -1;

      const prefix = hasRuns ? originalXml.slice(0, firstRunIdx) : originalXml;
      const suffix = hasRuns ? originalXml.slice(lastRunCloseIdx + "</w:r>".length) : "";

      const firstRunPrMatch = originalXml.match(/<w:rPr[\s\S]*?<\/w:rPr>/);
      const runPr = firstRunPrMatch ? firstRunPrMatch[0] : "";

      const placeholderRun = `<w:r>${runPr}<w:t xml:space="preserve">[[${c.schemaField}]]</w:t></w:r>`;
      return `${prefix}${placeholderRun}${suffix}`;
    }
  }

  // 🔹 Run‑by‑run replacement
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
      if (tokenRegex.test(newRunText)) {
        logDebug("splice.tokenReplace", {
          schemaField: c.schemaField,
          raw: c.rawValue,
          clauseIdx,
        });
        newRunText = newRunText.replace(tokenRegex, `[[${c.schemaField}]]`);
      }
    }

    updatedXml += before + openTag + newRunText + closeTag;
    lastIndex = match.index + full.length;
  }

  if (lastIndex < originalXml.length) {
    updatedXml += originalXml.slice(lastIndex);
  }

  logDebug("splice.runByRunComplete", { clauseIdx });
  return updatedXml;
}
