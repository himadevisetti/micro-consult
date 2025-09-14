// src/schemas/formSchemas.ts
import { FormType } from '../types/FormType';
import { standardRetainerSchema } from './standardRetainerSchema';
import { ipRightsLicensingSchema } from './ipRightsLicensingSchema';
import { startupAdvisorySchema } from './startupAdvisorySchema';
import { employmentAgreementSchema } from './employmentAgreementSchema';

import type { RetainerFieldConfig } from '../types/RetainerFieldConfig';
import type { IPRetainerFieldConfig } from '../types/IPRetainerFieldConfig';
import type { StartupAdvisoryFieldConfig } from '../types/StartupAdvisoryFieldConfig';
import type { EmploymentAgreementFieldConfig } from '../types/EmploymentAgreementFieldConfig';

export const formSchemas: {
  [FormType.StandardRetainer]: Record<string, RetainerFieldConfig>;
  [FormType.IPRightsLicensing]: Record<string, IPRetainerFieldConfig>;
  [FormType.StartupAdvisory]: Record<string, StartupAdvisoryFieldConfig>;
  [FormType.EmploymentAgreement]: Record<string, EmploymentAgreementFieldConfig>;
  [FormType.CustomTemplate]: []; // or a placeholder type if needed
} = {
  [FormType.StandardRetainer]: standardRetainerSchema,
  [FormType.IPRightsLicensing]: ipRightsLicensingSchema,
  [FormType.StartupAdvisory]: startupAdvisorySchema,
  [FormType.EmploymentAgreement]: employmentAgreementSchema,
  [FormType.CustomTemplate]: [],
};
