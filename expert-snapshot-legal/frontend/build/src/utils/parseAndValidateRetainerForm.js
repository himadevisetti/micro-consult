import { standardRetainerSchema } from '../schemas/standardRetainerSchema.js';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils.js';
export function parseAndValidateRetainerForm(rawFormData) {
    const errors = {};
    const parsedRaw = {};
    for (const [key, config] of Object.entries(standardRetainerSchema)) {
        const field = key;
        const rawValue = rawFormData[field];
        let parsedValue = rawValue;
        if (config.type === 'number') {
            parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
        }
        if (config.type === 'string' || config.type === 'date') {
            parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        }
        parsedRaw[field] = parsedValue;
        if (config.required && isEmptyValue(parsedValue)) {
            errors[field] =
                field === 'startDate'
                    ? 'Start date must be selected.'
                    : field === 'endDate'
                        ? 'End date must be selected.'
                        : `${config.label} is required.`;
            console.log(`⚠️ [${field}] missing required value`);
            continue;
        }
        if (config.validate) {
            const normalized = normalizeForValidation(parsedValue, config.type);
            const parsedFormData = parsedRaw;
            const result = config.validate(normalized, parsedFormData);
            if (!result) {
                errors[field] = `${config.label} is invalid.`;
            }
        }
    }
    return {
        parsed: parsedRaw,
        errors,
    };
}
