// src/hooks/useSessionFormState.ts
import { useState, useEffect } from 'react';

export function useSessionFormState<T>(key: string, defaultData: T) {
  const [formData, setFormData] = useState<T>(() => {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultData;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(formData));
  }, [formData]);

  return [formData, setFormData] as const;
}

