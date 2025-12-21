import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormType } from '@/types/FormType';
import { formatRetainerTitle } from '@/utils/formatTitle';

/**
 * Generic hook for managing form state, validation, and preview generation.
 * Works across all flows by accepting flow-specific logic.
 */
export function useRetainerState<T extends Record<string, any>>(
  rawFormData: T,
  formData: T,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  schema: Record<string, any>,
  formType: FormType,
  validateForm: (
    raw: T,
    schema: Record<string, any>
  ) => { parsed: T; errors: Partial<Record<keyof T, string>> },
  buildPreviewPayload: (
    formData: T,
    schema: Record<string, any>
  ) => { metadata: Record<string, string> },
  getSerializedClauses: (formData: T) => Record<string, React.ReactNode>,
  sessionStorageKey: string
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const markTouched = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const updateField = (
    field: keyof T,
    value: string | number | boolean | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatePreview = async (): Promise<string> => {
    const payload = buildPreviewPayload(formData, schema);
    setMetadata(payload.metadata);

    const clauseHtmlMap = getSerializedClauses(formData);

    const html = `
      <div style="margin-top:60px;">
        <h2 style="text-align:center; font-weight:bold;">
          ${formatRetainerTitle(formType)}
        </h2>
      </div>
      ${Object.values(clauseHtmlMap).join('\n')}`;

    setPreviewHtml(html);
    return html;
  };

  const handleSubmit = async (raw: T) => {
    const { parsed, errors } = validateForm(raw, schema);
    setFormData(parsed);
    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.warn('Form submission blocked due to validation errors:', errors);
      return;
    }

    const html = await generatePreview();
    const payload = parsed;

    sessionStorage.setItem(sessionStorageKey, JSON.stringify(payload));
    console.log('Form submitted successfully:', payload);

    // Only navigate for non-CustomTemplateGenerate flows
    if (formType !== FormType.CustomTemplateGenerate) {
      navigate(`/preview/${formType}`, {
        state: {
          formData: payload,
          previewHtml: html,
          metadata,
        },
      });
    }
  };

  return {
    updateField,
    errors,
    touched,
    markTouched,
    generatePreview,
    handleSubmit,
    previewHtml,
    metadata,
    setErrors,
    setTouched,
  };
}
