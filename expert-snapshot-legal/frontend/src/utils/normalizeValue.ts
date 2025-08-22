// src/utils/normalizeValue.ts

import { formatDateLong } from './formatDate';

export function normalizeValue(val: unknown): string {
  if (val instanceof Date) {
    return formatDateLong(val);
  }

  if (typeof val === 'number') {
    return val.toString();
  }

  return (val as string | undefined) ?? '';
}

