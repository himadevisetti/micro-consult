import { useState, useEffect } from 'react';
import type { RetainerFormData } from '../types/RetainerFormData';
import { normalizeRawFormData } from '../utils/normalizeFormData';

export function useSessionFormState(
  sessionKey: string,
  initialState: RetainerFormData
) {
  const stored = sessionStorage.getItem(sessionKey);
  const hydrated = stored ? JSON.parse(stored) : {};

  const patched: RetainerFormData = {
    ...initialState,
    ...hydrated,
  };

  const [formData, setFormData] = useState<RetainerFormData>(patched);
  const [rawFormData, setRawFormData] = useState<RetainerFormData>(
    normalizeRawFormData(patched)
  );

  useEffect(() => {
    setRawFormData(normalizeRawFormData(formData));
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem(sessionKey, JSON.stringify(formData));
  }, [formData, sessionKey]);

  const handleChange = (
    name: keyof RetainerFormData,
    value: RetainerFormData[keyof RetainerFormData]
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    name: keyof RetainerFormData,
    value: RetainerFormData[keyof RetainerFormData]
  ) => {
    setRawFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    rawFormData,
    setFormData,
    setRawFormData,
    handleChange,
    handleBlur,
  };
}
