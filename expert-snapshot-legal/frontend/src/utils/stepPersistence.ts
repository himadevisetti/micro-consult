// src/utils/stepPersistence.ts

export function persistStepData(stepKey: string, data: any) {
  try {
    sessionStorage.setItem(
      `FamilyLawAgreement:${stepKey}`,
      JSON.stringify(data)
    );
    console.log(`[persistStepData] saved for ${stepKey}:`, data);
  } catch (err) {
    console.error("[persistStepData] error:", err);
  }
}

export function rehydrateStepData(stepKey: string) {
  try {
    const saved = sessionStorage.getItem(`FamilyLawAgreement:${stepKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log(`[rehydrateStepData] loaded for ${stepKey}:`, parsed);
      return parsed;
    }
  } catch (err) {
    console.error("[rehydrateStepData] error:", err);
  }
  return {};
}

export function clearAllStepData() {
  Object.keys(sessionStorage)
    .filter(k => k.startsWith("FamilyLawAgreement:"))
    .forEach(k => sessionStorage.removeItem(k));
  console.log("[clearAllStepData] cleared all step data");
}

