// expert-snapshot-legal/frontend/src/components/AgreementClauses/clauses.tsx

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

export function getClauses(formData: Record<string, string>) {
  return [
    <PartiesClause
      key="parties"
      clientName={formData.clientName}
      legalGroup="Expert Snapshot Legal"
      effectiveDate={formData.startDate}
    />,
    <ScopeClause key="scope" retainerPurpose={formData.retainerPurpose} />,
    <ResponsibilitiesClause key="responsibilities" />,
    <CommunicationClause key="communication" contactPerson={formData.clientName} />,
    <FeeClause
      key="fee"
      structure={formData.feeStructure}
      rate="350"
      retainerAmount="1500"
      jurisdiction={formData.jurisdiction}
    />,
    <CostsClause key="costs" />,
    <ConfidentialityClause key="confidentiality" />,
    <TerminationClause key="termination" />,
    <GoverningLawClause key="governingLaw" jurisdiction={formData.jurisdiction} />,
    <EntireAgreementClause key="entireAgreement" />,
  ];
}

