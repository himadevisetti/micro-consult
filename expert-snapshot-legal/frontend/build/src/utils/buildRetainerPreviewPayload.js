// src/utils/buildRetainerPreviewPayload.ts
import { standardRetainerSchema } from '../schemas/standardRetainerSchema';
import { normalizeValue } from './normalizeValue';
export function buildRetainerPreviewPayload(formData) {
    const clauses = [];
    const metadata = {};
    for (const [key, config] of Object.entries(standardRetainerSchema)) {
        const field = key;
        const rawValue = formData[field];
        metadata[key] = normalizeValue(rawValue);
        if (config.clauseTemplate) {
            const clauseText = config.clauseTemplate.replace(/\{\{(.*?)\}\}/g, (_, token) => {
                const tokenKey = token.trim();
                const tokenValue = formData[tokenKey];
                return normalizeValue(tokenValue);
            });
            clauses.push({ id: key, text: clauseText });
        }
    }
    return { clauses, metadata };
}
