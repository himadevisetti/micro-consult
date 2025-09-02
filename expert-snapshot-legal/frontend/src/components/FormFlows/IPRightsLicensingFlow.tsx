// src/components/FormFlows/IPRightsLicensingFlow.tsx

import { useEffect } from 'react';
import IPRightsLicensingForm from './IPRightsLicensingForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { IPRightsLicensingFormData } from '../../types/IPRightsLicensingFormData';
import { defaultIPRightsLicensingFormData } from '../../types/IPRightsLicensingFormData';
import { normalizeRawIPFormData, normalizeIPFormData } from '../../utils/normalizeIPFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import { IPRetainerFieldConfig } from '@/types/IPRetainerFieldConfig';
import { FormType } from '@/types/FormType';
import { parseAndValidateIPForm } from '../../utils/parseAndValidateIPForm';
import { buildIPPreviewPayload } from '../../utils/buildIPPreviewPayload';
import { getSerializedIPClauses } from '../../utils/serializeIPClauses';


interface Props {
  schema: Record<string, IPRetainerFieldConfig>;
}

export default function IPRightsLicensingFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  const hydratedDefaults: IPRightsLicensingFormData = {
    ...defaultIPRightsLicensingFormData,
    effectiveDate: formattedToday,
    executionDate: formattedToday,
    expirationDate: formattedToday,
  };

  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
    setRawFormData,
  } = useSessionFormState<IPRightsLicensingFormData>(
    'ipRightsLicensingDraft',
    hydratedDefaults,
    normalizeRawIPFormData
  );

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState<IPRightsLicensingFormData>(
    rawFormData,
    formData,
    setFormData,
    schema,
    FormType.IPRightsLicensing,
    parseAndValidateIPForm,
    buildIPPreviewPayload,
    getSerializedIPClauses,
    'ipRightsLicensingFormData'
  );

  const onChange = (field: keyof IPRightsLicensingFormData, value: string | number | boolean | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('ipRightsLicensingFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeIPFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);
    }
  }, []);

  return (
    <IPRightsLicensingForm
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

