// src/components/FormFlows/GenerateDocumentFlow.tsx

import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GenerateDocumentForm from './GenerateDocumentForm';
import { useRetainerState } from '../../hooks/useRetainerState';
import { useSessionFormState } from '../../hooks/useSessionFormState';
import type { ManifestVariable } from '@/types/manifest';
import { FormType } from '@/types/FormType';

import { parseAndValidateManifestForm } from '../../utils/parseAndValidateManifestForm';
import { useRequiredParam } from '../../hooks/useRequiredParam';
import { getDefaultValue } from '../../utils/getDefaultValue';
import { logError } from '../../utils/logger';
import { track } from '../../../track.js';

interface GenerateDocumentFlowProps {
  customerId: string; // 🔹 Provided by parent (decoded from session)
}

export default function GenerateDocumentFlow({ customerId }: GenerateDocumentFlowProps) {
  // 🔹 TemplateId is always required from route params
  const templateId = useRequiredParam('templateId');
  const navigate = useNavigate();

  const [variables, setVariables] = useState<ManifestVariable[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Prevent duplicate fetches
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // 🔹 Fetch manifest for this template
    fetch(`/api/templates/${customerId}/${templateId}/manifest`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch manifest');
        return res.json();
      })
      .then((data) => {
        setVariables(data.manifest?.variables || []);
        // 🔹 Persist identifiers in sessionStorage
        sessionStorage.setItem('customerId', customerId);
        sessionStorage.setItem('templateId', templateId);
      })
      .catch((err) => {
        logError("GenerateDocumentFlow.loadManifest.error", { error: String(err) });
        setVariables([]);
      })
      .finally(() => setLoading(false));
  }, [customerId, templateId]);

  // 🔹 Compute defaults for variables
  const hydratedDefaults: Record<string, string> = useMemo(
    () =>
      variables.reduce((acc, v) => {
        acc[v.schemaField] = getDefaultValue(v);
        return acc;
      }, {} as Record<string, string>),
    [variables]
  );

  // 🔹 Clear draft state on hard reload
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
    sessionStorage.removeItem('generateDocumentDraft');
    sessionStorage.removeItem('generateDocumentFormData');
  }

  // 🔹 Session-backed form state
  const {
    formData,
    rawFormData,
    setFormData,
    setRawFormData,
  } = useSessionFormState<Record<string, string>>(
    'generateDocumentDraft',
    hydratedDefaults,
    (data) => data
  );

  // 🔹 Hydrate defaults once variables arrive
  useEffect(() => {
    if (variables.length > 0) {
      setFormData((prev) => ({ ...hydratedDefaults, ...prev }));
      setRawFormData((prev) => ({ ...hydratedDefaults, ...prev }));
    }
  }, [variables, hydratedDefaults, setFormData, setRawFormData]);

  // 🔹 Hook for validation + touched state
  const { handleSubmit: baseHandleSubmit, markTouched } = useRetainerState<Record<string, string>>(
    rawFormData,
    formData,
    setFormData,
    {}, // schema not used here
    FormType.CustomTemplateGenerate,
    (raw) => parseAndValidateManifestForm(raw, variables),
    () => ({ metadata: {} }),
    () => ({}),
    'generateDocumentFormData'
  );

  // 🔹 Submit handler
  const handleSubmit = async (values: Record<string, string>) => {
    // Track submission intent
    await track("document_generate_submitted", {
      customerId,
      templateId,
      fieldCount: Object.keys(values).length,
    });

    try {
      const res = await fetch(
        `/api/templates/${customerId}/${templateId}/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variables: values, format: 'html' }),
        }
      );

      if (!res.ok) {
        throw new Error(`Generate failed: ${res.statusText}`);
      }

      const data = await res.json();

      // Track successful generation
      await track("document_generate_completed", {
        customerId,
        templateId,
        fieldCount: Object.keys(values).length,
      });

      // Navigate to preview
      navigate(`/preview/${FormType.CustomTemplateGenerate}`, {
        state: {
          formData: values,
          previewHtml: data.previewHtml,
          metadata: data.metadata,
          customerId,
          templateId,
        },
      });
    } catch (err) {
      logError("GenerateDocumentFlow.generate.error", { error: String(err) });
    }

    baseHandleSubmit(values);
  };

  // 🔹 Restore saved form data if present
  useEffect(() => {
    const saved = sessionStorage.getItem('generateDocumentFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
      setRawFormData(parsed);
    }
  }, [setFormData, setRawFormData]);

  if (loading) {
    return <div>Loading manifest…</div>;
  }

  return (
    <GenerateDocumentForm
      variables={variables}
      formData={formData}
      rawFormData={rawFormData}
      setFormData={setFormData}
      onRawChange={(field, value) => setRawFormData((prev) => ({ ...prev, [field]: value }))}
      onBlur={(field, value) => setRawFormData((prev) => ({ ...prev, [field]: value }))}
      markTouched={markTouched}
      onSubmit={handleSubmit}
    />
  );
}
