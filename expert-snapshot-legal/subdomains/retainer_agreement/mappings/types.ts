export interface FieldMapping {
  formFieldId: string;
  templateToken: string;
  dataType: string;
  transform?: string;
}

export interface MappingSchema {
  fieldMappings: FieldMapping[];
}
