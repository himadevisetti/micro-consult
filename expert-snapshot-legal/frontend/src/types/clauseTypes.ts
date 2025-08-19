export interface SerializedClause {
  label: string;
  content: string;
  group?: string;
  isOptional?: boolean;
  notes?: string;
  tags?: string[];
  formatting?: {
    underline?: boolean;
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'right' | 'center' | 'justify';
  };
  anchors?: {
    signature?: boolean;
    initials?: boolean;
  };
}

export interface ClausePayload {
  label: string;
  html: string;
}
