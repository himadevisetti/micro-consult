export function getDateInputValue(value: string | Date | undefined): string {

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    const iso = value.toISOString().split('T')[0];
    return iso;
  }

  return '';
}
