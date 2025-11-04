import { ClauseBlock } from "./ClauseBlock";

export interface AugmentedClauseBlock extends ClauseBlock {
  idx: number;
  indices: number[];
}
