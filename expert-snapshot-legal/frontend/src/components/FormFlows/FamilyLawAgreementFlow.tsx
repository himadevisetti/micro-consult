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

  // ✅ Hydrate defaults with today's date for execution/effective
  const hydratedDefaults: FamilyLawAgreementFormData = {
    ...defaultFamilyLawAgreementFormData,
    executionDate: formattedToday,
    effectiveDate: formattedToday,
  };

  // ✅ Clear persisted state only on hard reload
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
    sessionStorage.removeItem('familyLawAgreementDraft');
    sessionStorage.removeItem('familyLawAgreementFormData');
  }

  // ✅ Session‑persisted form state
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

  // ✅ Retainer state for validation, preview, serialization
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

  // ✅ agreementTypes drives whether we render stepper vs chooser
  const [agreementTypes, setAgreementTypes] = useState<string[]>([]);
  // ✅ initialSelectedTypes used to pre‑check boxes in chooser
  const [initialSelectedTypes, setInitialSelectedTypes] = useState<string[]>([]);

  const location = useLocation();
  const { templateId } = useParams<{ templateId?: string }>();

  // ✅ Unified onChange handler for form fields
  const onChange = (
    field: keyof FamilyLawAgreementFormData,
    value: string | number | boolean | Date
  ) => {
    if (field === 'agreementType') {
      // Update agreementType safely
      setFormData(prev => ({
        ...prev,
        agreementType: value as FamilyLawAgreementFormData['agreementType'],
      }));

      // Clear validation state (banner + field errors)
      setErrors({});

      updateField(field, value);
      return;
    }

    // Normal update path
    setFormData(prev => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  // ✅ Hydrate formData/rawFormData from location.state first, fallback to sessionStorage
  useEffect(() => {
    const stateFormData = (location.state as any)?.formData as FamilyLawAgreementFormData | undefined;
    const stateRawFormData = (location.state as any)?.rawFormData as FamilyLawAgreementFormData | undefined;

    if (stateFormData && stateRawFormData) {
      setFormData(stateFormData);
      setRawFormData(stateRawFormData);
    } else {
      const saved = sessionStorage.getItem('familyLawAgreementFormData');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hydrated = normalizeFamilyLawAgreementFormData(parsed);
        setFormData(hydrated);
        setRawFormData(hydrated);
      }
    }
  }, [location.state, setFormData, setRawFormData]);

  // ✅ Hydrate agreementTypes for stepper OR clear for chooser
  useEffect(() => {
    const stateTypes = (location.state as any)?.agreementTypes as string[] | undefined;

    if (templateId) {
      // ✅ URL has a module param → stepper
      // Use stateTypes if available, otherwise keep whatever is already in agreementTypes
      if (stateTypes && stateTypes.length > 0) {
        setAgreementTypes(stateTypes);
      }
    } else {
      // ✅ Root URL → chooser
      setAgreementTypes([]); // force chooser
      if (stateTypes && stateTypes.length > 0) {
        setInitialSelectedTypes(stateTypes); // preserve for pre‑checking
      } else {
        setInitialSelectedTypes([]);
      }
    }
  }, [location.state, templateId]);

  // ✅ If no agreement types selected yet, show selector
  if (agreementTypes.length === 0) {
    return (
      <AgreementTypeSelector
        onSelect={types => setAgreementTypes(types)}
        initialSelected={initialSelectedTypes}
      />
    );
  }

  // ✅ Once agreement types are selected, launch stepper
  return (
    <FamilyLawAgreementStepper
      formData={formData}
      rawFormData={rawFormData}
      setFormData={setFormData}
      setRawFormData={setRawFormData}
      agreementTypes={agreementTypes}
      setAgreementTypes={setAgreementTypes}
      onComplete={handleSubmit}
    />
  );
}
