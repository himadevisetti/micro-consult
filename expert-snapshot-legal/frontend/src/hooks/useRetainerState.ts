// src/hooks/useRetainerState.ts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseAndValidateRetainerForm } from '../utils/parseAndValidateRetainerForm';
import { buildRetainerPreviewPayload } from '../utils/buildRetainerPreviewPayload';
import { getSerializedClauses } from '../utils/serializeClauses';
import type { RetainerFormData } from '../types/RetainerFormData';

export type RetainerFormErrors = Partial<Record<keyof RetainerFormData, string>>;

export function useRetainerState(
  rawFormData: Record<string, string>,
  formData: RetainerFormData,
  setFormData: React.Dispatch<React.SetStateAction<RetainerFormData>>
) {
  const [errors, setErrors] = useState<RetainerFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RetainerFormData, boolean>>>({});
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  function validate(rawFormData?: Record<string, string>) {
    if (!rawFormData) {
      throw new Error('rawFormData is undefined during submission');
    }
    const { parsed, errors } = parseAndValidateRetainerForm(rawFormData);
    setFormData(parsed);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const markTouched = (field: keyof RetainerFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const updateField = (field: keyof RetainerFormData, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePreview = async (): Promise<string> => {
    const payload = buildRetainerPreviewPayload(formData);
    setMetadata(payload.metadata);

    const clauseHtmlMap = getSerializedClauses(formData);
    const html = `
      <div style="margin-top:60px;">
        <h2 style="text-align:center; font-weight:bold;">STANDARD RETAINER AGREEMENT</h2>
      </div>
      ${Object.values(clauseHtmlMap).join('\n')}`;

    setPreviewHtml(html);
    return html;
  };

  const handleSubmit = async (rawFormData: Record<string, string>) => {

    const isValid = validate(rawFormData);
    if (!isValid) {
      console.warn('Form submission blocked due to validation errors:', errors);
      return;
    }

    const html = await generatePreview();
    const payload = rawFormData;

    console.log('Form submitted successfully:', payload);

    navigate('/standard-retainer/preview', {
      state: {
        formData: payload,
        previewHtml: html,
        metadata,
      },
    });
  };

  return {
    updateField,
    errors,
    touched,
    markTouched,
    validate,
    generatePreview,
    handleSubmit,
    previewHtml,
    metadata,
  };
}
