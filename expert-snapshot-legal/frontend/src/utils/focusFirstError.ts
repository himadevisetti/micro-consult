export function focusFirstError(
  formId: string,
  errors: Record<string, string>
) {
  const formEl = document.getElementById(formId);
  if (!formEl) return;

  // Clear old highlights
  formEl.querySelectorAll('.error-select-highlight').forEach(el => {
    el.classList.remove('error-select-highlight');
  });

  if (!errors || Object.keys(errors).length === 0) return;

  const focusables = Array.from(
    formEl.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
    )
  );

  // Walk DOM order and stop at the first field that matches an error
  for (const el of focusables) {
    const name = el.getAttribute('name') || '';

    // Case 1: direct per-field error
    if (errors[name]) {
      el.classList.add('error-select-highlight');
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el.tagName !== 'SELECT') el.focus();
      });
      return;
    }

    // Case 2: this field is part of a combined error
    const combinedKey = Object.keys(errors).find(k => k.includes('__') && k.split('__').includes(name));
    if (combinedKey) {
      const [a, b] = combinedKey.split('__');

      // Highlight both halves
      focusables.forEach(f => {
        const fname = f.getAttribute('name');
        if (fname === a || fname === b) {
          f.classList.add('error-select-highlight');
        }
      });

      // Scroll to the first half in DOM order
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el.tagName !== 'SELECT') el.focus();
      });
      return;
    }
  }
}
