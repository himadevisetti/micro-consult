// src/types/FormType.ts

export enum FormType {
  StandardRetainer = 'standard-retainer',
  IPRightsLicensing = 'ip-rights-licensing',
  StartupAdvisory = 'startup-advisory',
  EmploymentAgreement = 'employment-agreement',
  LitigationEngagement = 'litigation-engagement',
  RealEstateContract = 'real-estate-contract',
  FamilyLawAgreement = 'family-law-agreement',
  CustomTemplate = 'custom-template',
}

export const RetainerTypeLabel: Record<FormType, string> = {
  [FormType.StandardRetainer]: 'Standard Retainer',
  [FormType.IPRightsLicensing]: 'IP Rights & Licensing',
  [FormType.StartupAdvisory]: 'Startup Advisory',
  [FormType.EmploymentAgreement]: 'Employment Agreement',
  [FormType.LitigationEngagement]: 'Litigation Engagement',
  [FormType.RealEstateContract]: 'Real Estate Contract',
  [FormType.FamilyLawAgreement]: 'Family Law Agreement',
  [FormType.CustomTemplate]: 'Custom Template',
};



