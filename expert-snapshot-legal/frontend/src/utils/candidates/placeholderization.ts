// src/utils/candidates/placeholderization.ts
import { Candidate } from "../../types/Candidate";
import { placeholderizeDocx } from "./docxPlaceholderization.js";
import { placeholderizePdf } from "./pdfPlaceholderization.js";

export async function placeholderizeDocument(
  buffer: Buffer,
  candidates: Candidate[],
  ext: string
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates?: Candidate[] }> {
  if (ext.toLowerCase() === "pdf") {
    return placeholderizePdf(buffer, candidates);
  }
  return placeholderizeDocx(buffer, candidates);
}
