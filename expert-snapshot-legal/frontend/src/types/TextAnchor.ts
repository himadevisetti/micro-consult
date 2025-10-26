// src/types/TextAnchor.ts

export interface TextAnchor {
  text: string;
  page: number;
  y: number;
  roleHint?: string;

  /** Structural signal from prebuilt-read parser */
  wasHeading?: boolean; // true if this anchor was emitted as a heading

  /** Geometry from Form Recognizer (line-level bounding box or polygon) */
  polygon?: { x: number; y: number }[] | number[];
  boundingBox?: { x: number; y: number }[] | number[];

  /** Character offset and length from prebuilt-read spans */
  offset?: number;
  length?: number;
}
