/**
 * Normalize incoming raw data into canonical form for storage/state.
 * Dates are preserved as ISO strings.
 */
export function normalizeFormData(raw) {
    return {
        providerName: String(raw.providerName ?? ''),
        clientName: String(raw.clientName ?? ''),
        feeAmount: Number(raw.feeAmount ?? 0),
        feeStructure: raw.feeStructure,
        retainerAmount: raw.retainerAmount !== undefined ? Number(raw.retainerAmount) : undefined,
        startDate: typeof raw.startDate === 'string' ? raw.startDate : '',
        endDate: typeof raw.endDate === 'string' ? raw.endDate : '',
        matterDescription: String(raw.matterDescription ?? ''),
        jurisdiction: raw.jurisdiction ?? 'California',
    };
}
/**
 * Normalize form data for validation or display.
 * Dates are coerced into `yyyy-mm-dd` format if valid.
 */
export function normalizeRawFormData(data) {
    const normalized = {};
    for (const key in data) {
        const field = key;
        const value = data[field];
        if (field === 'startDate' || field === 'endDate') {
            normalized[field] = normalizeDate(value);
        }
        else {
            assign(normalized, field, value);
        }
    }
    return normalized;
}
function assign(target, key, value) {
    target[key] = value;
}
/**
 * Coerces a date string into ISO format (`yyyy-mm-dd`) if valid.
 * Accepts either ISO or `MM/DD/YYYY` format.
 */
function normalizeDate(input) {
    if (typeof input !== 'string')
        return '';
    // Already ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(input))
        return input;
    // Try MM/DD/YYYY
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
    if (match) {
        const [, mm, dd, yyyy] = match;
        return `${yyyy}-${mm}-${dd}`;
    }
    return '';
}
