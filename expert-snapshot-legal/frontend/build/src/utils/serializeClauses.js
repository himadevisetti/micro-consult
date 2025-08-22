import { jsx as _jsx } from "react/jsx-runtime";
import PartiesClause from '../components/AgreementClauses/PartiesClause.js';
import ScopeClause from '../components/AgreementClauses/ScopeClause.js';
import ResponsibilitiesClause from '../components/AgreementClauses/ResponsibilitiesClause.js';
import CommunicationClause from '../components/AgreementClauses/CommunicationClause.js';
import FeeClause from '../components/AgreementClauses/FeeClause.js';
import CostsClause from '../components/AgreementClauses/CostsClause.js';
import ConfidentialityClause from '../components/AgreementClauses/ConfidentialityClause.js';
import TerminationClause from '../components/AgreementClauses/TerminationClause.js';
import GoverningLawClause from '../components/AgreementClauses/GoverningLawClause.js';
import EntireAgreementClause from '../components/AgreementClauses/EntireAgreementClause.js';
import SignatureClause from '../components/AgreementClauses/SignatureClause.js';
import styles from '../styles/StandardPreview.module.css';
import { normalizeFormData } from './normalizeFormData';
import { formatDateLong } from './formatDate';
export function getSerializedClauses(formData, options) {
    const exclude = options?.exclude || [];
    const clauses = {};
    const normalized = normalizeFormData(formData); // formData is already the raw string input
    // convert startDate and endDate into readable long format
    const formattedStartDateLong = formatDateLong(normalized.startDate);
    const formattedEndDateLong = formatDateLong(normalized.endDate);
    const formattedRetainerAmount = normalized.retainerAmount?.toFixed(2) ?? '';
    const formattedFeeAmount = normalized.feeAmount.toFixed(2);
    const wrapClause = (component, key) => (_jsx("div", { className: styles.clauseBlock, children: component }, key));
    if (!exclude.includes('partiesClause')) {
        clauses.partiesClause = wrapClause(_jsx(PartiesClause, { clientName: formData.clientName, providerName: formData.providerName, effectiveDate: formattedStartDateLong }), 'partiesClause');
    }
    if (!exclude.includes('scopeClause')) {
        clauses.scopeClause = wrapClause(_jsx(ScopeClause, { matterDescription: formData.matterDescription }), 'scopeClause');
    }
    if (!exclude.includes('responsibilitiesClause')) {
        clauses.responsibilitiesClause = wrapClause(_jsx(ResponsibilitiesClause, {}), 'responsibilitiesClause');
    }
    if (!exclude.includes('communicationClause')) {
        clauses.communicationClause = wrapClause(_jsx(CommunicationClause, { clientName: formData.clientName }), 'communicationClause');
    }
    if (!exclude.includes('feeClause')) {
        clauses.feeClause = wrapClause(_jsx(FeeClause, { structure: formData.feeStructure, feeAmount: formattedFeeAmount, retainerAmount: formattedRetainerAmount, jurisdiction: formData.jurisdiction }), 'feeClause');
    }
    if (!exclude.includes('costsClause')) {
        clauses.costsClause = wrapClause(_jsx(CostsClause, {}), 'costsClause');
    }
    if (!exclude.includes('confidentialityClause')) {
        clauses.confidentialityClause = wrapClause(_jsx(ConfidentialityClause, {}), 'confidentialityClause');
    }
    if (!exclude.includes('terminationClause')) {
        clauses.terminationClause = wrapClause(_jsx(TerminationClause, { endDate: formattedEndDateLong }), 'terminationClause');
    }
    if (!exclude.includes('governingLawClause')) {
        clauses.governingLawClause = wrapClause(_jsx(GoverningLawClause, { jurisdiction: formData.jurisdiction }), 'governingLawClause');
    }
    if (!exclude.includes('entireAgreementClause')) {
        clauses.entireAgreementClause = wrapClause(_jsx(EntireAgreementClause, {}), 'entireAgreementClause');
    }
    if (!exclude.includes('signatureClause')) {
        clauses.signatureClause = wrapClause(_jsx(SignatureClause, { clientName: formData.clientName, providerName: formData.providerName, executionDate: formattedStartDateLong }), 'signatureClause');
    }
    return clauses;
}
