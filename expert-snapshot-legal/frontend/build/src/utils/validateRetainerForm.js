import { standardRetainerSchema } from '../schemas/standardRetainerSchema';
function isInvalidDate(value) {
    return value instanceof Date && isNaN(value.getTime());
}
function normalizeManualDate(input) {
    if (typeof input === 'string') {
        const trimmed = input.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        }
        const parts = trimmed.split('/');
        if (parts.length === 3) {
            const [month, day, year] = parts;
            return new Date(Date.UTC(+year, +month - 1, +day));
        }
        if (parts.length === 2) {
            const [month, day] = parts;
            const year = new Date().getUTCFullYear();
            return new Date(Date.UTC(+year, +month - 1, +day));
        }
    }
    return undefined;
}
export function validateRetainerForm(formData) {
    console.log('Raw formData:', JSON.stringify(formData, null, 2));
    const errors = {};
    // Build parsedFormData with normalized values
    const parsedFormData = {};
    for (const [key, config] of Object.entries(standardRetainerSchema)) {
        const field = key;
        const rawValue = formData[field];
        let parsedValue = rawValue;
        if (typeof rawValue === 'string' && config.type === 'date') {
            const corrected = normalizeManualDate(rawValue);
            parsedValue = corrected && !isInvalidDate(corrected) ? corrected : rawValue;
        }
        parsedFormData[field] = parsedValue;
        console.log('Parsed formData:', parsedFormData);
        // Required field check
        const isEmpty = parsedValue === null ||
            parsedValue === undefined ||
            (typeof parsedValue === 'string' && parsedValue.trim() === '') ||
            (typeof parsedValue === 'number' && isNaN(parsedValue)) ||
            isInvalidDate(parsedValue) ||
            (parsedValue instanceof Date && parsedValue.getTime() === 0);
        if (config.required && isEmpty) {
            errors[field] =
                field === 'startDate'
                    ? 'Start date must be selected.'
                    : field === 'endDate'
                        ? 'End date must be selected.'
                        : `${config.label} is required.`;
            continue;
        }
        // Schema-level custom validation
        if (config.validate) {
            const normalized = config.type === 'date' && parsedValue instanceof Date && !isInvalidDate(parsedValue)
                ? parsedValue.toISOString().slice(0, 10) // YYYY-MM-DD
                : typeof parsedValue === 'number'
                    ? parsedValue.toString()
                    : typeof parsedValue === 'string'
                        ? parsedValue.trim()
                        : '';
            console.log('Validating:', field, '→', normalized);
            console.log('Validation result:', config.validate(normalized, formData));
            if (!config.validate(normalized, formData)) {
                errors[field] = `${config.label} is invalid.`;
            }
        }
    }
    // ✅ Cross-field validation: endDate must be after startDate
    const start = parsedFormData.startDate;
    const end = parsedFormData.endDate;
    if (start instanceof Date &&
        end instanceof Date &&
        !isInvalidDate(start) &&
        !isInvalidDate(end) &&
        end.getTime() <= start.getTime()) {
        errors.endDate = 'End date must be after start date.';
    }
    return errors;
}
