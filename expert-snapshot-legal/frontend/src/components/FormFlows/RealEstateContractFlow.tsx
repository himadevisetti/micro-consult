// src/components/FormFlows/RealEstateContractFlow.tsx

import { useEffect } from 'react';
import RealEstateContractForm from './RealEstateContractForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { RealEstateContractFormData } from '../../types/RealEstateContractFormData';
import { defaultRealEstateContractFormData } from '../../types/RealEstateContractFormData';
import {
  normalizeRawRealEstateContractFormData,
  normalizeRealEstateContractFormData
} from '../../utils/normalizeRealEstateContractFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import { RealEstateContractFieldConfig } from '@/types/RealEstateContractFieldConfig';
import { FormType } from '@/types/FormType';
import { parseAndValidateRealEstateContractForm } from '../../utils/parseAndValidateRealEstateContractForm';
import { buildRealEstateContractPreviewPayload } from '../../utils/buildRealEstateContractPreviewPayload';
import { getSerializedRealEstateContractClauses } from '../../utils/serializeRealEstateContractClauses';

interface Props {
  schema: Record<string, RealEstateContractFieldConfig>;
}

export default function RealEstateContractFlow({ schema }: Props) {
  const today = new Date();
  const formattedToday = formatDateMMDDYYYY(today);

  const hydratedDefaults: RealEstateContractFormData = {
    ...defaultRealEstateContractFormData,
    executionDate: formattedToday,
    ...(defaultRealEstateContractFormData.contractType === 'Lease' && {
      leaseStartDate: formattedToday,
      leaseEndDate: formatDateMMDDYYYY(
        new Date(today.setFullYear(today.getFullYear() + 1))
      ),
    }),
    ...(defaultRealEstateContractFormData.contractType === 'Purchase' && {
      closingDate: formatDateMMDDYYYY(
        new Date(today.setDate(today.getDate() + 30))
      ),
      possessionDate: formatDateMMDDYYYY(
        new Date(today.setDate(today.getDate() + 31))
      ),
    }),
    ...(defaultRealEstateContractFormData.contractType === 'Listing' && {
      listingStartDate: formattedToday,
      listingExpirationDate: formatDateMMDDYYYY(
        new Date(today.setDate(today.getDate() + 90))
      ),
    }),
    ...(defaultRealEstateContractFormData.contractType === 'Option' && {
      optionExpirationDate: formatDateMMDDYYYY(
        new Date(today.setMonth(today.getMonth() + 6))
      ),
    }),
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
    sessionStorage.removeItem('realEstateContractDraft');
    sessionStorage.removeItem('realEstateContractFormData');
  }

  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
    setRawFormData,
  } = useSessionFormState<RealEstateContractFormData>(
    'realEstateContractDraft',
    hydratedDefaults,
    normalizeRawRealEstateContractFormData
  );

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState<RealEstateContractFormData>(
    rawFormData,
    formData,
    setFormData,
    schema,
    FormType.RealEstateContract,
    parseAndValidateRealEstateContractForm,
    buildRealEstateContractPreviewPayload,
    getSerializedRealEstateContractClauses,
    'realEstateContractFormData'
  );

  const onChange = (
    field: keyof RealEstateContractFormData,
    value: string | number | boolean | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateField(field, value);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('realEstateContractFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const hydrated = normalizeRealEstateContractFormData(parsed);

      setFormData(hydrated);
      setRawFormData(hydrated);
    }
  }, []);

  return (
    <RealEstateContractForm
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
