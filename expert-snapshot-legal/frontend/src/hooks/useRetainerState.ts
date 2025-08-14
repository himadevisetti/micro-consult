// src/hooks/useRetainerState.ts

import { useState } from 'react';
import { validateRetainerForm } from '../utils/validateRetainerForm';
import { buildRetainerPreviewPayload } from '../utils/buildRetainerPreviewPayload';
import type { RetainerFormData } from '../types/RetainerFormData';
import { defaultRetainerFormData } from '../types/RetainerFormData';

// Placeholder renderer — replace with SSR or styled HTML builder
function renderRetainerPreview(payload: ReturnType<typeof buildRetainerPreviewPayload>): string {
  return payload.clauses.map(c => `<p><strong>${c.id}:</strong> ${c.text}</p>`).join('');
}

export type RetainerFormErrors = Partial<Record<keyof RetainerFormData, string>>;

export function useRetainerState() {
  const [formData, setFormData] = useState<RetainerFormData>(defaultRetainerFormData);

  const [errors, setErrors] = useState<RetainerFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RetainerFormData, boolean>>>({});

  const [previewHtml, setPreviewHtml] = useState<string>('');

  const validate = () => {
    const result = validateRetainerForm(formData);
    setErrors(result);
    return Object.keys(result).length === 0;
  };

  const markTouched = (field: keyof RetainerFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const updateField = (field: keyof RetainerFormData, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePreview = () => {
    const isValid = validate();
    if (!isValid) return;

    const payload = buildRetainerPreviewPayload(formData);
    const html = renderRetainerPreview(payload);
    setPreviewHtml(html);
  };

  const handleSubmit = () => {
    const isValid = validate();
    if (!isValid) {
      console.warn('Form submission blocked due to validation errors:', errors);
      return;
    }

    generatePreview();
    console.log('Form submitted successfully:', formData);
  };

  return {
    formData,
    errors,
    touched,
    updateField,
    markTouched,
    validate,
    generatePreview,
    handleSubmit,
    previewHtml,
  };
}
