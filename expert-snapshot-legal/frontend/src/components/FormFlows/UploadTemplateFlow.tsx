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

  // 🔹 Return a result object instead of just setting error/navigating
  const handleConfirmMapping = async (
    finalMapping: NormalizedMapping[]
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!templateId) {
      const msg = "No templateId available — upload step must complete first.";
      setError(msg);
      return { ok: false, error: msg };
    }

    const url = `/api/templates/${customerId}/${templateId}/confirm-mapping`;

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
        logError("confirmMapping.apiError", {
          url,
          status: res.status,
          statusText: res.statusText,
        });
        const msg = `Failed to save mapping: ${res.statusText}`;
        setError(msg);
        return { ok: false, error: msg };
      }

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

      return { ok: true };
    } catch (err: any) {
      logError("confirmMapping.apiError", {
        url,
        message: err?.message,
        stack: err?.stack,
      });
      const msg = err.message || "Failed to save mapping";
      setError(msg);
      return { ok: false, error: msg };
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
