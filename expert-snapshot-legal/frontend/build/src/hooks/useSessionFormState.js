import { useState, useEffect } from 'react';
import { normalizeRawFormData } from '../utils/normalizeFormData';
export function useSessionFormState(sessionKey, initialState) {
    const stored = sessionStorage.getItem(sessionKey);
    const hydrated = stored ? JSON.parse(stored) : {};
    const patched = {
        ...initialState,
        ...hydrated,
    };
    const [formData, setFormData] = useState(patched);
    const [rawFormData, setRawFormData] = useState(normalizeRawFormData(patched));
    useEffect(() => {
        setRawFormData(normalizeRawFormData(formData));
    }, [formData]);
    useEffect(() => {
        sessionStorage.setItem(sessionKey, JSON.stringify(formData));
    }, [formData, sessionKey]);
    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleBlur = (name, value) => {
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
