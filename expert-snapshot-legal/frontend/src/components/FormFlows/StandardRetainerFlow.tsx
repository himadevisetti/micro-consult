// src/components/FormFlows/StandardRetainerFlow.tsx

import React from 'react';
import StandardRetainerForm from './StandardRetainerForm';
import { useRetainerState } from '../../hooks/useRetainerState';

export default function StandardRetainerFlow() {
  const {
    formData,
    updateField,
    errors,
    touched,
    markTouched,
    handleSubmit,
  } = useRetainerState();

  return (
    <div className="flow-container" style={{ padding: '2rem' }}>
      <div className="form-section">
        <StandardRetainerForm
          formData={formData}
          onChange={updateField}
          errors={errors}
          touched={touched}
          markTouched={markTouched}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
