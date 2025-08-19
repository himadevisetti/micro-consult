import { standardRetainerSchema } from '../schemas/standardRetainerSchema.js';
import { normalizeForValidation, isEmptyValue } from '../utils/formSchemaUtils.js';
import { normalizeFormDates } from '../utils/normalizeFormDates.js';
export function parseAndValidateRetainerForm(rawFormData) {
    const errors = {};
    const normalizedFormData = normalizeFormDates(rawFormData, ['startDate', 'endDate']);
    const parsedRaw = {};
    console.log('🔍 Raw form data:', rawFormData);
    // 🔎 Audit schema types
    for (const [key, config] of Object.entries(standardRetainerSchema)) {
        console.log(`[Schema Audit] ${key} → type="${config.type}"`);
    }
    for (const [key, config] of Object.entries(standardRetainerSchema)) {
        const field = key;
        // 🔎 Log field access explicitly
        const rawValue = normalizedFormData[field] ?? rawFormData[field];
        console.log(`🧪 [${field}] rawValue =`, rawValue);
        let parsedValue = rawValue;
        if (config.type === 'number') {
            parsedValue = rawValue !== undefined ? Number(rawValue) : undefined;
            console.log(`🔢 [${field}] parsed number:`, parsedValue);
        }
        if (config.type === 'string' || config.type === 'date') {
            parsedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
            console.log(`🔤 [${field}] normalized string:`, parsedValue);
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
            console.log(`🔍 [${field}] validate input: raw="${rawValue}", normalized="${normalized}"`);
            const result = config.validate(normalized, parsedFormData);
            console.log(`✅ [${field}] validation result:`, result);
            if (!result) {
                errors[field] = `${config.label} is invalid.`;
            }
        }
    }
    const parsedFormData = parsedRaw;
    if (!errors.startDate && !errors.endDate) {
        const start = normalizeForValidation(parsedFormData.startDate, 'date');
        const end = normalizeForValidation(parsedFormData.endDate, 'date');
        if (start && end && end <= start) {
            errors.endDate = 'End date must be after start date.';
        }
    }
    console.log('✅ Final parsed form:', parsedFormData);
    console.log('🧾 Validation errors:', errors);
    return {
        parsed: parsedFormData,
        errors,
    };
}
