export function getDateInputValue(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
        const iso = value.toISOString().split('T')[0];
        return iso;
    }
    return '';
}
