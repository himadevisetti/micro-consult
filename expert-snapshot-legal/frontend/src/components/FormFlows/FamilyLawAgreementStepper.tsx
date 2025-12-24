// src/components/FormFlows/FamilyLawAgreementStepper.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FamilyLawAgreementFormData,
  FamilyLawAgreementType
} from "../../types/FamilyLawAgreementFormData";
import { familyLawAgreementSchema } from "../../schemas/familyLawAgreementSchema";
import { stepperConfig } from "../../config/familyLawAgreementStepperConfig";
import { parseAndValidateFamilyLawAgreementForm } from "../../utils/parseAndValidateFamilyLawAgreementForm";
import FamilyLawAgreementForm from "./FamilyLawAgreementForm";
import styles from "../../styles/StandardRetainerForm.module.css";

type Props = {
  formData: FamilyLawAgreementFormData;
  rawFormData: FamilyLawAgreementFormData;
  setFormData: React.Dispatch<React.SetStateAction<FamilyLawAgreementFormData>>;
  setRawFormData: React.Dispatch<React.SetStateAction<FamilyLawAgreementFormData>>;
  agreementTypes: string[]; // canonical step keys (e.g. "Custody", "Divorce")
  setAgreementTypes: React.Dispatch<React.SetStateAction<string[]>>;
  onComplete: (formData: FamilyLawAgreementFormData, lastStepKey: string) => void;
};

// ✅ Helper to decide which signatory fields to include based on selected modules
const getSignatoryFields = (
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

export default function FamilyLawAgreementStepper({
  formData,
  rawFormData,
  setFormData,
  setRawFormData,
  agreementTypes,
  setAgreementTypes,
  onComplete,
}: Props) {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();

  // ✅ Build steps from canonical step keys
  const steps = useMemo(() => {
    const moduleSteps = agreementTypes
      .map((selectedKey) =>
        Object.values(stepperConfig).find((cfg) => cfg.key === selectedKey)
      )
      .filter(Boolean) as typeof stepperConfig[keyof typeof stepperConfig][];

    if (moduleSteps.length === 1) {
      // ✅ Single module → merge mandatory + signatures into that step
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
      // ✅ Multiple modules → add a dedicated finalization step
      moduleSteps.push({
        key: "finalization",
        title: "Finalization & Signatures",
        description: "Termination clauses, miscellaneous provisions, and signature fields",
        fields: [
          ...stepperConfig.TerminationAndRemedies.fields,
          ...stepperConfig.Miscellaneous.fields,
          ...getSignatoryFields(agreementTypes),
        ],
      });
    }

    return moduleSteps;
  }, [agreementTypes]);

  // ✅ Map templateId (like "Custody") to index by matching step.key
  const initialStepIndex = templateId
    ? steps.findIndex((s) => s.key === templateId)
    : 0;

  // ✅ Track current step index
  const [currentStep, setCurrentStep] = useState(
    initialStepIndex >= 0 ? initialStepIndex : 0
  );

  // ✅ Track touched fields for validation feedback
  const [touched, setTouched] = useState<
    Partial<Record<keyof FamilyLawAgreementFormData, boolean>>
  >({});

  // ✅ Track field errors for current step
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FamilyLawAgreementFormData, string>>
  >({});

  // ✅ Track exiting state to avoid URL sync when leaving
  const [exiting, setExiting] = useState(false);

  // ✅ Current step object
  const step = steps[currentStep];

  // ✅ Keep URL in sync only when inside stepper and not exiting
  useEffect(() => {
    if (exiting) return;
    const currentKey = steps[currentStep]?.key;
    if (!currentKey) return;

    const expectedPath = `/form/family-law-agreement/${currentKey}`;
    if (window.location.pathname !== expectedPath) {
      navigate(expectedPath, { replace: true });
    }
  }, [currentStep, steps, navigate, exiting]);

  // ✅ Ensure agreementType in formData matches current step key
  useEffect(() => {
    const currentKey = steps[currentStep]?.key;
    if (currentKey && currentKey !== formData.agreementType) {
      setFormData((prev) => ({
        ...prev,
        agreementType: currentKey as FamilyLawAgreementType,
      }));
    }
  }, [currentStep, steps, formData.agreementType, setFormData]);

  const handleNext = () => {
    // ✅ Build a schema limited to the current step’s fields
    const stepSchema = Object.fromEntries(
      Object.entries(familyLawAgreementSchema).filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
    );

    // ✅ Validate only against this step’s schema
    const { parsed, errors: validationErrors } =
      parseAndValidateFamilyLawAgreementForm(formData, stepSchema);

    // ✅ Collect errors only for fields in this step
    const stepErrors = Object.entries(validationErrors)
      .filter(([field]) =>
        step.fields.includes(field as keyof FamilyLawAgreementFormData)
      )
      .map(([, message]) => message as string);

    if (stepErrors.length > 0) {
      setFieldErrors(validationErrors);

      // ✅ Mark all fields in this step as touched
      setTouched((prev) => {
        const allTouched: Partial<Record<keyof FamilyLawAgreementFormData, boolean>> = {};
        step.fields.forEach((f) => {
          allTouched[f] = true;
        });
        return { ...prev, ...allTouched };
      });

      return;
    }

    // ✅ Clear errors and update form data
    setFieldErrors({});
    setFormData(parsed);

    if (currentStep < steps.length - 1) {
      // ✅ Move to next step
      setCurrentStep(currentStep + 1);
    } else {
      // ✅ Final step → call onComplete
      onComplete(parsed, step.key);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      // ✅ Exit stepper → return to module chooser
      setExiting(true);
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
    setCurrentStep(currentStep - 1);
  };

  // ✅ Filter schema to only include fields for current step
  const filteredSchema = Object.fromEntries(
    Object.entries(familyLawAgreementSchema).filter(([field]) =>
      step.fields.includes(field as keyof FamilyLawAgreementFormData)
    )
  );

  console.log("Step:", step.key);
  console.log("Step fields:", step.fields);
  console.log("Schema keys:", Object.keys(familyLawAgreementSchema));
  console.log("Filtered schema keys:", Object.keys(filteredSchema));

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
        onChange={(field, value) =>
          setFormData((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onRawChange={(field, value: string) =>
          setRawFormData((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onBlur={(field) =>
          setTouched((prev) => ({
            ...prev,
            [field]: true,
          }))
        }
        onSubmit={async (raw) => {
          setRawFormData(raw);
          handleNext();
          return;
        }}
        markTouched={(field) =>
          setTouched((prev) => ({
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
