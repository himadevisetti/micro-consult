// src/types/RealEstateContractFormData.ts

export type RealEstateContractType =
  | 'Purchase'
  | 'Lease'
  | 'Option'
  | 'Listing';

export type DurationUnit = 'Days' | 'Weeks' | 'Months' | 'Years';
export type PaymentFrequency = 'Monthly' | 'Quarterly' | 'Annually';
export type CommissionUnit = 'Percentage' | 'FlatFee';

// 🔹 Explicit dropdown type for renewalOptions
export type RenewalOption =
  | 'Automatic'
  | 'Fixed-Term'
  | 'Month-to-Month'
  | 'Negotiated'
  | 'None';

export interface RealEstateContractFormData {
  // Parties & Property
  buyerName?: string;
  sellerName?: string;
  tenantName?: string;
  landlordName?: string;
  brokerName?: string;
  propertyAddress: string;
  legalDescription?: string; // formal property description

  // Contract metadata
  contractType: RealEstateContractType;
  executionDate: string; // ISO YYYY-MM-DD
  closingDate?: string; // Purchase
  possessionDate?: string; // Purchase/Lease
  leaseStartDate?: string; // Lease
  leaseEndDate?: string; // Lease
  optionExpirationDate?: string; // Option
  listingStartDate?: string; // Listing
  listingExpirationDate?: string; // Listing

  // Financial terms
  purchasePrice?: number; // Purchase/Option
  earnestMoneyDeposit?: number; // Purchase
  financingTerms?: string; // Purchase
  rentAmount?: number; // Lease
  securityDeposit?: number; // Lease
  paymentFrequency?: PaymentFrequency; // Lease
  optionFee?: number; // Option
  rentCreditTowardPurchase?: number; // Option
  commissionValue?: number; // Listing
  commissionUnit?: CommissionUnit; // Listing

  // Contingencies & conditions
  inspectionContingency?: boolean;
  appraisalContingency?: boolean;
  financingContingency?: boolean;
  titleClearance?: boolean;
  renewalOptions?: RenewalOption; // Lease, dropdown
  disclosureAcknowledgment?: boolean; // checkbox

  // Escrow / Closing
  escrowAgencyName?: string;
  closingCostsResponsibility?: 'Buyer' | 'Seller' | 'Split';

  // Termination & Remedies
  terminationClause?: string;
  defaultRemedies?: string;
  disputeResolution: 'Arbitration' | 'Mediation' | 'Court';

  // Miscellaneous
  governingLaw: string;
  additionalProvisions?: string;

  // Signatures
  partySignatoryName: string;
  partySignatoryRole: string;
}

export const defaultRealEstateContractFormData: RealEstateContractFormData = {
  propertyAddress: '',
  contractType: 'Purchase',
  executionDate: '',
  closingDate: '',
  possessionDate: '',
  leaseStartDate: '',
  leaseEndDate: '',
  optionExpirationDate: '',
  listingStartDate: '',
  listingExpirationDate: '',

  purchasePrice: undefined,
  earnestMoneyDeposit: undefined,
  financingTerms: '',
  rentAmount: undefined,
  securityDeposit: undefined,
  paymentFrequency: 'Monthly',
  optionFee: undefined,
  rentCreditTowardPurchase: undefined,
  commissionValue: undefined,
  commissionUnit: 'Percentage',

  inspectionContingency: false,
  appraisalContingency: false,
  financingContingency: false,
  titleClearance: false,
  renewalOptions: 'None',
  disclosureAcknowledgment: false,

  escrowAgencyName: '',
  closingCostsResponsibility: 'Buyer',

  terminationClause: '',
  defaultRemedies: '',
  disputeResolution: 'Arbitration',

  governingLaw: 'California',
  additionalProvisions: '',

  partySignatoryName: '',
  partySignatoryRole: ''
};
