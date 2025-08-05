export type StringTransform = (input: string) => string;

export function applyTransform(transform: StringTransform, value: string): string {
  return typeof transform === 'function' ? transform(value) : value;
}
