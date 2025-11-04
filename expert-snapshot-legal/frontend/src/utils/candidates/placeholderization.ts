// src/utils/candidates/placeholderization.ts
import { Candidate } from "../../types/Candidate";
import type { ClauseBlock } from "../../types/ClauseBlock";  // canonical type
import { placeholderizeDocx } from "./docxPlaceholderization.js";
import { placeholderizePdf } from "./pdfPlaceholderization.js";

export async function placeholderizeDocument(
  buffer: Buffer,
  candidates: Candidate[],
  ext: string,
  clauseBlocks: ClauseBlock[] = [],
  seedFilePath?: string
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates?: Candidate[] }> {
  if (ext.toLowerCase() === "pdf") {
    // For PDFs, we don’t use the raw buffer directly.
    // Instead, pass the seedFilePath into placeholderizePdf()
    if (!seedFilePath) {
      throw new Error("PDF placeholderization requires seedFilePath");
    }
    return placeholderizePdf(seedFilePath, candidates, clauseBlocks);
  }

  // For DOCX, continue as before
  return placeholderizeDocx(buffer, candidates, clauseBlocks);
}

