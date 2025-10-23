// src/types/ClauseBlock.ts

export interface ClauseBlock {
  /** Clause heading (raw text as detected) */
  heading: string;

  /** Normalized role hint (used for schema mapping) */
  roleHint: string;

  /** Full clause body as a single string */
  body: string;

  /** Position of the clause start (for ordering) */
  pageNumber: number;
  yPosition: number;

  /** Geometry spans for PDF preview/highlighting */
  spans: Array<{
    text: string;
    pageNumber: number;
    yPosition: number;
    polygon?: number[] | { x: number; y: number }[];
  }>;
}
