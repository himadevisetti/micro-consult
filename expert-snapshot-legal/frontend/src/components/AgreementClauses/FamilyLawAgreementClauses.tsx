// src/components/AgreementClauses/FamilyLawAgreementClauses.tsx

import type { EnrichedFamilyLawAgreementFormData } from '@/utils/serializeFamilyLawAgreementClauses';
import type { FamilyLawAgreementClauseTemplate } from '@/utils/serializeFamilyLawAgreementClauses';

import PartiesClause from './FamilyLaw/PartiesClause.js';
import DivorceClause from './FamilyLaw/DivorceClause.js';
import CustodyClause from './FamilyLaw/CustodyClause.js';
import VisitationClause from './FamilyLaw/VisitationClause.js';
import ChildSupportClause from './FamilyLaw/ChildSupportClause.js';
import SpousalSupportClause from './FamilyLaw/SpousalSupportClause.js';
import PropertyDivisionClause from './FamilyLaw/PropertyDivisionClause.js';
import GoverningLawClause from './Shared/GoverningLawClause.js';
import DisputeResolutionClause from './Shared/DisputeResolutionClause.js';
import AdditionalTermsClause from './FamilyLaw/AdditionalTermsClause.js';
import SignatureClause from './FamilyLaw/SignatureClause.js';

