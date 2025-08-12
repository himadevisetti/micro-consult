import { jsx as _jsx } from "react/jsx-runtime";
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
export function getClauses(formData) {
    return [
        _jsx(PartiesClause, { clientName: formData.clientName, legalGroup: "Expert Snapshot Legal", effectiveDate: formData.startDate }, "parties"),
        _jsx(ScopeClause, { retainerPurpose: formData.retainerPurpose }, "scope"),
        _jsx(ResponsibilitiesClause, {}, "responsibilities"),
        _jsx(CommunicationClause, { contactPerson: formData.clientName }, "communication"),
        _jsx(FeeClause, { structure: formData.feeStructure, rate: "350", retainerAmount: "1500", jurisdiction: formData.jurisdiction }, "fee"),
        _jsx(CostsClause, {}, "costs"),
        _jsx(ConfidentialityClause, {}, "confidentiality"),
        _jsx(TerminationClause, {}, "termination"),
        _jsx(GoverningLawClause, { jurisdiction: formData.jurisdiction }, "governingLaw"),
        _jsx(EntireAgreementClause, {}, "entireAgreement"),
    ];
}
