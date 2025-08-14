// src/utils/validateRetainerForm.ts
import { standardRetainerSchema } from '../schemas/standardRetainerSchema';
import { formatDateMMDDYYYY } from './formatDate';
export function validateRetainerForm(formData) {
    const errors = {};
    for (const [key, config] of Object.entries(standardRetainerSchema)) {
        const field = key;
        const value = formData[field];
        // Required check
        if (config.required) {
            const isEmpty = value === null ||
                value === undefined ||
                (typeof value === 'string' && value.trim() === '') ||
                (typeof value === 'number' && isNaN(value)) ||
                (value instanceof Date && isNaN(value.getTime()));
            if (isEmpty) {
                errors[field] = `${config.label} is required.`;
                continue;
            }
        }
        // Schema-level custom validation
        if (config.validate) {
            const normalized = value instanceof Date
                ? formatDateMMDDYYYY(value)
                : typeof value === 'number'
                    ? value.toString()
                    : value ?? '';
            if (!config.validate(normalized, formData)) {
                errors[field] = `${config.label} is invalid.`;
            }
        }
    }
    return errors;
}
