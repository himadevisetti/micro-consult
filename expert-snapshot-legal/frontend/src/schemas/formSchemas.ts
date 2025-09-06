// src/schemas/formSchemas.ts
import { FormType } from '../types/FormType';
import { standardRetainerSchema } from './standardRetainerSchema';
import { ipRightsLicensingSchema } from './ipRightsLicensingSchema';
import { startupAdvisorySchema } from './startupAdvisorySchema';
import type { RetainerFieldConfig } from '../types/RetainerFieldConfig';
import type { IPRetainerFieldConfig } from '../types/IPRetainerFieldConfig';
import type { StartupAdvisoryFieldConfig } from '../types/StartupAdvisoryFieldConfig';

export const formSchemas: {
  [FormType.StandardRetainer]: Record<string, RetainerFieldConfig>;
  [FormType.IPRightsLicensing]: Record<string, IPRetainerFieldConfig>;
  [FormType.StartupAdvisory]: Record<string, StartupAdvisoryFieldConfig>;
  [FormType.CustomTemplate]: []; // or a placeholder type if needed
} = {
  [FormType.StandardRetainer]: standardRetainerSchema,
  [FormType.IPRightsLicensing]: ipRightsLicensingSchema,
  [FormType.StartupAdvisory]: startupAdvisorySchema,
  [FormType.CustomTemplate]: [],
};
