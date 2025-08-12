// serializeClauses.tsx
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';

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

/**
 * Safely serializes a JSX.Element to static HTML.
 * Throws if the input is not a valid JSX.Element.
 */
function renderStatic(component: React.ReactElement): string {
  if (!React.isValidElement(component)) {
    throw new Error(
      'Invalid input to renderStatic. Make sure you are passing a JSX element like <MyComponent />.'
    );
  }
  return ReactDOMServer.renderToStaticMarkup(component);
}

/**
 * Generates HTML strings for agreement clauses.
 * Skips any clause listed in the `exclude` array.
 */
export function getSerializedClauses(
  formData: Record<string, string>,
  options?: { exclude?: string[] }
): Record<string, string> {
  const exclude = options?.exclude || [];

  const clauses: Record<string, string> = {};

  if (!exclude.includes('partiesClause')) {
    clauses.partiesClause = renderStatic(
      <PartiesClause
        clientName={formData.clientName}
        legalGroup={formData.legalGroup}
        effectiveDate={formData.startDate}
      />
    );
  }
  if (!exclude.includes('scopeClause')) {
    clauses.scopeClause = renderStatic(
      <ScopeClause retainerPurpose={formData.retainerPurpose} />
    );
  }
  if (!exclude.includes('responsibilitiesClause')) {
    clauses.responsibilitiesClause = renderStatic(<ResponsibilitiesClause />);
  }
  if (!exclude.includes('communicationClause')) {
    clauses.communicationClause = renderStatic(
      <CommunicationClause contactPerson={formData.contactPerson} />
    );
  }
  if (!exclude.includes('feeClause')) {
    clauses.feeClause = renderStatic(
      <FeeClause
        structure={formData.feeStructure}
        rate={formData.feeRate}
        retainerAmount={formData.retainerAmount}
        jurisdiction={formData.jurisdiction}
      />
    );
  }
  if (!exclude.includes('costsClause')) {
    clauses.costsClause = renderStatic(<CostsClause />);
  }
  if (!exclude.includes('confidentialityClause')) {
    clauses.confidentialityClause = renderStatic(<ConfidentialityClause />);
  }
  if (!exclude.includes('terminationClause')) {
    clauses.terminationClause = renderStatic(<TerminationClause />);
  }
  if (!exclude.includes('governingLawClause')) {
    clauses.governingLawClause = renderStatic(
      <GoverningLawClause jurisdiction={formData.jurisdiction} />
    );
  }
  if (!exclude.includes('entireAgreementClause')) {
    clauses.entireAgreementClause = renderStatic(<EntireAgreementClause />);
  }
  if (!exclude.includes('signatureClause')) {
    clauses.signatureClause = renderStatic(
      <SignatureClause
        clientName={formData.clientName}
        legalGroup={formData.legalGroup}
        executionDate={formData.executionDate || formData.startDate}
      />
    );
  }

  return clauses;
}
