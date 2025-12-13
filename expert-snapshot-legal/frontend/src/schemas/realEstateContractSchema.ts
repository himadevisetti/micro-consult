// src/schemas/realEstateContractSchema.ts

import type { RealEstateContractFormData } from '../types/RealEstateContractFormData';
import { RealEstateContractFieldConfig } from '../types/RealEstateContractFieldConfig';
import {
  validateDate,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateDropdown,
  validateText
} from '../utils/validationHelpers';

export const realEstateContractSchema: Record<string, RealEstateContractFieldConfig> = {
  // Parties & Property
  buyerName: {
    label: 'Buyer Name',
    type: 'text',
    required: false,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'The Buyer is {{buyerName}}.',
    group: 'main',
    validate: validateText
  },
  sellerName: {
    label: 'Seller Name',
    type: 'text',
    required: false,
    placeholder: 'e.g. John Smith',
    clauseTemplate: 'The Seller is {{sellerName}}.',
    group: 'main',
    validate: validateText
  },
  tenantName: {
    label: 'Tenant Name',
    type: 'text',
    required: false,
    placeholder: 'Tenant full name',
    clauseTemplate: 'The Tenant is {{tenantName}}.',
    group: 'main',
    validate: validateText
  },
  landlordName: {
    label: 'Landlord Name',
    type: 'text',
    required: false,
    placeholder: 'Landlord full name',
    clauseTemplate: 'The Landlord is {{landlordName}}.',
    group: 'main',
    validate: validateText
  },
  brokerName: {
    label: 'Broker Name',
    type: 'text',
    required: false,
    placeholder: 'Broker full name',
    clauseTemplate: 'The Broker is {{brokerName}}.',
    group: 'main',
    validate: validateText
  },
  propertyAddress: {
    label: 'Property Address',
    type: 'textarea',
    required: true,
    placeholder: 'Full property address',
    clauseTemplate: 'The property is located at {{propertyAddress}}.',
    group: 'main',
    validate: validateText
  },
  legalDescription: {
    label: 'Legal Description',
    type: 'textarea',
    required: false,
    placeholder: 'Lot/block, parcel ID, metes and bounds',
    clauseTemplate: 'The legal description of the property is: {{legalDescription}}.',
    group: 'main',
    validate: validateText
  },

  // Contract metadata
  contractType: {
    label: 'Contract Type',
    type: 'dropdown',
    required: true,
    options: ['Purchase', 'Lease', 'Option', 'Listing'],
    placeholder: 'Select contract type',
    clauseTemplate: 'This is a {{contractType}} agreement.',
    group: 'main',
    validate: (val: string) => validateDropdown(val, ['Purchase', 'Lease', 'Option', 'Listing'])
  },
  executionDate: {
    label: 'Execution Date',
    type: 'date',
    required: true,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'This contract was executed on {{executionDate}}.',
    validate: validateDate,
    group: 'main'
  },
  closingDate: {
    label: 'Closing Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The closing date is {{closingDate}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'main',
    validate: validateDate
  },
  possessionDate: {
    label: 'Possession Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'Possession will be delivered on {{possessionDate}}.',
    showIf: (form: RealEstateContractFormData) =>
      form.contractType === 'Purchase' || form.contractType === 'Lease',
    group: 'main',
    validate: validateDate
  },
  leaseStartDate: {
    label: 'Lease Start Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The lease begins on {{leaseStartDate}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Lease',
    group: 'main',
    validate: validateDate
  },
  leaseEndDate: {
    label: 'Lease End Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The lease ends on {{leaseEndDate}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Lease',
    group: 'main',
    validate: validateDate
  },
  optionExpirationDate: {
    label: 'Option Expiration Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The option expires on {{optionExpirationDate}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Option',
    group: 'main',
    validate: validateDate
  },
  listingStartDate: {
    label: 'Listing Start Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The listing begins on {{listingStartDate}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Listing',
    group: 'main',
    validate: validateDate
  },
  listingExpirationDate: {
    label: 'Listing Expiration Date',
    type: 'date',
    required: false,
    placeholder: 'MM/DD/YYYY',
    clauseTemplate: 'The listing expires on {{listingExpirationDate}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Listing',
    group: 'main',
    validate: validateDate
  },

  // Financial terms
  purchasePrice: {
    label: 'Purchase Price',
    type: 'number',
    required: false,
    placeholder: 'e.g. 500000',
    clauseTemplate: 'The purchase price is {{purchasePrice}}.',
    showIf: (form: RealEstateContractFormData) =>
      form.contractType === 'Purchase' || form.contractType === 'Option',
    group: 'main',
    validate: validatePositiveNumber
  },
  earnestMoneyDeposit: {
    label: 'Earnest Money Deposit',
    type: 'number',
    required: false,
    placeholder: 'e.g. 20000',
    clauseTemplate: 'The earnest money deposit is {{earnestMoneyDeposit}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'main',
    validate: validateNonNegativeNumber
  },
  financingTerms: {
    label: 'Financing Terms',
    type: 'textarea',
    required: false,
    placeholder: 'Describe financing terms',
    clauseTemplate: 'Financing terms: {{financingTerms}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'main',
    validate: validateText
  },
  rentAmount: {
    label: 'Rent Amount',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2000',
    clauseTemplate: 'The rent amount is {{rentAmount}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Lease',
    group: 'main',
    inlineWith: 'paymentFrequency',
    validate: validatePositiveNumber
  },
  securityDeposit: {
    label: 'Security Deposit',
    type: 'number',
    required: false,
    placeholder: 'e.g. 2000',
    clauseTemplate: 'The security deposit is {{securityDeposit}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Lease',
    group: 'main',
    validate: validateNonNegativeNumber
  },
  paymentFrequency: {
    label: 'Payment Frequency',
    type: 'dropdown',
    required: false,
    options: ['Monthly', 'Quarterly', 'Annually'],
    default: 'Monthly',
    clauseTemplate: 'Rent will be paid {{paymentFrequency}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Lease',
    group: 'main',
    validate: (val: string) => validateDropdown(val, ['Monthly', 'Quarterly', 'Annually'])
  },
  optionFee: {
    label: 'Option Fee',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5000',
    clauseTemplate: 'The option fee is {{optionFee}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Option',
    group: 'main',
    validate: validateNonNegativeNumber
  },
  rentCreditTowardPurchase: {
    label: 'Rent Credit Toward Purchase',
    type: 'number',
    required: false,
    placeholder: 'e.g. 500',
    clauseTemplate: 'Rent credit toward purchase: {{rentCreditTowardPurchase}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Option',
    group: 'main',
    validate: validateNonNegativeNumber
  },
  commissionValue: {
    label: 'Commission',
    type: 'number',
    required: false,
    placeholder: 'e.g. 5',
    clauseTemplate: 'The commission is {{commissionValue}} {{commissionUnit}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Listing',
    group: 'main',
    inlineWith: 'commissionUnit',
    validate: validatePositiveNumber
  },
  commissionUnit: {
    label: 'Unit',
    type: 'dropdown',
    required: false,
    options: ['Percentage', 'FlatFee'],
    default: 'Percentage',
    group: 'main',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Listing',
    validate: (val: string) => validateDropdown(val, ['Percentage', 'FlatFee'])
  },

  // Contingencies & conditions (checkboxes under clauses)
  inspectionContingency: {
    label: 'Include Inspection Contingency',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'This agreement is contingent upon inspection.',
    default: 'false',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'clauses'
  },
  appraisalContingency: {
    label: 'Include Appraisal Contingency',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'This agreement is contingent upon appraisal.',
    default: 'false',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'clauses'
  },
  financingContingency: {
    label: 'Include Financing Contingency',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'This agreement is contingent upon financing.',
    default: 'false',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'clauses'
  },
  titleClearance: {
    label: 'Include Title Clearance',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'This agreement requires clear title.',
    default: 'false',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'clauses'
  },
  renewalOptions: {
    label: 'Renewal Option',
    type: 'dropdown',
    required: false,
    options: ['Automatic', 'Fixed-Term', 'Month-to-Month', 'Negotiated', 'None'],
    default: 'None',
    clauseTemplate: 'The renewal option is {{renewalOptions}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Lease',
    group: 'main',
    validate: (val: string) =>
      validateDropdown(val, ['Automatic', 'Fixed-Term', 'Month-to-Month', 'Negotiated', 'None'])
  },
  disclosureAcknowledgment: {
    label: 'Include Disclosure Acknowledgment',
    type: 'checkbox',
    required: false,
    clauseTemplate: 'Disclosure acknowledgment is included.',
    default: 'false',
    group: 'clauses'
  },

  // Escrow / Closing
  escrowAgencyName: {
    label: 'Escrow Agency Name',
    type: 'text',
    required: false,
    placeholder: 'e.g. Title Company Inc.',
    clauseTemplate: 'Escrow will be handled by {{escrowAgencyName}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'main',
    validate: validateText
  },
  closingCostsResponsibility: {
    label: 'Closing Costs Responsibility',
    type: 'dropdown',
    required: false,
    options: ['Buyer', 'Seller', 'Split'],
    default: 'Buyer',
    clauseTemplate: 'Closing costs will be paid by {{closingCostsResponsibility}}.',
    showIf: (form: RealEstateContractFormData) => form.contractType === 'Purchase',
    group: 'main',
    validate: (val: string) => validateDropdown(val, ['Buyer', 'Seller', 'Split'])
  },

  // Termination & Remedies
  terminationClause: {
    label: 'Termination Clause',
    type: 'textarea',
    required: false,
    placeholder: 'Describe termination conditions',
    clauseTemplate: 'Termination clause: {{terminationClause}}.',
    group: 'main',
    validate: validateText
  },
  defaultRemedies: {
    label: 'Default Remedies',
    type: 'textarea',
    required: false,
    placeholder: 'Describe remedies for default',
    clauseTemplate: 'Default remedies: {{defaultRemedies}}.',
    group: 'main',
    validate: validateText
  },
  disputeResolution: {
    label: 'Dispute Resolution',
    type: 'dropdown',
    required: true,
    options: ['Arbitration', 'Mediation', 'Court'],
    default: 'Arbitration',
    clauseTemplate: 'Disputes will be resolved via {{disputeResolution}}.',
    group: 'main',
    validate: (val: string) => validateDropdown(val, ['Arbitration', 'Mediation', 'Court'])
  },

  // Miscellaneous
  governingLaw: {
    label: 'Governing Law',
    type: 'dropdown',
    required: true,
    options: ['California', 'New York', 'Texas', 'Other'],
    default: 'California',
    clauseTemplate: 'This agreement is governed by the laws of {{governingLaw}}.',
    group: 'main',
    validate: (val: string) => validateDropdown(val, ['California', 'New York', 'Texas', 'Other'])
  },
  additionalProvisions: {
    label: 'Additional Provisions',
    type: 'textarea',
    required: false,
    placeholder: 'Any additional terms or provisions',
    clauseTemplate: 'Additional provisions: {{additionalProvisions}}.',
    group: 'main',
    validate: validateText
  },

  // Signatures
  partySignatoryName: {
    label: 'Signatory Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
    clauseTemplate: 'Signed by {{partySignatoryName}}.',
    group: 'main',
    validate: validateText
  },
  partySignatoryRole: {
    label: 'Signatory Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. Buyer, Seller, Tenant, Broker',
    clauseTemplate: 'Role: {{partySignatoryRole}}.',
    group: 'main',
    validate: validateText
  }
};
