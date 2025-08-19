// src/types/RetainerFormData.ts
export const defaultRetainerFormData = {
    providerName: "",
    clientName: "",
    feeAmount: 0.00,
    feeStructure: "Flat",
    retainerAmount: 0.00,
    startDate: new Date(0), // Jan 1, 1970 UTC
    endDate: new Date(0),
    matterDescription: "",
    jurisdiction: "California",
};
