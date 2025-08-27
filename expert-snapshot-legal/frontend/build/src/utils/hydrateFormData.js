export function hydrateFormData(sessionKey, initialState) {
    const stored = sessionStorage.getItem(sessionKey);
    const hydrated = stored ? JSON.parse(stored) : {};
    return { ...initialState, ...hydrated };
}
