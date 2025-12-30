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

  // ⭐ NEW
  manualAgreementTypes: string[];
  setManualAgreementTypes: React.Dispatch<React.SetStateAction<string[]>>;

  lastStepKey?: string;
  setLastStepKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  onComplete: (
    formData: FamilyLawAgreementFormData,
    lastStepKey: string,
    agreementTypes: string[],
    manualAgreementTypes: string[]   // ⭐ NEW
  ) => void;
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

  // ⭐ NEW
  manualAgreementTypes,
  setManualAgreementTypes,

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

  const [currentStep, setCurrentStep] = useState(initialStepIndex);
  const [touched, setTouched] = useState<Partial<Record<keyof FamilyLawAgreementFormData, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FamilyLawAgreementFormData, string>>>({});
  const [exiting, setExiting] = useState(false);

  const step = steps[currentStep];

  // Rehydrate from sessionStorage when step changes
  useEffect(() => {
    const currentKey = steps[currentStep]?.key;
    if (!currentKey) return;

    if (steps.length === 1) return;

    const step = steps[currentStep];
    const saved = rehydrateStepData(currentKey);

    const filteredSaved = Object.fromEntries(
      Object.entries(saved).filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
    );

    let merged: Partial<FamilyLawAgreementFormData> = { ...filteredSaved };

    if (steps.length > 1 && currentKey !== "Finalization") {
      const finalizationMerged = rehydrateWithFinalization(currentKey);
      merged = {
        ...merged,
        ...(finalizationMerged as Partial<FamilyLawAgreementFormData>)
      };
    }

    if (merged && Object.keys(merged).length > 0) {
      setFormData(prev => ({ ...prev, ...merged }));
      setRawFormData(prev => ({ ...prev, ...merged }));
    }
  }, [currentStep, steps, setFormData, setRawFormData]);

  // Keep URL in sync
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

  // Ensure agreementType + stepKey match current step
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
    const stepSchema = Object.fromEntries(
      Object.entries(familyLawAgreementSchema).filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
    );

    const { parsed, errors: validationErrors } =
      parseAndValidateFamilyLawAgreementForm(rawFormData, stepSchema);

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

    setFieldErrors({});

    const parsedStepOnly = Object.fromEntries(
      Object.entries(parsed).filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
    );

    const normalizedNextFormData = normalizeFamilyLawAgreementFormData({
      ...formData,
      ...parsedStepOnly,
    });

    const nextRawFormData = {
      ...rawFormData,
      ...parsedStepOnly,
    };

    setFormData(normalizedNextFormData);
    setRawFormData(nextRawFormData);

    persistStepData(step.key, normalizedNextFormData);

    if (currentStep < steps.length - 1) {
      const nextKey = steps[currentStep + 1].key;
      setCurrentStep(currentStep + 1);
      navigate(`/form/family-law-agreement/${nextKey}`, {
        state: {
          agreementTypes,
          manualAgreementTypes,   // ⭐ NEW
          formData: normalizedNextFormData,
          rawFormData: nextRawFormData
        },
        replace: true,
      });
    } else {
      onComplete(
        normalizedNextFormData,
        step.key,
        agreementTypes,
        manualAgreementTypes   // ⭐ NEW
      );
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      setExiting(true);
      if (onExitToChooser) onExitToChooser();
      navigate("/form/family-law-agreement", {
        state: {
          agreementTypes,
          manualAgreementTypes,   // ⭐ NEW
          formData,
          rawFormData
        },
      });
      return;
    }

    setCurrentStep(currentStep - 1);

    navigate(`/form/family-law-agreement/${steps[currentStep - 1].key}`, {
      state: {
        agreementTypes,
        manualAgreementTypes,   // ⭐ NEW
        formData,
        rawFormData
      },
      replace: true,
    });
  };

  const filteredSchema = Object.fromEntries(
    Object.entries(familyLawAgreementSchema).filter(([field]) =>
      step.fields.includes(field as keyof FamilyLawAgreementFormData)
    )
  );

  return (
    <div>
      <h2 className={styles.formTitle}>{step.title}</h2>
      <p className={styles.formSubtitle}>{step.description}</p>

      <FamilyLawAgreementForm
        schema={filteredSchema}
        formData={formData}
        rawFormData={rawFormData}
        errors={fieldErrors}
        touched={touched}
        firstFieldKeys={firstFieldKeys}
        onChange={(field, value) => {
          setFormData(prev => ({ ...prev, [field]: value }));
          updateField(field, value);
        }}
        onRawChange={(field, value: string) => {
          setRawFormData(prev => ({ ...prev, [field]: value }));
          updateField(field, value);
        }}
        onBlur={(field) =>
          setTouched(prev => ({ ...prev, [field]: true }))
        }
        onSubmit={async (raw) => {
          setRawFormData(raw);
          handleNext();
        }}
        markTouched={(field) =>
          setTouched(prev => ({ ...prev, [field]: true }))
        }
      />

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
