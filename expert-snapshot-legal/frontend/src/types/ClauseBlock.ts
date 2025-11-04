// src/types/ClauseBlock.ts

export interface ClauseBlock {
  /** Index of the current ClauseBlock in the ClauseBlock array */
  idx: number;

  /** Clause heading (raw text as detected) */
  heading: string;

  /** Normalized role hint (used for schema mapping) */
  roleHint: string;

  /** Full clause body as a single string */
  body: string;

  /** Position of the clause start (for ordering) */
  pageNumber: number;
  yPosition: number;

  /** Text spans for PDF preview/highlighting */
  spans: Array<{
    text: string;
    pageNumber: number;
    yPosition: number;
    offset?: number;
    length?: number;
  }>;
}
