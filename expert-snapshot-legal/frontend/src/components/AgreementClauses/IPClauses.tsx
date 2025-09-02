// src/components/AgreementClauses/IPClauses.tsx

import type { EnrichedIPFormData } from '@/utils/serializeIPClauses';
import type { IPClauseTemplate } from '@/utils/serializeIPClauses';

import PartiesClause from './IP/PartiesClause.js';
import IPDescriptionClause from './IP/IPDescriptionClause.js';
import LicenseClause from './IP/LicenseClause.js';
import ConfidentialityClause from './IP/ConfidentialityClause.js';
import InventionAssignmentClause from './IP/InventionAssignmentClause.js';
import FeeClause from './IP/FeeClause.js';
import GoverningLawClause from './Shared/GoverningLawClause.js';
import ExpirationClause from './IP/ExpirationClause.js';
import EntireAgreementClause from './Shared/EntireAgreementClause.js';
import SignatureClause from './Shared/SignatureClause.js';

export function getIPClauses(formData: EnrichedIPFormData): IPClauseTemplate[] {
  return [
    {
      id: 'partiesClause',
      render: (fd) => (
        <PartiesClause
          clientName={fd.clientName}
          providerName={fd.providerName}
          inventorName={fd.inventorName}
          effectiveDate={fd.formattedEffectiveDateLong}
        />
      ),
    },
    {
      id: 'ipDescriptionClause',
      render: (fd) => (
        <IPDescriptionClause
          ipTitle={fd.ipTitle}
          ipType={fd.ipType}
          matterDescription={fd.matterDescription}
        />
      ),
    },
    {
      id: 'licenseClause',
      render: (fd) => (
        <LicenseClause
          licenseScope={fd.licenseScope}
          jurisdiction={fd.jurisdiction}
        />
      ),
    },
    {
      id: 'feeClause',
      render: (fd) => (
        <FeeClause
          structure={fd.feeStructure}
          feeAmount={fd.formattedFeeAmount}
          retainerAmount={fd.formattedRetainerAmount}
          jurisdiction={fd.jurisdiction}
        />
      ),
    },
    {
      id: 'expirationClause',
      render: (fd) => (
        <ExpirationClause expirationDate={fd.formattedExpirationDateLong} />
      ),
    },
    {
      id: 'governingLawClause',
      render: (fd) => (
        <GoverningLawClause jurisdiction={fd.jurisdiction} />
      ),
    },
    {
      id: 'entireAgreementClause',
      render: () => <EntireAgreementClause />,
    },
    ...(formData.includeConfidentiality
      ? [
        {
          id: 'confidentialityClause',
          render: () => <ConfidentialityClause />,
        },
      ]
      : []),
    ...(formData.includeInventionAssignment
      ? [
        {
          id: 'inventionAssignmentClause',
          render: (fd: EnrichedIPFormData) => (
            <InventionAssignmentClause clientName={fd.clientName} />
          ),
        },
      ]
      : []),
    {
      id: 'signatureClause',
      render: (fd) => (
        <SignatureClause
          clientName={fd.clientName}
          providerName={fd.providerName}
          executionDate={fd.formattedExecutionDateLong}
        />
      ),
    },
  ];
}

