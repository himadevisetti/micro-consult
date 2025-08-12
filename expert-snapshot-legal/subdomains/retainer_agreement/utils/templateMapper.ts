import { MappingSchema } from '../mappings/types.js';
import { applyTransform } from './transformRegistry.js';

export function applyFormToTemplate(
  formData: Record<string, string>,
  templateText: string,
  mappingSchema: MappingSchema
): string {
  return mappingSchema.fieldMappings.reduce((acc, map) => {
    let value = formData[map.formFieldId];

    // If transform exists and you've mapped it to a function, apply it here
    // For now, just a passthrough unless you build a transform registry
    if (map.transform) {
      value = applyTransform(map.transform, value);
    }
    return acc.replaceAll(map.templateToken, value || '');
  }, templateText);
}
