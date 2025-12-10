// src/schemas/formSchemas.ts
import { FormType } from '../types/FormType';
import { standardRetainerSchema } from './standardRetainerSchema';
import { ipRightsLicensingSchema } from './ipRightsLicensingSchema';
import { startupAdvisorySchema } from './startupAdvisorySchema';
import { employmentAgreementSchema } from './employmentAgreementSchema';
import { litigationEngagementSchema } from './litigationEngagementSchema'; // 🔹 new

import type { RetainerFieldConfig } from '../types/RetainerFieldConfig';
import type { IPRetainerFieldConfig } from '../types/IPRetainerFieldConfig';
import type { StartupAdvisoryFieldConfig } from '../types/StartupAdvisoryFieldConfig';
import type { EmploymentAgreementFieldConfig } from '../types/EmploymentAgreementFieldConfig';
import type { LitigationEngagementFieldConfig } from '../types/LitigationEngagementFieldConfig'; // 🔹 new

export const formSchemas: {
  [FormType.StandardRetainer]: Record<string, RetainerFieldConfig>;
  [FormType.IPRightsLicensing]: Record<string, IPRetainerFieldConfig>;
  [FormType.StartupAdvisory]: Record<string, StartupAdvisoryFieldConfig>;
  [FormType.EmploymentAgreement]: Record<string, EmploymentAgreementFieldConfig>;
  [FormType.LitigationEngagement]: Record<string, LitigationEngagementFieldConfig>; // 🔹 new
  [FormType.CustomTemplate]: [];
} = {
  [FormType.StandardRetainer]: standardRetainerSchema,
  [FormType.IPRightsLicensing]: ipRightsLicensingSchema,
  [FormType.StartupAdvisory]: startupAdvisorySchema,
  [FormType.EmploymentAgreement]: employmentAgreementSchema,
  [FormType.LitigationEngagement]: litigationEngagementSchema, // 🔹 new
  [FormType.CustomTemplate]: [],
};
