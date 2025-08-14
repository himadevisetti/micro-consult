// src/utils/buildRetainerPreviewPayload.ts
import { standardRetainerSchema } from '../schemas/standardRetainerSchema';
import { formatDateMMDDYYYY } from './formatDate';
export function buildRetainerPreviewPayload(formData) {
    const clauses = [];
    const metadata = {};
    for (const [key, config] of Object.entries(standardRetainerSchema)) {
        const field = key;
        const rawValue = formData[field];
        // Normalize value to string for metadata
        const value = rawValue instanceof Date
            ? formatDateMMDDYYYY(rawValue)
            : typeof rawValue === 'number'
                ? rawValue.toString()
                : rawValue ?? '';
        metadata[key] = value;
        // Clause interpolation
        if (config.clauseTemplate) {
            const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
                const tokenKey = token.trim();
                const tokenValue = formData[tokenKey];
                return tokenValue instanceof Date
                    ? formatDateMMDDYYYY(tokenValue)
                    : typeof tokenValue === 'number'
                        ? tokenValue.toString()
                        : tokenValue ?? '';
            });
            clauses.push({ id: key, text: clauseText });
        }
    }
    return { clauses, metadata };
}
