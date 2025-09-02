// src/components/FormFlows/StandardRetainerFlow.tsx

import { useEffect } from 'react';
import StandardRetainerForm from './StandardRetainerForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { RetainerFormData } from '../../types/RetainerFormData';
import { defaultRetainerFormData } from '../../types/RetainerFormData';
import { normalizeRawFormData, normalizeFormData } from '../../utils/normalizeFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import { RetainerFieldConfig } from '@/types/RetainerFieldConfig';
import { FormType } from '@/types/FormType';
import { parseAndValidateRetainerForm } from '../../utils/parseAndValidateRetainerForm';
import { buildRetainerPreviewPayload } from '../../utils/buildRetainerPreviewPayload';
import { getSerializedClauses } from '../../utils/serializeClauses';

interface Props {
  schema: Record<string, RetainerFieldConfig>;
}

export default function StandardRetainerFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  const hydratedDefaults: RetainerFormData = {
    ...defaultRetainerFormData,
    startDate: formattedToday,
    endDate: formattedToday,
  };

  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
    setRawFormData,
  } = useSessionFormState<RetainerFormData>(
    'standardRetainerDraft',
    hydratedDefaults,
    normalizeRawFormData
  );

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState<RetainerFormData>(
    rawFormData,
    formData,
    setFormData,
    schema,
    FormType.StandardRetainer,
    parseAndValidateRetainerForm,
    buildRetainerPreviewPayload,
    getSerializedClauses,
    'retainerFormData'
  );

  const onChange = (field: keyof RetainerFormData, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('retainerFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);
    }
  }, []);

  return (
    <StandardRetainerForm
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
