// src/utils/getAnchorPosition.ts

/**
 * Returns a representative position for a span/candidate.
 * - Prefers polygon (PDF/image) if available
 * - Falls back to yPosition (DOCX/fallback)
 */
export function getAnchorPosition(span: {
  yPosition?: number;
  polygon?: { x: number; y: number }[] | number[];
}): { y: number; polygon?: { x: number; y: number }[] } {
  if (span?.polygon) {
    // normalize polygon into {x,y}[]
    if (Array.isArray(span.polygon) && typeof span.polygon[0] === "number") {
      const nums = span.polygon as number[];
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < nums.length; i += 2) {
        points.push({ x: nums[i], y: nums[i + 1] });
      }
      return { y: Math.min(...points.map(p => p.y)), polygon: points };
    }
    const points = span.polygon as { x: number; y: number }[];
    return { y: Math.min(...points.map(p => p.y)), polygon: points };
  }

  return { y: span?.yPosition ?? 0 };
}

