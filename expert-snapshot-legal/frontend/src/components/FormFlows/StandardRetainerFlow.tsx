// src/components/FormFlows/StandardRetainerFlow.tsx

import React from 'react';
import StandardRetainerForm from './StandardRetainerForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { RetainerFormData } from '../../types/RetainerFormData';
import { defaultRetainerFormData } from '../../types/RetainerFormData';

export default function StandardRetainerFlow() {
  const {
    formData,
    rawFormData,
    handleChange: onRawChange,
    handleBlur,
    setFormData,
  } = useSessionFormState<RetainerFormData>('standardRetainerDraft', defaultRetainerFormData);

  const {
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState(rawFormData, formData, setFormData);

  const onChange = (field: keyof RetainerFormData, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateField(field, value); // Keep validation state in sync
  };

  return (
    <div className="flow-container" style={{ padding: '2rem' }}>
      <div className="form-section">
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
      </div>
    </div>
  );
}
