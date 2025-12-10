// src/types/LitigationEngagementFormData.ts

export type FeeStructure = "Flat" | "Hourly" | "Monthly" | "Contingency";

export interface LitigationEngagementFormData {
  // Parties & Case
  clientName: string;                 // Textbox
  providerName: string;               // Textbox
  caseCaption?: string;               // Optional at intake, required once filed
  caseNumber?: string;                // Optional at intake, required once filed
  courtName?: string;                 // Optional at intake, required once filed
  courtAddress?: string;              // Optional at intake, required once filed
  countyName?: string;                // Optional at intake, required with courtName

  // Dates
  executionDate: string;              // Calendar picker (required)
  filedDate?: string;                 // Optional at intake, required once filed
  effectiveDate?: string;             // Optional: sometimes same as execution
  expirationDate?: string;            // Optional: not always applicable

  // Fees & Retainer
  feeAmount: number;                  // $ Textbox, precision: 2
  feeStructure: FeeStructure;         // Dropdown
  retainerAmount?: number;            // Optional: not always collected

  // Scope & Limitations
  scopeOfRepresentation: string;      // Textarea
  limitationsOfRepresentation?: string; // Optional: only if applicable

  // Jurisdiction
  jurisdiction: string;               // Dropdown, required (default: "California")

  // Clause Toggles
  clientTerminationRights?: boolean;  // Optional toggle
  conflictOfInterestWaiver?: boolean; // Optional toggle
}

export const defaultLitigationEngagementFormData: LitigationEngagementFormData = {
  clientName: "",
  providerName: "",
  caseCaption: "",
  caseNumber: "",
  courtName: "",
  courtAddress: "",
  countyName: "",
  executionDate: "",
  filedDate: "",
  effectiveDate: "",
  expirationDate: "",
  feeAmount: 0.00,
  feeStructure: "Flat",
  retainerAmount: 0.00,
  scopeOfRepresentation: "Counsel will represent the client in connection with pleadings, motions, discovery, hearings, settlement negotiations, and trial proceedings arising out of the matter described in the case caption. Representation does not extend to appeals or unrelated matters unless separately agreed.",
  limitationsOfRepresentation: "Representation does not include appeals, collection of judgments, or unrelated matters unless separately agreed.",
  jurisdiction: "California",
  clientTerminationRights: false,
  conflictOfInterestWaiver: false,
};
