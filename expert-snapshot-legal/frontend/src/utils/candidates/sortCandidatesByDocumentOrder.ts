import { Candidate } from "../../types/Candidate";

/**
 * Sort candidates by document order using pageNumber + yPosition,
 * with optional docIndex as a tie-breaker.
 */
export function sortCandidatesByDocumentOrder(cands: Candidate[]): Candidate[] {
  return [...cands].sort((a, b) => {
    // --- Handle pageNumber undefined cases ---
    if (a.pageNumber == null && b.pageNumber == null) return 0;
    if (a.pageNumber == null) return 1; // unanchored goes last
    if (b.pageNumber == null) return -1;

    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber;
    }

    // --- Optional docIndex tie-breaker ---
    if ((a as any).docIndex != null && (b as any).docIndex != null) {
      return (a as any).docIndex - (b as any).docIndex;
    }

    // --- Handle yPosition undefined cases ---
    if (a.yPosition == null && b.yPosition == null) return 0;
    if (a.yPosition == null) return 1;
    if (b.yPosition == null) return -1;

    return a.yPosition - b.yPosition;
  });
}
