// src/utils/candidates/docxPlaceholderization.ts
import JSZip from "jszip";
import { Candidate } from "../../types/Candidate";
import { ClauseBlock } from "../../types/ClauseBlock";
import { logDebug } from "../logger.js";
import { AugmentedClauseBlock } from "../../types/AugmentedClauseBlock";
import { spliceParagraphXmlByRuns } from "../spliceParagraphXmlByRuns.js";
import { track } from "../../../track.js";

const TRACE = process.env.DEBUG_TRACE === "true";

export async function placeholderizeDocx(
  buffer: Buffer,
  candidates: Candidate[],
  clauseBlocks: ClauseBlock[]
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates: Candidate[] }> {
  const zip = await JSZip.loadAsync(buffer);
  const docXmlPath = "word/document.xml";
  const fileEntry = zip.file(docXmlPath);
  if (!fileEntry) throw new Error("DOCX missing document.xml");

  let docXml: string = await fileEntry.async("string");
  docXml = docXml.replace(/\r?\n/g, " ");
  let paragraphs = docXml.split(/(?=<w:p)/);

  // Sample a few paragraphs for sanity
  if (TRACE) {
    paragraphs.slice(0, 5).forEach((p, i) => {
      const plain = p.replace(/<[^>]+>/g, "").trim();
      logDebug(">>> paragraph.sample", {
        index: i,
        plainTextPreview: plain.slice(0, 200),
      });
    });
  }

  // Build paragraph ranges
  const paragraphRanges: { index: number; start: number; end: number; plain: string }[] = [];
  for (let j = 0; j < paragraphs.length; j++) {
    const plain = paragraphs[j].replace(/<[^>]+>/g, "");
    const matchingSpan = clauseBlocks
      .flatMap(cb => cb.spans)
      .find(sp => sp.text && plain.includes(sp.text.slice(0, 40)));

    if (matchingSpan && matchingSpan.offset !== undefined) {
      const start = matchingSpan.offset;
      const end = start + (matchingSpan.length ?? plain.length);
      paragraphRanges.push({ index: j, start, end, plain });
    } else {
      paragraphRanges.push({ index: j, start: -1, end: -1, plain });
    }
  }

  // Normalize ClauseBlocks into augmented ones
  const augmentedBlocks: AugmentedClauseBlock[] = clauseBlocks.map((b, i) => {
    const paraIndices: number[] = [];
    for (const span of b.spans) {
      if (span.offset !== undefined) {
        const match = paragraphRanges.find(
          (r) => span.offset! >= r.start && span.offset! < r.end
        );
        if (match) paraIndices.push(match.index);
      }
    }
    const uniqueIndices = Array.from(new Set(paraIndices));
    return { ...b, idx: i, indices: uniqueIndices };
  });

  const enrichedCandidates: Candidate[] = [];

  // Sequential clause processing
  for (const block of augmentedBlocks) {
    const blockCandidates = candidates.filter(
      c => c.blockIdx !== undefined && c.blockIdx === block.idx
    );

    for (const paraIdx of block.indices ?? []) {
      const range = paragraphRanges.find(r => r.index === paraIdx);
      if (!range) continue;

      let slice = range.plain;

      // Log BEFORE replacement
      if (TRACE) {
        logDebug(">>> slice.before", {
          clauseIdx: block.idx,
          heading: block.heading,
          paraIndex: paraIdx,
          preview: slice,
          candidates: blockCandidates.map(c => ({
            field: c.schemaField,
            raw: c.rawValue,
          })),
        });
      }

      // Apply replacements (plain-text preview only)
      for (const cand of blockCandidates) {
        if (!cand.rawValue) continue;
        const regex = new RegExp(
          cand.rawValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "g"
        );
        slice = slice.replace(regex, `[[${cand.schemaField}]]`);
      }

      // Log AFTER replacement
      if (TRACE) {
        logDebug(">>> slice.after", {
          clauseIdx: block.idx,
          heading: block.heading,
          paraIndex: paraIdx,
          preview: slice,
        });
      }

      // Splice back into the paragraph XML
      const originalXml = paragraphs[paraIdx];
      const updatedXml = spliceParagraphXmlByRuns(originalXml, blockCandidates, block.idx);
      paragraphs[paraIdx] = updatedXml;
    }
  }

  // Finalize
  docXml = paragraphs.join("");
  zip.file(docXmlPath, docXml);
  const placeholderBuffer = await zip.generateAsync({ type: "nodebuffer" });

  // Track placeholderization telemetry
  await track("document_placeholderized", {
    format: "docx",
    candidateCount: enrichedCandidates.length,
    clauseBlockCount: augmentedBlocks.length,
  });

  if (TRACE) {
    logDebug(">>> placeholderizeDocx.summary", {
      candidateCount: enrichedCandidates.length,
      clauseBlocks: augmentedBlocks.length,
    });
  }

  return { placeholderBuffer, enrichedCandidates };
}
