// src/components/FormFlows/UploadTemplateFlow.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadTemplatePage from './UploadTemplatePage';
import FieldMappingReview from '../FieldMappingReview';
import { TemplateVariable } from '../../types/templates';
import { NormalizedMapping } from '../../types/confirmMapping';
import { logDebug, logError } from "../../utils/logger.js";
import styles from '../../styles/StandardRetainerForm.module.css';

interface Props {
  customerId: string;
}

export default function UploadTemplateFlow({ customerId }: Props) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<TemplateVariable[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleUploadComplete = (
    newTemplateId: string,
    newTemplateName: string,
    detected: TemplateVariable[]
  ) => {
    setTemplateId(newTemplateId);
    setTemplateName(newTemplateName);
    setCandidates(detected);
    setError(null);
  };

  const handleConfirmMapping = async (finalMapping: NormalizedMapping[]) => {
    if (!templateId) {
      setError("No templateId available — upload step must complete first.");
      return;
    }

    const url = `/api/templates/${customerId}/${templateId}/confirm-mapping`;

    // Log API request context (endpoint + summary, not full payload again)
    logDebug("confirmMapping.apiRequest", {
      url,
      fieldCount: finalMapping.length,
      fields: finalMapping.map((m) => m.schemaField),
    });

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalMapping),
      });

      if (!res.ok) {
        // Log error context before throwing
        logError("confirmMapping.apiError", {
          url,
          status: res.status,
          statusText: res.statusText,
        });
        throw new Error(`Failed to save mapping: ${res.statusText}`);
      }

      // ✅ Success log
      logDebug("confirmMapping.apiSuccess", {
        url,
        fieldCount: finalMapping.length,
        templateId,
        templateName,
      });

      // Navigate back to Custom Template landing screen
      navigate("/form/custom-template", {
        state: { success: true, templateId, templateName },
      });
    } catch (err: any) {
      // Log unexpected errors (network, JSON, etc.)
      logError("confirmMapping.apiError", {
        url,
        message: err?.message,
        stack: err?.stack,
      });
      setError(err.message || "Failed to save mapping");
    }
  };

  return (
    <div className={styles.pageContainer}>
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
