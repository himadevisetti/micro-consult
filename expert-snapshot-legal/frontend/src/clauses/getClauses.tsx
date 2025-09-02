// src/clauses/getClauses.tsx

import { FormType } from '@/types/FormType';
import type { ClauseTemplate } from '@/utils/serializeClauses';

import PartiesClause from '@/components/AgreementClauses/Standard/PartiesClause';
import ScopeClause from '@/components/AgreementClauses/Standard/ScopeClause';
import ResponsibilitiesClause from '@/components/AgreementClauses/Standard/ResponsibilitiesClause';
import CommunicationClause from '@/components/AgreementClauses/Standard/CommunicationClause';
import FeeClause from '@/components/AgreementClauses/Standard/FeeClause';
import CostsClause from '@/components/AgreementClauses/Standard/CostsClause';
import ConfidentialityClause from '@/components/AgreementClauses/Standard/ConfidentialityClause';
import TerminationClause from '@/components/AgreementClauses/Standard/TerminationClause';
import GoverningLawClause from '@/components/AgreementClauses/Shared/GoverningLawClause';
import EntireAgreementClause from '@/components/AgreementClauses/Shared/EntireAgreementClause';
import SignatureClause from '@/components/AgreementClauses/Shared/SignatureClause';

export function getClauses(type: FormType): ClauseTemplate[] {
  switch (type) {
    case FormType.StandardRetainer:
      return [
        {
          id: 'partiesClause',
          render: (formData) => (
            <PartiesClause
              clientName={formData.clientName}
              providerName={formData.providerName}
              effectiveDate={formData.formattedStartDateLong}
            />
          ),
        },
        {
          id: 'scopeClause',
          render: (formData) => (
            <ScopeClause matterDescription={formData.matterDescription} />
          ),
        },
        {
          id: 'responsibilitiesClause',
          render: () => <ResponsibilitiesClause />,
        },
        {
          id: 'communicationClause',
          render: (formData) => (
            <CommunicationClause clientName={formData.clientName} />
          ),
        },
        {
          id: 'feeClause',
          render: (formData) => (
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
          render: (formData) => (
            <TerminationClause endDate={formData.formattedEndDateLong} />
          ),
        },
        {
          id: 'governingLawClause',
          render: (formData) => (
            <GoverningLawClause jurisdiction={formData.jurisdiction} />
          ),
        },
        {
          id: 'entireAgreementClause',
          render: () => <EntireAgreementClause />,
        },
        {
          id: 'signatureClause',
          render: (formData) => (
            <SignatureClause
              clientName={formData.clientName}
              providerName={formData.providerName}
              executionDate={formData.formattedStartDateLong}
            />
          ),
        },
      ];

    default:
      return [];
  }
}
