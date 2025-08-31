// src/components/AgreementClauses/clauses.tsx

import type { EnrichedFormData } from '@/utils/serializeClauses';

import PartiesClause from './PartiesClause.js';
import ScopeClause from './ScopeClause.js';
import ResponsibilitiesClause from './ResponsibilitiesClause.js';
import FeeClause from './FeeClause.js';
import CostsClause from './CostsClause.js';
import CommunicationClause from './CommunicationClause.js';
import ConfidentialityClause from './ConfidentialityClause.js';
import TerminationClause from './TerminationClause.js';
import GoverningLawClause from './GoverningLawClause.js';
import EntireAgreementClause from './EntireAgreementClause.js';
import SignatureClause from './SignatureClause.js';

export function getClauses(formData: EnrichedFormData) {
  return [
    {
      id: 'partiesClause',
      render: () => (
        <PartiesClause
          clientName={formData.clientName}
          providerName={formData.providerName}
          effectiveDate={formData.formattedStartDateLong}
        />
      ),
    },
    {
      id: 'scopeClause',
      render: () => (
        <ScopeClause matterDescription={formData.matterDescription} />
      ),
    },
    {
      id: 'responsibilitiesClause',
      render: () => <ResponsibilitiesClause />,
    },
    {
      id: 'communicationClause',
      render: () => (
        <CommunicationClause clientName={formData.clientName} />
      ),
    },
    {
      id: 'feeClause',
      render: () => (
        <FeeClause
          structure={formData.feeStructure}
          feeAmount={formData.formattedFeeAmount}
          retainerAmount={formData.formattedRetainerAmount}
          jurisdiction={formData.jurisdiction}
        />
      ),
    },
    {
      id: 'costsClause',
      render: () => <CostsClause />,
    },
    {
      id: 'confidentialityClause',
      render: () => <ConfidentialityClause />,
    },
    {
      id: 'terminationClause',
      render: () => (
        <TerminationClause endDate={formData.formattedEndDateLong} />
      ),
    },
    {
      id: 'governingLawClause',
      render: () => (
        <GoverningLawClause jurisdiction={formData.jurisdiction} />
      ),
    },
    {
      id: 'entireAgreementClause',
      render: () => <EntireAgreementClause />,
    },
    {
      id: 'signatureClause',
      render: () => (
        <SignatureClause
          clientName={formData.clientName}
          providerName={formData.providerName}
          executionDate={formData.formattedStartDateLong}
        />
      ),
    },
  ];
}
