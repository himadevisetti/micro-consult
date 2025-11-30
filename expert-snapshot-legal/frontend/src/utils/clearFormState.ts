/**
 * Clears only form-related sessionStorage keys.
 * Preserves authentication token and other unrelated session data.
 */
export function clearFormState() {
  Object.keys(sessionStorage).forEach((key) => {
    if (
      key.includes("FormData") ||
      key.includes("FormErrors") ||
      key.includes("Draft")
    ) {
      sessionStorage.removeItem(key);
    }
  });
}

