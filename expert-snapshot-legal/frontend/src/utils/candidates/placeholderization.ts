// src/utils/candidates/placeholderization.ts
import { Candidate } from "../../types/Candidate";
import type { ClauseBlock } from "../../types/ClauseBlock";  // canonical type
import { placeholderizeDocx } from "./docxPlaceholderization.js";
import { placeholderizePdf } from "./pdfPlaceholderization.js";

export async function placeholderizeDocument(
  buffer: Buffer,
  candidates: Candidate[],
  ext: string,
  clauseBlocks?: ClauseBlock[]
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates?: Candidate[] }> {
  if (ext.toLowerCase() === "pdf") {
    return placeholderizePdf(buffer, candidates);
  }
  // For DOCX, forward clauseBlocks (default to [] if not provided)
  return placeholderizeDocx(buffer, candidates, clauseBlocks ?? []);
}
