// src/config/familyLawAgreementSignatories.ts

import { FamilyLawAgreementFormData } from "../types/FamilyLawAgreementFormData";

// ✅ Helper to decide which signatory fields to include based on selected modules
export const getSignatoryFields = (
  agreementTypes: string[]
): (keyof FamilyLawAgreementFormData)[] => {
  if (agreementTypes.includes("Divorce")) {
    // Divorce → Petitioner/Respondent signatories
    return [
      "petitionerSignatoryName", "petitionerSignatoryRole",
      "respondentSignatoryName", "respondentSignatoryRole",
    ];
  } else if (agreementTypes.includes("Custody")) {
    // Custody → Mother/Father signatories
    return [
      "motherSignatoryName", "motherSignatoryRole",
      "fatherSignatoryName", "fatherSignatoryRole",
    ];
  } else {
    // Default → Spouse1/Spouse2 signatories
    return [
      "spouse1SignatoryName", "spouse1SignatoryRole",
      "spouse2SignatoryName", "spouse2SignatoryRole",
    ];
  }
};

