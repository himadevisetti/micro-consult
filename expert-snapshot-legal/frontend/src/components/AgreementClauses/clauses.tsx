// src/components/AgreementClauses/clauses.tsx

import type { EnrichedFormData } from '@/utils/serializeClauses';

import PartiesClause from './Standard/PartiesClause.js';
import ScopeClause from './Standard/ScopeClause.js';
import ResponsibilitiesClause from './Standard/ResponsibilitiesClause.js';
import FeeClause from './Standard/FeeClause.js';
import CostsClause from './Standard/CostsClause.js';
import CommunicationClause from './Standard/CommunicationClause.js';
import ConfidentialityClause from './Standard/ConfidentialityClause.js';
import TerminationClause from './Standard/TerminationClause.js';
import GoverningLawClause from './Shared/GoverningLawClause.js';
import EntireAgreementClause from './Shared/EntireAgreementClause.js';
import SignatureClause from './Shared/SignatureClause.js';

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
