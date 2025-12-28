// src/utils/validateSignatory.ts

import { FamilyLawAgreementFormData } from "../types/FamilyLawAgreementFormData";

/**
 * Hierarchy-aware validator for signatory fields.
 * Divorce > Custody/ChildSupport > Spousal/Property
 */
export const validateSignatory = (
  val: string,
  form?: FamilyLawAgreementFormData,
  roleSet?: "Divorce" | "Custody" | "Spousal"
): boolean => {
  if (!form) return true;

  // agreementTypes[] is constructed in Stepper and passed in at handleSubmit
  const types: string[] = (form as any).agreementTypes || (form.agreementType ? [form.agreementType] : []);

  // Divorce dominates
  if (types.includes("Divorce")) {
    return roleSet === "Divorce" ? !!val && val.trim().length > 0 : true;
  }

  // Custody/ChildSupport next
  if (types.includes("Custody") || types.includes("ChildSupport")) {
    return roleSet === "Custody" ? !!val && val.trim().length > 0 : true;
  }

  // Spousal/Property last
  if (types.includes("SpousalSupport") || types.includes("PropertySettlement")) {
    return roleSet === "Spousal" ? !!val && val.trim().length > 0 : true;
  }

  return true;
};
