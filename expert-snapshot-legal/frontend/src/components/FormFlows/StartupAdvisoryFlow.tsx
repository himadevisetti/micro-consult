// src/components/FormFlows/StartupAdvisoryFlow.tsx

import { useEffect } from 'react';
import StartupAdvisoryForm from './StartupAdvisoryForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { StartupAdvisoryFormData } from '../../types/StartupAdvisoryFormData';
import { defaultStartupAdvisoryFormData } from '../../types/StartupAdvisoryFormData';
import {
  normalizeRawStartupAdvisoryFormData,
  normalizeStartupAdvisoryFormData
} from '../../utils/normalizeStartupAdvisoryFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import { StartupAdvisoryFieldConfig } from '@/types/StartupAdvisoryFieldConfig';
import { FormType } from '@/types/FormType';
import { parseAndValidateStartupAdvisoryForm } from '../../utils/parseAndValidateStartupAdvisoryForm';
// You’ll need to implement these two for Startup Advisory, similar to IPR&L:
import { buildStartupAdvisoryPreviewPayload } from '../../utils/buildStartupAdvisoryPreviewPayload';
import { getSerializedStartupAdvisoryClauses } from '../../utils/serializeStartupAdvisoryClauses';

interface Props {
  schema: Record<string, StartupAdvisoryFieldConfig>;
}

export default function StartupAdvisoryFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  const hydratedDefaults: StartupAdvisoryFormData = {
    ...defaultStartupAdvisoryFormData,
    effectiveDate: formattedToday,
    vestingStartDate: formattedToday,
    dateSigned: formattedToday
  };

  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
    setRawFormData,
  } = useSessionFormState<StartupAdvisoryFormData>(
    'startupAdvisoryDraft',
    hydratedDefaults,
    normalizeRawStartupAdvisoryFormData
  );

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState<StartupAdvisoryFormData>(
    rawFormData,
    formData,
    setFormData,
    schema,
    FormType.StartupAdvisory,
    parseAndValidateStartupAdvisoryForm,
    buildStartupAdvisoryPreviewPayload,
    getSerializedStartupAdvisoryClauses,
    'startupAdvisoryFormData'
  );

  const onChange = (
    field: keyof StartupAdvisoryFormData,
    value: string | number | boolean | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('startupAdvisoryFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeStartupAdvisoryFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);
    }
  }, []);

  return (
    <StartupAdvisoryForm
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

