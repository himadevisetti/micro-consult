// src/components/AgreementClauses/StartupAdvisoryClauses.tsx

import type { EnrichedStartupAdvisoryFormData } from '@/utils/serializeStartupAdvisoryClauses';
import type { StartupAdvisoryClauseTemplate } from '@/utils/serializeStartupAdvisoryClauses';

import PartiesClause from './Startup/PartiesClause.js';
import ScopeOfWorkClause from './Startup/ScopeOfWorkClause.js';
import CompensationClause from './Startup/CompensationClause.js';
import ConfidentialityClause from './Shared/ConfidentialityClause.js';
import IPOwnershipClause from './Startup/IPOwnershipClause.js';
import NonCompeteClause from './Startup/NonCompeteClause.js';
import TerminationClause from './Shared/TerminationClause.js';
import GoverningLawClause from './Shared/GoverningLawClause.js';
import EntireAgreementClause from './Shared/EntireAgreementClause.js';
import SignatureClause from './Startup/SignatureClause.js';

export function getStartupAdvisoryClauses(
  formData: EnrichedStartupAdvisoryFormData
): StartupAdvisoryClauseTemplate[] {
  return [
    {
      id: 'partiesClause',
      render: (fd) => (
        <PartiesClause
          companyName={fd.companyName}
          companyAddress={fd.companyAddress}
          advisorName={fd.advisorName}
          advisorAddress={fd.advisorAddress}
          effectiveDate={fd.formattedEffectiveDateLong}
          advisorRole={fd.advisorRole}
        />
      ),
    },
    {
      id: 'scopeOfWorkClause',
      render: (fd) => (
        <ScopeOfWorkClause
          scopeOfWork={fd.scopeOfWork}
          timeCommitment={fd.timeCommitment}
        />
      ),
    },
    {
      id: 'compensationClause',
      render: (fd) => (
        <CompensationClause
          compensationType={fd.compensationType}
          equityPercentage={fd.formattedEquityPercentage}
          equityShares={fd.formattedEquityShares}
          vestingStartDate={fd.formattedVestingStartDateLong}
          cliffPeriod={fd.cliffPeriod}
          totalVestingPeriod={fd.totalVestingPeriod}
          cashAmount={fd.formattedCashAmount}
          paymentFrequency={fd.paymentFrequency}
          expenseReimbursement={fd.expenseReimbursement}
          expenseDetails={fd.expenseDetails}
        />
      ),
    },
    ...(formData.includeConfidentiality
      ? ([
        {
          id: 'confidentialityClause',
          render: () => <ConfidentialityClause />,
        },
      ] satisfies StartupAdvisoryClauseTemplate[])
      : []),
    {
      id: 'ipOwnershipClause',
      render: (fd) => (
        <IPOwnershipClause ipOwnership={fd.ipOwnership} />
      ),
    },
    ...(formData.nonCompete
      ? ([
        {
          id: 'nonCompeteClause',
          render: (fd: EnrichedStartupAdvisoryFormData) => (
            <NonCompeteClause duration={fd.nonCompeteDuration} />
          ),
        },
      ] satisfies StartupAdvisoryClauseTemplate[])
      : []),
    {
      id: 'terminationClause',
      render: (fd) => (
        <TerminationClause
          noticePeriod={fd.terminationNoticePeriod}
          includeTerminationForCause={fd.includeTerminationForCause}
          responsibleParty={fd.companyName}
        />
      ),
    },
    {
      id: 'governingLawClause',
      render: (fd) => (
        <GoverningLawClause jurisdiction={fd.governingLaw} />
      ),
    },
    ...(formData.includeEntireAgreementClause
      ? ([
        {
          id: 'entireAgreementClause',
          render: () => <EntireAgreementClause />,
        },
      ] satisfies StartupAdvisoryClauseTemplate[])
      : []),
    {
      id: 'signatureClause',
      render: (fd) => (
        <SignatureClause
          companyRepName={fd.companyRepName}
          companyRepTitle={fd.companyRepTitle}
          advisorName={fd.advisorName}
          dateSigned={fd.formattedDateSignedLong}
        />
      ),
    },
  ];
}

