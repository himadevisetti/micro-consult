// src/hooks/useSessionFormState.ts
import { useState, useEffect } from 'react';

/**
 * Generic session-backed form state hook for all flows.
 * Each flow provides its own normalizer (T -> T).
 */
export function useSessionFormState<T extends Record<string, any>>(
  sessionKey: string,
  initialState: T,
  normalize: (data: T) => T
) {
  const stored = sessionStorage.getItem(sessionKey);
  const hydrated = stored ? JSON.parse(stored) : {};

  const patched: T = {
    ...initialState,
    ...hydrated,
  };

  const [formData, setFormData] = useState<T>(patched);
  const [rawFormData, setRawFormData] = useState<T>(normalize(patched));

  useEffect(() => {
    setRawFormData(normalize(formData));
  }, [formData, normalize]);

  useEffect(() => {
    sessionStorage.setItem(sessionKey, JSON.stringify(formData));
  }, [formData, sessionKey]);

  // Keep these signatures aligned with existing forms (they pass strings from inputs)
  const handleChange = (name: keyof T, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: keyof T, value: string) => {
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
