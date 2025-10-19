import type { ManifestVariable } from '@/types/manifest';

export function getDefaultValue(v: ManifestVariable): string {
  if (v.fullValue) return v.fullValue;
  if (v.normalized) return v.normalized;
  if (v.raw) {
    if (v.inputType === 'select' && v.options?.length) {
      const match = v.options.find(
        (opt) => opt.toLowerCase() === v.raw!.toLowerCase()
      );
      return match ?? v.raw;
    }
    return v.raw;
  }
  return '';
}

