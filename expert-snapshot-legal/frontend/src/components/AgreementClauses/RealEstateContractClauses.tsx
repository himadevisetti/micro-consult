// src/components/AgreementClauses/RealEstateContractClauses.tsx

import type { EnrichedRealEstateContractFormData } from '@/utils/serializeRealEstateContractClauses';
import type { RealEstateContractClauseTemplate } from '@/utils/serializeRealEstateContractClauses';

import PartiesClause from './RealEstate/PartiesClause.js';
import PropertyClause from './RealEstate/PropertyClause.js';
import FinancialTermsClause from './RealEstate/FinancialTermsClause.js';
import ContingenciesClause from './RealEstate/ContingenciesClause.js';
import EscrowClause from './RealEstate/EscrowClause.js';
import TerminationClause from './RealEstate/TerminationClause.js';
import GoverningLawClause from './Shared/GoverningLawClause.js';
import DisputeResolutionClause from './Shared/DisputeResolutionClause.js';
import AdditionalTermsClause from './RealEstate/AdditionalTermsClause.js';
import SignatureClause from './RealEstate/SignatureClause.js';

export function getRealEstateContractClauses(
  formData: EnrichedRealEstateContractFormData
): RealEstateContractClauseTemplate[] {
  const asBool = (v: unknown) => v === true || v === 'true';

  return [
    {
      id: 'partiesClause',
      render: (fd) => (
        <PartiesClause
          buyerName={fd.buyerName}
          sellerName={fd.sellerName}
          tenantName={fd.tenantName}
          landlordName={fd.landlordName}
          brokerName={fd.brokerName}
          executionDate={fd.formattedExecutionDateLong}
          contractType={fd.contractType}
        />
      ),
    },
    {
      id: 'propertyClause',
      render: (fd) => (
        <PropertyClause
          propertyAddress={fd.propertyAddress}
          legalDescription={fd.legalDescription}
        />
      ),
    },
    {
      id: 'financialTermsClause',
      render: (fd) => (
        <FinancialTermsClause
          contractType={fd.contractType}
          purchasePrice={fd.formattedPurchasePrice}
          earnestMoneyDeposit={fd.formattedEarnestMoneyDeposit}
          financingTerms={fd.financingTerms}
          rentAmount={fd.formattedRentAmount}
          securityDeposit={fd.formattedSecurityDeposit}
          paymentFrequency={fd.paymentFrequency}
          optionFee={fd.formattedOptionFee}
          rentCreditTowardPurchase={fd.formattedRentCreditTowardPurchase}
          commissionValue={fd.formattedCommissionValue}
          commissionUnit={fd.commissionUnit}
          leaseDuration={fd.formattedLeaseDuration}
        />
      ),
    },
    {
      id: 'contingenciesClause',
      render: (fd) => (
        <ContingenciesClause
          inspectionContingency={asBool(fd.inspectionContingency)}
          appraisalContingency={asBool(fd.appraisalContingency)}
          financingContingency={asBool(fd.financingContingency)}
          titleClearance={asBool(fd.titleClearance)}
          renewalOptions={fd.renewalOptions}
          disclosureAcknowledgment={asBool(fd.disclosureAcknowledgment)}
        />
      ),
    },
    ...(
      formData.contractType === 'Purchase' &&
        (formData.escrowAgencyName?.trim() || formData.closingCostsResponsibility?.trim())
        ? [{
          id: 'escrowClause',
          render: (fd) => (
            <EscrowClause
              escrowAgencyName={fd.escrowAgencyName}
              closingCostsResponsibility={fd.closingCostsResponsibility}
            />
          ),
        }] satisfies RealEstateContractClauseTemplate[]
        : []
    ),
    ...(formData.terminationClause?.trim() || formData.defaultRemedies?.trim()
      ? [{
        id: 'terminationClause',
        render: (fd) => (
          <TerminationClause
            terminationClause={fd.terminationClause}
            defaultRemedies={fd.defaultRemedies}
          />
        ),
      }] satisfies RealEstateContractClauseTemplate[]
      : []),
    {
      id: 'governingLawClause',
      render: (fd) => <GoverningLawClause jurisdiction={fd.governingLaw} />,
    },
    {
      id: 'disputeResolutionClause',
      render: (fd) => (
        <DisputeResolutionClause
          method={fd.disputeResolution}
          jurisdiction={fd.governingLaw}
        />
      ),
    },
    ...(formData.additionalProvisions?.trim()
      ? ([
        {
          id: 'additionalTermsClause',
          render: (fd) => (
            <AdditionalTermsClause additionalProvisions={fd.additionalProvisions ?? ''} />
          ),
        },
      ] satisfies RealEstateContractClauseTemplate[])
      : []),
    {
      id: 'signatureClause',
      render: (fd) => (
        <SignatureClause
          partySignatoryName={fd.partySignatoryName}
          partySignatoryRole={fd.partySignatoryRole}
          executionDate={fd.formattedExecutionDateLong}
        />
      ),
    },
  ];
}