export function getFamilyLawAgreementClauses(
  formData: EnrichedFamilyLawAgreementFormData
): FamilyLawAgreementClauseTemplate[] {
  return [
    {
      id: 'partiesClause',
      render: (fd) => {
        if (fd.agreementType === 'Divorce') {
          return (
            <PartiesClause
              petitionerName={fd.petitionerName}
              respondentName={fd.respondentName}
              petitionerAddress={fd.petitionerAddress}
              respondentAddress={fd.respondentAddress}
              petitionerContact={fd.petitionerContact}
              respondentContact={fd.respondentContact}
              executionDate={fd.formattedExecutionDateLong}
            />
          );
        }
        if (fd.agreementType === 'Custody' || fd.agreementType === 'ChildSupport') {
          return (
            <PartiesClause
              motherName={fd.motherName}
              fatherName={fd.fatherName}
              motherAddress={fd.motherAddress}
              fatherAddress={fd.fatherAddress}
              motherContact={fd.motherContact}
              fatherContact={fd.fatherContact}
              executionDate={fd.formattedExecutionDateLong}
            />
          );
        }
        if (fd.agreementType === 'SpousalSupport' || fd.agreementType === 'PropertySettlement') {
          return (
            <PartiesClause
              spouse1Name={fd.spouse1Name}
              spouse2Name={fd.spouse2Name}
              spouse1Address={fd.spouse1Address}
              spouse2Address={fd.spouse2Address}
              spouse1Contact={fd.spouse1Contact}
              spouse2Contact={fd.spouse2Contact}
              executionDate={fd.formattedExecutionDateLong}
            />
          );
        }
        return null;
      },
    },
    ...(formData.agreementType === 'Divorce'
      ? ([
        {
          id: 'divorceClause',
          render: (fd) => (
            <DivorceClause
              marriageDate={fd.formattedMarriageDateLong}
              separationDate={fd.formattedSeparationDateLong}
              groundsForDivorce={fd.groundsForDivorce}
            />
          ),
        },
      ] satisfies FamilyLawAgreementClauseTemplate[])
      : []),
    ...(formData.agreementType === 'Custody'
      ? ([
        {
          id: 'custodyClause',
          render: (fd) => (
            <CustodyClause
              custodyType={fd.custodyType}
              childNames={fd.childNames}
              childDOBs={fd.childDOBs}
              decisionMakingAuthority={fd.decisionMakingAuthority}
            />
          ),
        },
        {
          id: 'visitationClause',
          render: (fd) => (
            <VisitationClause
              visitationSchedule={fd.visitationSchedule}
              visitationScheduleEntries={fd.visitationScheduleEntries}
              holidaySchedule={fd.holidaySchedule}
            />
          ),
        },
      ] satisfies FamilyLawAgreementClauseTemplate[])
      : []),
    ...(formData.agreementType === 'ChildSupport'
      ? ([
        {
          id: 'childSupportClause',
          render: (fd) => (
            <ChildSupportClause
              motherIncome={fd.formattedMotherIncome}
              fatherIncome={fd.formattedFatherIncome}
              custodyPercentageMother={fd.formattedCustodyPercentageMother}
              custodyPercentageFather={fd.formattedCustodyPercentageFather}
              childSupportAmount={fd.formattedChildSupportAmount}
              paymentFrequency={fd.childSupportPaymentFrequency}
              paymentMethod={fd.childSupportPaymentMethod}
              responsibleParty={fd.childSupportResponsibleParty}
              healthInsuranceResponsibility={fd.healthInsuranceResponsibility}
            />
          ),
        },
      ] satisfies FamilyLawAgreementClauseTemplate[])
      : []),
    ...(formData.agreementType === 'SpousalSupport'
      ? ([
        {
          id: 'spousalSupportClause',
          render: (fd) => (
            <SpousalSupportClause
              spousalSupportAmount={fd.formattedSpousalSupportAmount}
              spousalSupportDurationMonths={fd.formattedSpousalSupportDurationMonths}
              terminationConditions={fd.spousalSupportTerminationConditions}
              responsibleParty={fd.spousalSupportResponsibleParty}
            />
          ),
        },
      ] satisfies FamilyLawAgreementClauseTemplate[])
      : []),
    ...(formData.agreementType === 'PropertySettlement'
      ? ([
        {
          id: 'propertyDivisionClause',
          render: (fd) => (
            <PropertyDivisionClause
              propertyDivisionMethod={fd.propertyDivisionMethod}
              assetList={fd.assetList}
              debtAllocation={fd.debtAllocation}
              retirementAccounts={fd.retirementAccounts}
              taxConsiderations={fd.taxConsiderations}
            />
          ),
        },
      ] satisfies FamilyLawAgreementClauseTemplate[])
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
            <AdditionalTermsClause additionalProvisions={fd.additionalProvisions ?? ''} />
          ),
        },
      ] satisfies FamilyLawAgreementClauseTemplate[])
      : []),
    {
      id: 'signatureClause',
      render: (fd) => {
        if (fd.agreementType === 'Divorce') {
          return (
            <SignatureClause
              petitionerSignatoryName={fd.petitionerSignatoryName}
              petitionerSignatoryRole={fd.petitionerSignatoryRole}
              respondentSignatoryName={fd.respondentSignatoryName}
              respondentSignatoryRole={fd.respondentSignatoryRole}
              dateSigned={fd.formattedExecutionDateLong}
            />
          );
        }
        if (fd.agreementType === 'Custody' || fd.agreementType === 'ChildSupport') {
          return (
            <SignatureClause
              motherSignatoryName={fd.motherSignatoryName}
              motherSignatoryRole={fd.motherSignatoryRole}
              fatherSignatoryName={fd.fatherSignatoryName}
              fatherSignatoryRole={fd.fatherSignatoryRole}
              dateSigned={fd.formattedExecutionDateLong}
            />
          );
        }
        if (fd.agreementType === 'SpousalSupport' || fd.agreementType === 'PropertySettlement') {
          return (
            <SignatureClause
              spouse1SignatoryName={fd.spouse1SignatoryName}
              spouse1SignatoryRole={fd.spouse1SignatoryRole}
              spouse2SignatoryName={fd.spouse2SignatoryName}
              spouse2SignatoryRole={fd.spouse2SignatoryRole}
              dateSigned={fd.formattedExecutionDateLong}
            />
          );
        }
        return null;
      },
    },
  ];
}
