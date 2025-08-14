export function sanitizeErrors(errors) {
    return Object.fromEntries(Object.entries(errors).filter(([_, value]) => typeof value === 'string'));
}
