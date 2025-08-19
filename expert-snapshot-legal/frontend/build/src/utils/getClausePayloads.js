import { clauses } from './clauses.js';
function isString(value) {
    return typeof value === 'string';
}
export function getClausePayloads(formData, options = {}) {
    const { exclude = [] } = options;
    return Object.entries(clauses)
        .filter(([key]) => !exclude.includes(key))
        .map(([key, clause]) => {
        const raw = key in formData ? formData[key] : '';
        const html = isString(raw) ? raw.trim() : '';
        return {
            label: clause.label || key,
            html,
        };
    })
        .filter(({ html }) => html.length > 0);
}
