export type FormBlurHandler<T extends Record<string, any>> = (
  field: keyof T,
  value: T[keyof T]
) => void;

