import { SerializedClause } from '../types/clauseTypes';

export const clauses: Record<string, SerializedClause> = {
  partiesClause: {
    label: 'Parties',
    content: '', // Populated from renderWithLabel()
    group: 'metadata',
  },
  scopeClause: {
    label: 'Scope of Representation',
    content: '',
    group: 'engagement',
  },
  responsibilitiesClause: {
    label: 'Responsibilities',
    content: '',
    group: 'engagement',
  },
  communicationClause: {
    label: 'Communication',
    content: '',
    group: 'engagement',
  },
  feeClause: {
    label: 'Fees & Payment',
    content: '',
    group: 'engagement',
  },
  costsClause: {
    label: 'Costs',
    content: '',
    group: 'engagement',
  },
  confidentialityClause: {
    label: 'Confidentiality & Privilege',
    content: '',
    group: 'protection',
  },
  terminationClause: {
    label: 'Termination',
    content: '',
    group: 'protection',
  },
  governingLawClause: {
    label: 'Governing Law',
    content: '',
    group: 'protection',
  },
  entireAgreementClause: {
    label: 'Entire Agreement',
    content: '',
    group: 'protection',
  },
  signatureClause: {
    label: 'Signatures',
    content: '',
    group: 'metadata',
  },
};
