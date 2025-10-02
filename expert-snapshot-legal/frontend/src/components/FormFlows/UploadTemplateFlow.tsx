// src/components/FormFlows/UploadTemplateFlow.tsx
import React, { useState } from 'react';
import UploadTemplatePage from './UploadTemplatePage';
import FieldMappingReview from '../FieldMappingReview';
import { TemplateVariable } from '../../types/templates';
import styles from '../../styles/StandardRetainerForm.module.css';

interface Props {
  customerId: string;
}

export default function UploadTemplateFlow({ customerId }: Props) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<TemplateVariable[] | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Upload step now receives enriched candidates
  const handleUploadComplete = (
    newTemplateId: string,
    newTemplateName: string,
    detected: TemplateVariable[]
  ) => {
    setTemplateId(newTemplateId);
    setTemplateName(newTemplateName);
    setCandidates(detected); // detected includes rawValue, schemaField, confidence, etc.
    setSuccess(false);
    setError(null);
  };

  // ✅ Confirm mapping posts enriched mapping back to backend
  const handleConfirmMapping = async (finalMapping: TemplateVariable[]) => {
    if (!templateId) {
      setError('No templateId available — upload step must complete first.');
      return;
    }

    try {
      const res = await fetch(
        `/api/templates/${customerId}/${templateId}/confirm-mapping`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mapping: finalMapping }),
        }
      );

      if (!res.ok) throw new Error(`Failed to save mapping: ${res.statusText}`);

      setSuccess(true);
      setTemplateId(null);
      setTemplateName(null);
      setCandidates(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save mapping');
    }
  };

  return (
    <div className={styles.pageContainer}>
      {success && (
        <div className={styles.successBanner}>
          ✅ Template mapping saved successfully
        </div>
      )}
      {error && <div className={styles.errorBanner}>❌ {error}</div>}

      {!candidates ? (
        <UploadTemplatePage
          customerId={customerId}
          onUploadComplete={handleUploadComplete}
        />
      ) : (
        <FieldMappingReview
          templateName={templateName}
          candidates={candidates}
          onConfirm={handleConfirmMapping}
        />
      )}
    </div>
  );
}
