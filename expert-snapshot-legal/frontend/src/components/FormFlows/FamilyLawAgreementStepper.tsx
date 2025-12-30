// src/components/FormFlows/FamilyLawAgreementStepper.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FamilyLawAgreementFormData,
  FamilyLawAgreementType,
  FamilyLawAgreementStepKey
} from "../../types/FamilyLawAgreementFormData";
import { familyLawAgreementSchema } from "../../schemas/familyLawAgreementSchema";
import { stepperConfig, SELECTABLE_AGREEMENT_TYPES } from "../../config/familyLawAgreementStepperConfig";
import { parseAndValidateFamilyLawAgreementForm } from "../../utils/parseAndValidateFamilyLawAgreementForm";
import FamilyLawAgreementForm from "./FamilyLawAgreementForm";
import { getSignatoryFields } from "../../config/familyLawAgreementSignatories";
import styles from "../../styles/StandardRetainerForm.module.css";
import { persistStepData, rehydrateStepData } from "../../utils/stepPersistence";
import { rehydrateWithFinalization } from "../../utils/familyLawAgreementUtils";
import { normalizeFamilyLawAgreementFormData } from '../../utils/normalizeFamilyLawAgreementFormData';

type Props = {
  formData: FamilyLawAgreementFormData;
  rawFormData: FamilyLawAgreementFormData;
  setFormData: React.Dispatch<React.SetStateAction<FamilyLawAgreementFormData>>;
  setRawFormData: React.Dispatch<React.SetStateAction<FamilyLawAgreementFormData>>;
  agreementTypes: string[];
  setAgreementTypes: React.Dispatch<React.SetStateAction<string[]>>;
  lastStepKey?: string;
  setLastStepKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  onComplete: (formData: FamilyLawAgreementFormData, lastStepKey: string, agreementTypes: string[]) => void;
  onExitToChooser?: () => void;
  updateField: (
    field: keyof FamilyLawAgreementFormData,
    value: string | number | boolean | Date | any[]
  ) => void;
};

