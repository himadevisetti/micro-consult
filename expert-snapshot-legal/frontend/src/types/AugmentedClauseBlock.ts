import { ClauseBlock } from "./ClauseBlock";

export interface AugmentedClauseBlock extends ClauseBlock {
  idx: number;
  paragraphIndices: number[];
}
