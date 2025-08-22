// src/types/RetainerFormData.ts
// import { getTodayYYYYMMDD } from '../utils/formatDate';

export type FeeStructure = "Flat" | "Hourly" | "Monthly" | "Contingency";

export interface RetainerFormData {
  providerName: string;               // Textbox
  clientName: string;                 // Textbox
  feeAmount: number;                  // $ Textbox, precision: 2
  feeStructure: FeeStructure;         // Dropdown
  retainerAmount?: number;            // $ Textbox, optional, precision: 2
  startDate: string;                    // Calendar picker
  endDate: string;                       // Calendar picker
  matterDescription: string;          // Textarea
  jurisdiction?: string;              // Dropdown, default: "California"
}

export const defaultRetainerFormData: RetainerFormData = {
  providerName: "",
  clientName: "",
  feeAmount: 0.00,
  feeStructure: "Flat",
  retainerAmount: 0.00,
  startDate: "",
  endDate: "",
  matterDescription: "",
  jurisdiction: "California",
};
