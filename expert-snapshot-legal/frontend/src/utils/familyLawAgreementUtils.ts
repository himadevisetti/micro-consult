// src/utils/familyLawAgreementUtils.ts

import { stepperConfig } from "../config/familyLawAgreementStepperConfig";
import { rehydrateStepData } from "./stepPersistence";
import { FamilyLawAgreementFormData } from "../types/FamilyLawAgreementFormData";

/**
 * Rehydrate common Finalization fields into the current step
 * when the flow has collapsed into a single module.
 */
export function rehydrateWithFinalization(stepKey: string) {
  const savedFinalization = rehydrateStepData("Finalization") as Partial<FamilyLawAgreementFormData>;
  if (!savedFinalization || Object.keys(savedFinalization).length === 0) {
    return {};
  }

  // ✅ Use Record to allow safe indexing by keyof FamilyLawAgreementFormData
  const merged: Partial<Record<keyof FamilyLawAgreementFormData, unknown>> = {};

  (stepperConfig.Finalization.fields as (keyof FamilyLawAgreementFormData)[]).forEach((f) => {
    const value = savedFinalization[f];
    if (value !== undefined) {
      merged[f] = value;
    }
  });

  return merged;
}
