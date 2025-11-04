// src/utils/buildTokenRegex.ts

/**
 * Escape regex metacharacters in a string.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a regex for a candidate rawValue.
 * - If the value is purely alphanumeric, wrap with \b boundaries.
 * - Otherwise, just match the escaped string literally.
 */
export function buildTokenRegex(rawValue: string): RegExp {
  const escaped = escapeRegex(rawValue);
  const isWord = /^[A-Za-z0-9]+$/.test(rawValue);
  return new RegExp(isWord ? `\\b${escaped}\\b` : escaped, "g");
}
