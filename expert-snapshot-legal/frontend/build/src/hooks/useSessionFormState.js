import { useState, useEffect } from 'react';
import { formatDateYYYYMMDD } from '../utils/formatDate.js';
import { getDefaultRawFormData } from '../utils/formSchemaUtils.js';
import { standardRetainerSchema } from '../schemas/standardRetainerSchema.js';
function parseManualDateAsUTC(input) {
    const trimmed = input.trim();
    // MM/DD/YYYY
    if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length === 3) {
            const [month, day, year] = parts;
            const parsed = new Date(Date.UTC(+year, +month - 1, +day));
            return isNaN(parsed.getTime()) ? undefined : parsed;
        }
        if (parts.length === 2) {
            const [month, day] = parts;
            const year = new Date().getUTCFullYear();
            const parsed = new Date(Date.UTC(year, +month - 1, +day));
            return isNaN(parsed.getTime()) ? undefined : parsed;
        }
    }
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [year, month, day] = trimmed.split('-').map(Number);
        const parsed = new Date(Date.UTC(year, month - 1, day));
        return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    // MM-DD-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
        const [month, day, year] = trimmed.split('-').map(Number);
        const parsed = new Date(Date.UTC(year, month - 1, day));
        return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return undefined;
}
export function useSessionFormState(sessionKey, initialState) {
    const [formData, setFormData] = useState(() => {
        const stored = sessionStorage.getItem(sessionKey);
        return stored ? JSON.parse(stored) : initialState;
    });
    const [rawFormData, setRawFormData] = useState({});
    useEffect(() => {
        const schemaDefaults = getDefaultRawFormData();
        const hydrated = Object.fromEntries(Object.entries(schemaDefaults).map(([key, val]) => {
            const config = standardRetainerSchema[key];
            if (config?.type === 'date') {
                const parsed = parseManualDateAsUTC(val);
                return [key, parsed ? formatDateYYYYMMDD(parsed) : val];
            }
            return [key, val];
        }));
        setRawFormData(prev => ({ ...hydrated, ...prev }));
    }, []);
    useEffect(() => {
        const serialized = {};
        for (const field in formData) {
            const value = formData[field];
            if (typeof value === 'string') {
                serialized[field] = value;
            }
        }
        sessionStorage.setItem(sessionKey, JSON.stringify(serialized));
    }, [formData, sessionKey]);
    const handleChange = (name, value) => {
        setRawFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleBlur = (name, value) => {
        setRawFormData((prev) => ({ ...prev, [name]: value }));
    };
    return {
        formData,
        rawFormData,
        setFormData,
        handleChange,
        handleBlur,
    };
}
