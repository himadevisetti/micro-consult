import { formatDateLong } from './formatDate.js';

export function transformVariables(vars: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) {
    if (k.toLowerCase().includes('date')) {
      out[k] = formatDateLong(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
