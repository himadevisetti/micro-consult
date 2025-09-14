// src/components/AgreementClauses/EmploymentAgreementClauses.tsx

import type { EnrichedEmploymentAgreementFormData } from '@/utils/serializeEmploymentAgreementClauses';
import type { EmploymentAgreementClauseTemplate } from '@/utils/serializeEmploymentAgreementClauses';

import PartiesClause from './Employment/PartiesClause.js';
import PositionAndDutiesClause from './Employment/PositionAndDutiesClause.js';
import CompensationClause from './Employment/CompensationClause.js';
import BenefitsClause from './Employment/BenefitsClause.js';
import LeaveClause from './Employment/LeaveClause.js';
import ProbationClause from './Employment/ProbationClause.js';
import NoticeClause from './Employment/NoticeClause.js';
import OvertimeClause from './Employment/OvertimeClause.js';
import ConfidentialityClause from './Shared/ConfidentialityClause.js';
import IPOwnershipClause from './Employment/IPOwnershipClause.js';
import NonCompeteClause from './Employment/NonCompeteClause.js';
import NonSolicitationClause from './Employment/NonSolicitationClause.js';
import GoverningLawClause from './Shared/GoverningLawClause.js';
import DisputeResolutionClause from './Shared/DisputeResolutionClause.js';
import AdditionalTermsClause from './Employment/AdditionalTermsClause.js';
import SignatureClause from './Employment/SignatureClause.js';

export function getEmploymentAgreementClauses(
  formData: EnrichedEmploymentAgreementFormData
): EmploymentAgreementClauseTemplate[] {
  const asBool = (v: unknown) => v === true || v === 'true';

  return [
    {
      id: 'partiesClause',
      render: (fd) => (
        <PartiesClause
          employerName={fd.employerName}
          employerAddress={fd.employerAddress}
          employeeName={fd.employeeName}
          employeeAddress={fd.employeeAddress}
          effectiveDate={fd.formattedEffectiveDateLong}
          jobTitle={fd.jobTitle}
          department={fd.department}
          reportsTo={fd.reportsTo}
          workLocation={fd.workLocation}
          workSchedule={fd.workSchedule}
        />
      ),
    },
    {
      id: 'positionAndDutiesClause',
      render: (fd) => (
        <PositionAndDutiesClause
          jobTitle={fd.jobTitle}
          department={fd.department}
          reportsTo={fd.reportsTo}
          bandOrGroup={fd.bandOrGroup}
          contractType={fd.contractType}
        />
      ),
    },
    {
      id: 'compensationClause',
      render: (fd) => (
        <CompensationClause
          contractType={fd.contractType}
          baseSalary={fd.formattedBaseSalary}
          payFrequency={fd.payFrequency}
          hourlyRate={fd.formattedHourlyRate}
          hoursPerWeek={fd.formattedHoursPerWeek}
          bonusAmount={fd.formattedBonusAmount}
          bonusUnit={fd.bonusUnit}
        />
      ),
    },
    {
      id: 'benefitsClause',
      render: (fd) => (
        <BenefitsClause
          benefitsList={fd.benefitsList}
        />
      ),
    },
    {
      id: 'leaveClause',
      render: (fd) => (
        <LeaveClause
          annualLeaveDays={fd.formattedAnnualLeaveDays}
          sickLeaveDays={fd.formattedSickLeaveDays}
        />
      ),
    },
    {
      id: 'probationClause',
      render: (fd) => (
        <ProbationClause
          probationPeriod={fd.formattedProbationPeriod}
          probationPeriodUnit={fd.probationPeriodUnit}
        />
      ),
    },
    {
      id: 'noticeClause',
      render: (fd) => (
        <NoticeClause
          noticePeriodEmployer={fd.formattedNoticePeriodEmployer}
          noticePeriodEmployerUnit={fd.noticePeriodEmployerUnit}
          noticePeriodEmployee={fd.formattedNoticePeriodEmployee}
          noticePeriodEmployeeUnit={fd.noticePeriodEmployeeUnit}
        />
      ),
    },
    {
      id: 'overtimeClause',
      render: (fd) => (
        <OvertimeClause
          overtimePolicy={fd.overtimePolicy}
        />
      ),
    },
    ...(asBool(formData.includeConfidentiality)
      ? ([
        {
          id: 'confidentialityClause',
          render: (fd) => (
            <ConfidentialityClause
              disclosingParty={fd.employerName}
              receivingParty={fd.employeeName}
            />
          ),
        },
      ] satisfies EmploymentAgreementClauseTemplate[])
      : []),
    {
      id: 'ipOwnershipClause',
      render: (fd) => (
        <IPOwnershipClause
          employerName={fd.employerName}
          employeeName={fd.employeeName}
        />
      ),
    },
    ...(asBool(formData.nonCompete)
      ? ([
        {
          id: 'nonCompeteClause',
          render: (fd) => (
            <NonCompeteClause
              durationValue={fd.nonCompeteDurationValue}
              durationUnit={fd.nonCompeteDurationUnit}
              employeeName={fd.employeeName}
              employerName={fd.employerName}
            />
          ),
        },
      ] satisfies EmploymentAgreementClauseTemplate[])
      : []),
    ...(asBool(formData.nonSolicitation)
      ? ([
        {
          id: 'nonSolicitationClause',
          render: (fd) => (
            <NonSolicitationClause
              employeeName={fd.employeeName}
              employerName={fd.employerName}
            />
          ),
        },
      ] satisfies EmploymentAgreementClauseTemplate[])
      : []),
    {
      id: 'disputeResolutionClause',
      render: (fd) => (
        <DisputeResolutionClause
          method={fd.disputeResolution}
          jurisdiction={fd.governingLaw}
        />
      ),
    },
    {
      id: 'governingLawClause',
      render: (fd) => <GoverningLawClause jurisdiction={fd.governingLaw} />,
    },
    ...(formData.additionalProvisions?.trim()
      ? ([
        {
          id: 'additionalTermsClause',
          render: (fd) => (
            <AdditionalTermsClause additionalTerms={fd.additionalProvisions ?? ''} />
          ),
        },
      ] satisfies EmploymentAgreementClauseTemplate[])
      : []),
    {
      id: 'signatureClause',
      render: (fd) => (
        <SignatureClause
          employerSignatoryName={fd.employerSignatoryName}
          employerSignatoryTitle={fd.employerSignatoryTitle}
          employeeName={fd.employeeName}
          dateSigned={fd.formattedEffectiveDateLong}
        />
      ),
    },
  ];
}
