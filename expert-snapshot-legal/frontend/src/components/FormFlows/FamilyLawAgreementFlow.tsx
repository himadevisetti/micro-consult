// src/components/FormFlows/FamilyLawAgreementFlow.tsx

import { useEffect } from 'react';
import FamilyLawAgreementForm from './FamilyLawAgreementForm';
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

interface Props {
  schema: Record<string, FamilyLawAgreementFieldConfig>;
}

export default function FamilyLawAgreementFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  const hydratedDefaults: FamilyLawAgreementFormData = {
    ...defaultFamilyLawAgreementFormData,
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
    sessionStorage.removeItem('familyLawAgreementDraft');
    sessionStorage.removeItem('familyLawAgreementFormData');
  }

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

  useEffect(() => {
    const saved = sessionStorage.getItem('familyLawAgreementFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeFamilyLawAgreementFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);
    }
  }, []);

  return (
    <FamilyLawAgreementForm
      schema={schema}
      formData={formData}
      rawFormData={rawFormData}
      onChange={onChange}
      onRawChange={onRawChange}
      onBlur={handleBlur}
      errors={errors}
      touched={touched}
      markTouched={markTouched}
      onSubmit={handleSubmit}
    />
  );
}

