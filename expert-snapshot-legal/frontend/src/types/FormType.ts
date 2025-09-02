// src/types/FormType.ts

export enum FormType {
  StandardRetainer = 'standard-retainer',
  IPRightsLicensing = 'ip-rights-licensing',
  CustomTemplate = 'custom-template',
}

export const RetainerTypeLabel: Record<FormType, string> = {
  [FormType.StandardRetainer]: 'Standard Retainer',
  [FormType.IPRightsLicensing]: 'IP Rights & Licensing',
  [FormType.CustomTemplate]: 'Custom Template',
};


