// src/schemas/formSchemas.ts
import { FormType } from '../types/FormType';
import { standardRetainerSchema } from './standardRetainerSchema';
import { ipRightsLicensingSchema } from './ipRightsLicensingSchema';
import type { RetainerFieldConfig } from '../types/RetainerFieldConfig';
import type { IPRetainerFieldConfig } from '../types/IPRetainerFieldConfig';

export const formSchemas: {
  [FormType.StandardRetainer]: Record<string, RetainerFieldConfig>;
  [FormType.IPRightsLicensing]: Record<string, IPRetainerFieldConfig>;
  [FormType.CustomTemplate]: []; // or a placeholder type if needed
} = {
  [FormType.StandardRetainer]: standardRetainerSchema,
  [FormType.IPRightsLicensing]: ipRightsLicensingSchema,
  [FormType.CustomTemplate]: [],
};