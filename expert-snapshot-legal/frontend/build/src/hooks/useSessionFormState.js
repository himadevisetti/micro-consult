// src/hooks/useSessionFormState.ts
import { useState, useEffect } from 'react';
export function useSessionFormState(key, defaultData) {
    const [formData, setFormData] = useState(() => {
        const saved = sessionStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultData;
    });
    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(formData));
    }, [formData]);
    return [formData, setFormData];
}
