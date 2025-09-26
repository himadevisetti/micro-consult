import { isEmptyValue } from '@/utils/formSchemaUtils';

export function validateInlinePair<T extends Record<string, any>>(
  formSnapshot: T,
  errors: Record<string, string>,
  valueKey: keyof T,
  unitKey: keyof T,
  label: string,
  allowZero = false,
  schema?: Record<string, any>
) {
  const valueCfg = schema?.[valueKey as string];
  const unitCfg = schema?.[unitKey as string];

  // --- Visibility ---
  const valueVisible =
    typeof valueCfg?.showIf === 'function' ? !!valueCfg.showIf(formSnapshot) : true;
  const unitVisible =
    typeof unitCfg?.showIf === 'function' ? !!unitCfg.showIf(formSnapshot) : true;

  // Skip only if both halves are hidden
  if (schema && !valueVisible && !unitVisible) {
    return;
  }

  // --- Requiredness ---
  // Default: required whenever visible
  // Override: if either half has pairOptional: true, treat as optional
  const pairOptional =
    valueCfg?.pairOptional === true || unitCfg?.pairOptional === true;
  const isRequired = !pairOptional;

  // --- Value/unit checks ---
  const value = formSnapshot[valueKey];
  const unit = formSnapshot[unitKey];

  const numericValue =
    typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : typeof value === 'number'
        ? value
        : undefined;

  const hasValidValue =
    numericValue !== undefined &&
    !Number.isNaN(numericValue) &&
    (allowZero ? numericValue >= 0 : numericValue > 0);

  // Treat "None" as empty for unit
  const hasUnit = !isEmptyValue(unit) && unit !== 'None';

  const combinedKey = `${String(valueKey)}__${String(unitKey)}`;

  // --- Emit errors ---
  if (isRequired) {
    if (!hasValidValue && !hasUnit) {
      errors[combinedKey] = `${label} must include a value${allowZero ? ' (0 or greater)' : ' greater than 0'
        } and a unit.`;
    } else {
      if (!hasValidValue) {
        errors[valueKey as string] = `${label} must include a value${allowZero ? ' (0 or greater)' : ' greater than 0'
          }.`;
      }
      if (!hasUnit) {
        errors[unitKey as string] = `Please select a unit for ${label}.`;
      }
    }
  } else {
    // Optional pair: only error if one half is filled without the other
    if (hasValidValue && !hasUnit) {
      errors[unitKey as string] = `Please select a unit for ${label}.`;
    }
    if (!hasValidValue && hasUnit) {
      errors[valueKey as string] = `${label} must include a value${allowZero ? ' (0 or greater)' : ' greater than 0'
        }.`;
    }
  }
}
