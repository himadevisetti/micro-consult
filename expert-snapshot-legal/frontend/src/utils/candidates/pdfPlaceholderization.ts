// src/utils/pdfPlaceholderization.ts
import { Candidate } from "../../types/Candidate";

export async function placeholderizePdf(
  buffer: Buffer,
  candidates: Candidate[]
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates: Candidate[] }> {
  // TODO: implement real PDF placeholderization
  return { placeholderBuffer: buffer, enrichedCandidates: candidates };
}
