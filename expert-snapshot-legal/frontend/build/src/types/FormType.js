// src/types/FormType.ts
export var FormType;
(function (FormType) {
    FormType["StandardRetainer"] = "standard-retainer";
    FormType["IPCounselRetainer"] = "ip-counsel-retainer";
    FormType["CustomTemplate"] = "custom-template";
})(FormType || (FormType = {}));
export const RetainerTypeLabel = {
    [FormType.StandardRetainer]: 'Standard Retainer',
    [FormType.IPCounselRetainer]: 'IP Counsel Retainer',
    [FormType.CustomTemplate]: 'Custom Template',
};
