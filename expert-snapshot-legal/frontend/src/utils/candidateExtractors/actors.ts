// src/utils/candidateExtractors/actors.ts

import { Candidate } from "../../types/Candidate";
import { TextAnchor } from "../../types/TextAnchor";
import { extractParties } from "./parties.js";
import { extractInventors } from "./inventors.js";

export function extractActors(anchors: TextAnchor[]): Candidate[] {
  return [
    ...extractParties(anchors),
    ...extractInventors(anchors),
  ];
}
