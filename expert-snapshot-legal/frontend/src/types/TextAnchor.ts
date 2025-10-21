export interface TextAnchor {
  text: string;
  page: number;
  y: number;
  roleHint?: string;

  /** Structural signal from prebuilt-read parser */
  wasHeading?: boolean; // true if this anchor was emitted as a heading
}

