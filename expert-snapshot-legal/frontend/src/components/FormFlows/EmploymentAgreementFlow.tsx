// src/components/FormFlows/EmploymentAgreementFlow.tsx

import { useEffect } from 'react';
import EmploymentAgreementForm from './EmploymentAgreementForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { EmploymentAgreementFormData } from '../../types/EmploymentAgreementFormData';
import { defaultEmploymentAgreementFormData } from '../../types/EmploymentAgreementFormData';
import {
  normalizeRawEmploymentAgreementFormData,
  normalizeEmploymentAgreementFormData
} from '../../utils/normalizeEmploymentAgreementFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import { EmploymentAgreementFieldConfig } from '@/types/EmploymentAgreementFieldConfig';
import { FormType } from '@/types/FormType';
import { parseAndValidateEmploymentAgreementForm } from '../../utils/parseAndValidateEmploymentAgreementForm';
import { buildEmploymentAgreementPreviewPayload } from '../../utils/buildEmploymentAgreementPreviewPayload';
import { getSerializedEmploymentAgreementClauses } from '../../utils/serializeEmploymentAgreementClauses';

interface Props {
  schema: Record<string, EmploymentAgreementFieldConfig>;
}

export default function EmploymentAgreementFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  const hydratedDefaults: EmploymentAgreementFormData = {
    ...defaultEmploymentAgreementFormData,
    effectiveDate: formattedToday
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
    sessionStorage.removeItem('employmentAgreementDraft');
    sessionStorage.removeItem('employmentAgreementFormData');
  }

  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
    setRawFormData,
  } = useSessionFormState<EmploymentAgreementFormData>(
    'employmentAgreementDraft',
    hydratedDefaults,
    normalizeRawEmploymentAgreementFormData
  );

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState<EmploymentAgreementFormData>(
    rawFormData,
    formData,
    setFormData,
    schema,
    FormType.EmploymentAgreement,
    parseAndValidateEmploymentAgreementForm,
    buildEmploymentAgreementPreviewPayload,
    getSerializedEmploymentAgreementClauses,
    'employmentAgreementFormData'
  );

  const onChange = (
    field: keyof EmploymentAgreementFormData,
    value: string | number | boolean | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('employmentAgreementFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeEmploymentAgreementFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);
    }
  }, []);

  return (
    <EmploymentAgreementForm
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

