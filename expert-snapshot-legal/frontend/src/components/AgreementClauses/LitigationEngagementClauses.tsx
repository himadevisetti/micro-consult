// src/components/AgreementClauses/LitigationEngagementClauses.tsx

import type { EnrichedLitigationEngagementFormData } from '@/utils/serializeLitigationEngagementClauses';
import type { LitigationEngagementClauseTemplate } from '@/utils/serializeLitigationEngagementClauses';

import PartiesClause from './Litigation/PartiesClause.js';
import CaseCaptionClause from './Litigation/CaseCaptionClause.js';
import CourtClause from './Litigation/CourtClause.js';
import ScopeClause from './Litigation/ScopeClause.js';
import LimitationsClause from './Litigation/LimitationsClause.js';
import FeeClause from './Litigation/FeeClause.js';
import GoverningLawClause from './Shared/GoverningLawClause.js';
import EntireAgreementClause from './Shared/EntireAgreementClause.js';
import TerminationClause from './Shared/TerminationClause.js';
import ConflictOfInterestClause from './Litigation/ConflictOfInterestClause.js';
import SignatureClause from './Shared/SignatureClause.js';

export function getLitigationEngagementClauses(
  formData: EnrichedLitigationEngagementFormData
): LitigationEngagementClauseTemplate[] {
  return [
    {
      id: 'partiesClause',
      render: () => (
        <PartiesClause
          clientName={formData.clientName}
          providerName={formData.providerName}
          effectiveDate={formData.formattedEffectiveDateLong}
        />
      ),
    },
    {
      id: 'caseCaptionClause',
      render: () => (
        <CaseCaptionClause caseCaption={formData.caseCaption ?? ''} />
      ),
    },
    {
      id: 'courtClause',
      render: () => (
        <CourtClause
          courtName={formData.courtName ?? ''}
          courtAddress={formData.courtAddress ?? ''}
        />
      ),
    },
    {
      id: 'scopeClause',
      render: () => (
        <ScopeClause scopeOfRepresentation={formData.scopeOfRepresentation} />
      ),
    },
    ...(formData.limitationsOfRepresentation
      ? [
        {
          id: 'limitationsClause',
          render: () => (
            <LimitationsClause
              limitations={formData.limitationsOfRepresentation ?? ''}
            />
          ),
        },
      ]
      : []),
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
      id: 'governingLawClause',
      render: () => (
        <GoverningLawClause jurisdiction={formData.jurisdiction} />
      ),
    },
    {
      id: 'entireAgreementClause',
      render: () => <EntireAgreementClause />,
    },
    ...(formData.clientTerminationRights
      ? [
        {
          id: 'terminationClause',
          render: () => (
            <TerminationClause
              endDate={formData.formattedExpirationDateLong}
              responsibleParty="the Client"
              clientTerminationRights={formData.clientTerminationRights}
            />
          ),
        },
      ]
      : []),
    ...(formData.conflictOfInterestWaiver
      ? [
        {
          id: 'conflictOfInterestClause',
          render: () => <ConflictOfInterestClause />,
        },
      ]
      : []),
    {
      id: 'signatureClause',
      render: () => (
        <SignatureClause
          clientName={formData.clientName}
          providerName={formData.providerName}
          executionDate={formData.formattedExecutionDateLong}
        />
      ),
    },
  ];
}
