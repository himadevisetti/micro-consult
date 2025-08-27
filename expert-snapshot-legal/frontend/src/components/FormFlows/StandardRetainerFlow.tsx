// src/components/FormFlows/StandardRetainerFlow.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardRetainerForm from './StandardRetainerForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { RetainerFormData } from '../../types/RetainerFormData';
import { defaultRetainerFormData } from '../../types/RetainerFormData';
import { normalizeFormData } from '../../utils/normalizeFormData';
import { formatDateMMDDYYYY } from '../../utils/formatDate';
import PageLayout from '../PageLayout';
import styles from '../../styles/StandardRetainerForm.module.css';

export default function StandardRetainerFlow() {
  const navigate = useNavigate();
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
  } = useSessionFormState('standardRetainerDraft', hydratedDefaults);

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState(rawFormData, formData, setFormData);

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
