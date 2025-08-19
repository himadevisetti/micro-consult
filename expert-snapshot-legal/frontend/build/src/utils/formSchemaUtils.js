// src/utils/getDefaultRawFormData.ts
import { standardRetainerSchema } from '../schemas/standardRetainerSchema';
export function getDefaultRawFormData() {
    const defaults = {};
    for (const key in standardRetainerSchema) {
        const config = standardRetainerSchema[key];
        defaults[key] = config.default ?? '';
    }
    return defaults;
}
export function normalizeForValidation(value, type) {
    const str = typeof value === 'string' ? value.trim() : String(value ?? '');
    if (type === 'number') {
        return /^\d+(\.\d{1,2})?$/.test(str) ? str : '';
    }
    if (type === 'date') {
        return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : '';
    }
    console.log(`[normalizeForValidation] type="${type}", value=`, value, '→ normalized=', str);
    return str;
}
export function isEmptyValue(value) {
    return (value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (typeof value === 'number' && isNaN(value)) ||
        (value instanceof Date && isNaN(value.getTime())));
}