export default function FamilyLawAgreementStepper({
  formData,
  rawFormData,
  setFormData,
  setRawFormData,
  agreementTypes,
  setAgreementTypes,
  lastStepKey,
  setLastStepKey,
  onComplete,
  onExitToChooser,
  updateField,
}: Props) {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();
  const location = useLocation();

  // Build steps from canonical step keys
  const steps = useMemo(() => {
    const moduleSteps = agreementTypes
      .map((selectedKey) =>
        Object.values(stepperConfig).find((cfg) => cfg.key === selectedKey)
      )
      .filter(Boolean) as typeof stepperConfig[keyof typeof stepperConfig][];

    if (moduleSteps.length === 1) {
      const onlyStep = moduleSteps[0];
      moduleSteps[0] = {
        ...onlyStep,
        fields: [
          ...onlyStep.fields,
          ...stepperConfig.TerminationAndRemedies.fields,
          ...stepperConfig.Miscellaneous.fields,
          ...getSignatoryFields(agreementTypes),
        ],
        title: onlyStep.title,
        description: onlyStep.description,
      };
    } else if (moduleSteps.length > 1) {
      // Multiple modules → add a dedicated Finalization step from config
      const finalizationStep = stepperConfig.Finalization;
      moduleSteps.push({
        ...finalizationStep,
        fields: [
          ...stepperConfig.TerminationAndRemedies.fields,
          ...stepperConfig.Miscellaneous.fields,
          ...getSignatoryFields(agreementTypes),
        ],
      });
    }

    console.log("[Stepper.useMemo] Final steps:", moduleSteps.map(s => s.key));
    return moduleSteps;
  }, [agreementTypes]);

  // Collect first field keys from each module step (exclude Finalization)
  const firstFieldKeys = useMemo(() => {
    return steps
      .map(s => s.fields[0])
      .filter(Boolean);
  }, [steps]);

  // Determine initial step index using lastStepKey or templateId
  const initialStepIndex = useMemo(() => {
    if (lastStepKey) {
      const idx = steps.findIndex((s) => s.key === lastStepKey);
      return idx >= 0 ? idx : 0;
    }
    if (templateId) {
      const idx = steps.findIndex((s) => s.key === templateId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  }, [lastStepKey, templateId, steps]);

  // Track current step index
  const [currentStep, setCurrentStep] = useState(initialStepIndex);
  // Track touched fields for validation feedback
  const [touched, setTouched] = useState<Partial<Record<keyof FamilyLawAgreementFormData, boolean>>>({});
  // Track field errors for current step
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FamilyLawAgreementFormData, string>>>({});
  // Track exiting state to avoid URL sync when leaving
  const [exiting, setExiting] = useState(false);

  // Current step object
  const step = steps[currentStep];

  // Rehydrate from sessionStorage when step changes
  useEffect(() => {
    const currentKey = steps[currentStep]?.key;
    if (!currentKey) return;

    // ❌ Skip rehydration if single-module
    if (steps.length === 1) {
      console.log("[Stepper] Skipping rehydration (single-module).");
      return;
    }

    const step = steps[currentStep];

    // Load full snapshot for this step
    const saved = rehydrateStepData(currentKey);
    console.log("[Stepper] After rehydrateStepData (raw):", saved);

    // 🔍 Filter saved data to only fields belonging to this step
    const filteredSaved = Object.fromEntries(
      Object.entries(saved).filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
    );

    console.log("[Stepper] After rehydrateStepData (filtered):", filteredSaved);

    let merged: Partial<FamilyLawAgreementFormData> = { ...filteredSaved };

    // 🔍 Merge Finalization fields into non-Finalization steps, if any
    if (steps.length > 1 && currentKey !== "Finalization") {
      const finalizationMerged = rehydrateWithFinalization(currentKey);
      console.log("[Stepper] finalizationMerged:", finalizationMerged);
      merged = {
        ...merged,
        ...(finalizationMerged as Partial<FamilyLawAgreementFormData>)
      };
    }

    if (merged && Object.keys(merged).length > 0) {
      console.log("[Stepper] Merged before setFormData:", merged);

      setFormData(prev => {
        const next = { ...prev, ...merged };
        console.log("[Stepper] setFormData next:", next);
        return next;
      });

      // 🔹 Also update rawFormData to keep CustomDatePicker safe
      setRawFormData(prev => {
        const next = { ...prev, ...merged };
        console.log("[Stepper] setRawFormData next:", next);
        return next;
      });
    }
  }, [currentStep, steps, setFormData, setRawFormData]);

  // ✅ Keep URL in sync only when inside stepper and not exiting
  useEffect(() => {
    if (exiting) return;
    const currentKey = steps[currentStep]?.key;
    if (!currentKey) return;

    const expectedPath = `/form/family-law-agreement/${currentKey}`;
    if (window.location.pathname !== expectedPath) {
      navigate(expectedPath, { replace: true });
    }
    setLastStepKey(currentKey);
  }, [currentStep, steps, navigate, exiting, setLastStepKey]);

  // Ensure agreementType and stepKey in formData match current step key
  useEffect(() => {
    const currentKey = steps[currentStep]?.key;
    if (!currentKey) return;

    setFormData((prev) => ({
      ...prev,
      agreementType: SELECTABLE_AGREEMENT_TYPES.includes(currentKey)
        ? (currentKey as FamilyLawAgreementType)
        : prev.agreementType,
      stepKey: currentKey as FamilyLawAgreementStepKey,
    }));
  }, [currentStep, steps, setFormData]);

  const handleNext = () => {
    // Build a schema limited to the current step’s fields
    const stepSchema = Object.fromEntries(
      Object.entries(familyLawAgreementSchema).filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
    );

    // ✅ Validate against rawFormData (ISO/user-entered values)
    const { parsed, errors: validationErrors } =
      parseAndValidateFamilyLawAgreementForm(rawFormData, stepSchema);

    // Collect errors only for fields in this step
    const stepErrors = Object.entries(validationErrors)
      .filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
      .map(([, message]) => message as string);

    if (stepErrors.length > 0) {
      setFieldErrors(validationErrors);
      setTouched((prev) => {
        const allTouched: Partial<Record<keyof FamilyLawAgreementFormData, boolean>> = {};
        step.fields.forEach((f) => {
          allTouched[f] = true;
        });
        return { ...prev, ...allTouched };
      });
      return;
    }

    // Clear errors
    setFieldErrors({});

    // Restrict parsed to only current step fields
    const parsedStepOnly = Object.fromEntries(
      Object.entries(parsed).filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
    );

    // ✅ Normalize canonical formData before persisting
    const normalizedNextFormData = normalizeFamilyLawAgreementFormData({
      ...formData,
      ...parsedStepOnly,
    });

    // ✅ Keep rawFormData strictly as user-entered display strings
    const nextRawFormData = {
      ...rawFormData,
      ...parsedStepOnly,
    };

    // 🔎 Essential logs
    console.log("[Stepper.handleNext] step:", step.key, "currentStep:", currentStep);
    console.log("[Stepper.handleNext] normalized formData:", normalizedNextFormData);
    console.log("[Stepper.handleNext] next rawFormData:", nextRawFormData);

    // Update both states
    setFormData(normalizedNextFormData);
    setRawFormData(nextRawFormData);

    // ✅ Persist this step’s data (normalized)
    persistStepData(step.key, normalizedNextFormData);

    if (currentStep < steps.length - 1) {
      console.log("[Stepper.handleNext] advancing to next step");
      const nextKey = steps[currentStep + 1].key;
      setCurrentStep(currentStep + 1);
      navigate(`/form/family-law-agreement/${nextKey}`, {
        state: { agreementTypes, formData: normalizedNextFormData, rawFormData: nextRawFormData },
        replace: true,
      });
    } else {
      console.log("[Stepper.handleNext] final step reached, calling onComplete");
      onComplete(normalizedNextFormData, step.key, agreementTypes);
    }
  };

  const handleBack = () => {
    console.log("[Stepper.handleBack] invoked at step:", currentStep, "step.key:", steps[currentStep]?.key);

    if (currentStep === 0) {
      console.log("[Stepper.handleBack] Exiting to chooser with agreementTypes:", agreementTypes);
      console.log("[Stepper.handleBack] formData keys:", Object.keys(formData));
      console.log("[Stepper.handleBack] petitionerSignatoryName:", formData.petitionerSignatoryName);
      console.log("[Stepper.handleBack] respondentSignatoryName:", formData.respondentSignatoryName);

      // ✅ Exit stepper → return to module chooser
      setExiting(true);
      if (onExitToChooser) onExitToChooser();
      navigate("/form/family-law-agreement", {
        state: {
          agreementTypes,   // preserve selected modules for chooser checkboxes
          formData,         // preserve filled values
          rawFormData,      // preserve raw values
        },
      });
      return;
    }

    // ✅ Move back one step
    console.log("[Stepper.handleBack] Moving back from step:", currentStep, "to step:", currentStep - 1);
    console.log("[Stepper.handleBack] formData before back navigation:", formData);
    console.log("[Stepper.handleBack] petitionerSignatoryName before back:", formData.petitionerSignatoryName);
    console.log("[Stepper.handleBack] respondentSignatoryName before back:", formData.respondentSignatoryName);

    setCurrentStep(currentStep - 1);

    // Log what we’re passing into navigation
    console.log("[Stepper.handleBack] Navigating to step:", steps[currentStep - 1].key);
    console.log("[Stepper.handleBack] Passing agreementTypes:", agreementTypes);
    console.log("[Stepper.handleBack] Passing formData keys:", Object.keys(formData));
    console.log("[Stepper.handleBack] Passing rawFormData keys:", Object.keys(rawFormData));

    navigate(`/form/family-law-agreement/${steps[currentStep - 1].key}`, {
      state: { agreementTypes, formData, rawFormData },
      replace: true,
    });
  };

  // ✅ Filter schema to only include fields for current step
  const filteredSchema = Object.fromEntries(
    Object.entries(familyLawAgreementSchema).filter(([field]) =>
      step.fields.includes(field as keyof FamilyLawAgreementFormData)
    )
  );

  // ✅ Minimal debug logging
  console.log("[Stepper] Step:", step.key, "currentStep:", currentStep);

  return (
    <div>
      {/* ✅ Step title and description */}
      <h2 className={styles.formTitle}>{step.title}</h2>
      <p className={styles.formSubtitle}>{step.description}</p>

      {/* ✅ Render form for current step */}
      <FamilyLawAgreementForm
        schema={filteredSchema}
        formData={formData}
        rawFormData={rawFormData}
        errors={fieldErrors}
        touched={touched}
        firstFieldKeys={firstFieldKeys}
        onChange={(field, value) => {
          // Update canonical formData
          setFormData(prev => ({
            ...prev,
            [field]: value,
          }));
          // ✅ Propagate to useRetainerState for consistency
          updateField(field, value);
        }}
        onRawChange={(field, value: string) => {
          // Update rawFormData
          setRawFormData(prev => ({
            ...prev,
            [field]: value,
          }));
          // Optionally also propagate raw values if needed
          updateField(field, value);
        }}
        onBlur={(field) =>
          setTouched(prev => ({
            ...prev,
            [field]: true,
          }))
        }
        onSubmit={async (raw) => {
          // ✅ keep rawFormData in sync before moving forward
          setRawFormData(raw);
          handleNext();
          return;
        }}
        markTouched={(field) =>
          setTouched(prev => ({
            ...prev,
            [field]: true,
          }))
        }
      />

      {/* ✅ Navigation buttons */}
      <div className={styles.buttonRow}>
        <button className={styles.navButton} onClick={handleBack}>
          Back
        </button>
        <button className={styles.navButton} onClick={handleNext}>
          {currentStep < steps.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
}
