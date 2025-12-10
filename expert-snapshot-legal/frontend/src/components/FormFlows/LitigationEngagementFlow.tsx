// src/components/FormFlows/LitigationEngagementFlow.tsx

import { useEffect } from 'react';
import LitigationEngagementForm from './LitigationEngagementForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { LitigationEngagementFormData } from '../../types/LitigationEngagementFormData';
import { defaultLitigationEngagementFormData } from '../../types/LitigationEngagementFormData';
import { normalizeRawLitigationEngagementFormData, normalizeLitigationEngagementFormData } from '../../utils/normalizeLitigationEngagementFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import { LitigationEngagementFieldConfig } from '@/types/LitigationEngagementFieldConfig';
import { FormType } from '@/types/FormType';
import { parseAndValidateLitigationEngagementForm } from '../../utils/parseAndValidateLitigationEngagementForm';
import { buildLitigationEngagementPreviewPayload } from '../../utils/buildLitigationEngagementPreviewPayload';
import { getSerializedLitigationEngagementClauses } from '../../utils/serializeLitigationEngagementClauses';

interface Props {
  schema: Record<string, LitigationEngagementFieldConfig>;
}

export default function LitigationEngagementFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  const hydratedDefaults: LitigationEngagementFormData = {
    ...defaultLitigationEngagementFormData,
    executionDate: formattedToday,
    effectiveDate: formattedToday,
  };

  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
    setRawFormData,
  } = useSessionFormState<LitigationEngagementFormData>(
    'litigationEngagementDraft',
    hydratedDefaults,
    normalizeRawLitigationEngagementFormData
  );

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState<LitigationEngagementFormData>(
    rawFormData,
    formData,
    setFormData,
    schema,
    FormType.LitigationEngagement,
    parseAndValidateLitigationEngagementForm,
    buildLitigationEngagementPreviewPayload,
    getSerializedLitigationEngagementClauses,
    'litigationEngagementFormData'
  );

  const onChange = (field: keyof LitigationEngagementFormData, value: string | number | boolean | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('litigationEngagementFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeLitigationEngagementFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);
    }
  }, []);

  return (
    <LitigationEngagementForm
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

