// src/utils/candidates/placeholderUtils.ts
export function makePlaceholder(schemaField: string): string {
  const tag = schemaField.charAt(0).toUpperCase() + schemaField.slice(1);
  return `[[${tag}]]`;
}

