// src/schemas/formSchemas.ts
import { FormType } from '../types/FormType';
import { standardRetainerSchema } from './standardRetainerSchema';

export const formSchemas: Record<FormType, any> = {
  [FormType.StandardRetainer]: standardRetainerSchema,
  [FormType.IPCounselRetainer]: [], // to be added
  [FormType.CustomTemplate]: [],    // placeholder
};