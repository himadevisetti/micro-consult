// src/components/FormFlows/FamilyLawAgreementFlow.tsx

import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { FamilyLawAgreementFormData } from '../../types/FamilyLawAgreementFormData';
import { defaultFamilyLawAgreementFormData } from '../../types/FamilyLawAgreementFormData';
import {
  normalizeRawFamilyLawAgreementFormData,
  normalizeFamilyLawAgreementFormData,
} from '../../utils/normalizeFamilyLawAgreementFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import { FamilyLawAgreementFieldConfig } from '@/types/FamilyLawAgreementFieldConfig';
import { FormType } from '@/types/FormType';
import { parseAndValidateFamilyLawAgreementForm } from '../../utils/parseAndValidateFamilyLawAgreementForm';
import { buildFamilyLawAgreementPreviewPayload } from '../../utils/buildFamilyLawAgreementPreviewPayload';
import { getSerializedFamilyLawAgreementClauses } from '../../utils/serializeFamilyLawAgreementClauses';
import FamilyLawAgreementStepper from './FamilyLawAgreementStepper';
import AgreementTypeSelector from './AgreementTypeSelector';

interface Props {
  schema: Record<string, FamilyLawAgreementFieldConfig>;
}

export default function FamilyLawAgreementFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  // Default execution/effective dates
  const hydratedDefaults: FamilyLawAgreementFormData = {
    ...defaultFamilyLawAgreementFormData,
    executionDate: formattedToday,
    effectiveDate: formattedToday,
  };

  // Clear persisted state only on hard reload
  const isHardReload = (() => {
    if (typeof performance === 'undefined') return false;

    const entries = performance.getEntriesByType?.('navigation') as
      | PerformanceNavigationTiming[]
      | undefined;

    if (entries && entries.length > 0) {
      return entries[0].type === 'reload';
    }

    const nav = (performance as any).navigation;
    return !!nav && nav.type === nav.TYPE_RELOAD;
  })();

  if (isHardReload) {
    sessionStorage.removeItem("familyLawAgreementDraft");
    sessionStorage.removeItem("familyLawAgreementFormData");

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("FamilyLawAgreement:")) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Session‑persisted form state
  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
    setRawFormData,
  } = useSessionFormState<FamilyLawAgreementFormData>(
    'familyLawAgreementDraft',
    hydratedDefaults,
    normalizeRawFamilyLawAgreementFormData
  );

  // Agreement type selection
  const [agreementTypes, setAgreementTypes] = useState<string[]>([]);
  const [manualAgreementTypes, setManualAgreementTypes] = useState<string[]>([]);
  const [initialSelectedTypes, setInitialSelectedTypes] = useState<string[]>([]);
  const [lastStepKey, setLastStepKey] = useState<string | undefined>(undefined);
  const [showChooser, setShowChooser] = useState(false);

  const location = useLocation();
  const { templateId } = useParams<{ templateId?: string }>();

  // Retainer state for validation + preview
  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
    setErrors,
  } = useRetainerState<FamilyLawAgreementFormData>(
    rawFormData,
    formData,
    setFormData,
    schema,
    FormType.FamilyLawAgreement,
    parseAndValidateFamilyLawAgreementForm,
    buildFamilyLawAgreementPreviewPayload,
    getSerializedFamilyLawAgreementClauses,
    'familyLawAgreementFormData'
  );

  // Unified onChange handler
  const onChange = (
    field: keyof FamilyLawAgreementFormData,
    value: string | number | boolean | Date | any[]
  ) => {
    if (field === 'agreementType') {
      setFormData(prev => ({
        ...prev,
        agreementType: value as FamilyLawAgreementFormData['agreementType'],
      }));
      setErrors({});
      updateField(field, value);
      return;
    }

    // Inline‑pair arrays
    if (Array.isArray(value)) {
      setRawFormData(prev => ({ ...prev, [field]: value }));
      setFormData(prev => ({ ...prev, [field]: value }));
      updateField(field, value);
      return;
    }

    // Default scalar case
    setFormData(prev => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  // Hydrate from canonical sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("familyLawAgreementFormData");
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeFamilyLawAgreementFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);

      if (parsed.agreementTypes?.length > 0) {
        setAgreementTypes(parsed.agreementTypes);
        setInitialSelectedTypes(parsed.agreementTypes);
      }

      if (parsed.manualAgreementTypes?.length > 0) {
        setManualAgreementTypes(parsed.manualAgreementTypes);
      }

      if (parsed.stepKey) {
        setLastStepKey(parsed.stepKey);
      }
    }
  }, []);

  // Show chooser if needed
  if (showChooser || agreementTypes.length === 0) {
    return (
      <AgreementTypeSelector
        onSelect={(fullTypes, manualTypes) => {
          setAgreementTypes(fullTypes);
          setManualAgreementTypes(manualTypes);
          setShowChooser(false);
        }}
        initialSelected={initialSelectedTypes}
      />
    );
  }

  // Render stepper
  return (
    <FamilyLawAgreementStepper
      formData={formData}
      rawFormData={rawFormData}
      setFormData={setFormData}
      setRawFormData={setRawFormData}
      agreementTypes={agreementTypes}
      setAgreementTypes={setAgreementTypes}
      manualAgreementTypes={manualAgreementTypes}
      setManualAgreementTypes={setManualAgreementTypes}
      lastStepKey={lastStepKey}
      setLastStepKey={setLastStepKey}
      onComplete={(raw, lastStepKey) =>
        handleSubmit(raw, lastStepKey, agreementTypes)
      }
      onExitToChooser={() => setShowChooser(true)}
      updateField={updateField}
    />
  );
}
