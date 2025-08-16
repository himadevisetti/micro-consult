// src/types/FormType.ts

export enum FormType {
  StandardRetainer = 'standard-retainer',
  IPCounselRetainer = 'ip-counsel-retainer',
  CustomTemplate = 'custom-template',
}

export const RetainerTypeLabel: Record<FormType, string> = {
  [FormType.StandardRetainer]: 'Standard Retainer',
  [FormType.IPCounselRetainer]: 'IP Counsel Retainer',
  [FormType.CustomTemplate]: 'Custom Template',
};

