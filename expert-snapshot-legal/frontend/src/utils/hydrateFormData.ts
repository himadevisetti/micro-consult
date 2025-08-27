import type { RetainerFormData } from '../types/RetainerFormData';

export function hydrateFormData(
  sessionKey: string,
  initialState: RetainerFormData
): RetainerFormData {
  const stored = sessionStorage.getItem(sessionKey);
  const hydrated = stored ? JSON.parse(stored) : {};
  return { ...initialState, ...hydrated };
}

