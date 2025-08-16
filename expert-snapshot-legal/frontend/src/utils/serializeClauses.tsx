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

import type { RetainerFormData } from '../types/RetainerFormData';
import { formatDateMMDDYYYY } from '../utils/formatDate'; // Assumes this exists

function renderStatic(component: React.ReactElement): string {
  if (!React.isValidElement(component)) {
    throw new Error('Invalid input to renderStatic. Expected a JSX element.');
  }
  return ReactDOMServer.renderToStaticMarkup(component);
}

export function getSerializedClauses(
  formData: RetainerFormData,
  options?: { exclude?: string[] }
): Record<string, string> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, string> = {};

  const formattedStartDate = formatDateMMDDYYYY(formData.startDate);
  const formattedEndDate = formatDateMMDDYYYY(formData.endDate);
  const formattedRetainerAmount = formData.retainerAmount?.toFixed(2) ?? '';
  const formattedFeeAmount = formData.feeAmount.toFixed(2);

  const wrapClause = (html: string): string =>
    `<div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 24px;">${html}</div>`;

  if (!exclude.includes('partiesClause')) {
    clauses.partiesClause = wrapClause(
      renderStatic(
        <PartiesClause
          clientName={formData.clientName}
          providerName={formData.providerName}
          effectiveDate={formattedStartDate}
        />
      )
    );
  }

  if (!exclude.includes('scopeClause')) {
    clauses.scopeClause = wrapClause(
      renderStatic(<ScopeClause matterDescription={formData.matterDescription} />)
    );
  }

  if (!exclude.includes('responsibilitiesClause')) {
    clauses.responsibilitiesClause = wrapClause(
      renderStatic(<ResponsibilitiesClause />)
    );
  }

  if (!exclude.includes('communicationClause')) {
    clauses.communicationClause = wrapClause(
      renderStatic(<CommunicationClause clientName={formData.clientName} />)
    );
  }

  if (!exclude.includes('feeClause')) {
    clauses.feeClause = wrapClause(
      renderStatic(
        <FeeClause
          structure={formData.feeStructure}
          feeAmount={formattedFeeAmount}
          retainerAmount={formattedRetainerAmount}
          jurisdiction={formData.jurisdiction}
        />
      )
    );
  }

  if (!exclude.includes('costsClause')) {
    clauses.costsClause = wrapClause(renderStatic(<CostsClause />));
  }

  if (!exclude.includes('confidentialityClause')) {
    clauses.confidentialityClause = wrapClause(
      renderStatic(<ConfidentialityClause />)
    );
  }

  if (!exclude.includes('terminationClause')) {
    clauses.terminationClause = wrapClause(renderStatic(<TerminationClause />));
  }

  if (!exclude.includes('governingLawClause')) {
    clauses.governingLawClause = wrapClause(
      renderStatic(<GoverningLawClause jurisdiction={formData.jurisdiction} />)
    );
  }

  if (!exclude.includes('entireAgreementClause')) {
    clauses.entireAgreementClause = wrapClause(
      renderStatic(<EntireAgreementClause />)
    );
  }

  if (!exclude.includes('signatureClause')) {
    clauses.signatureClause = wrapClause(
      renderStatic(
        <SignatureClause
          clientName={formData.clientName}
          providerName={formData.providerName}
          executionDate={formattedStartDate}
        />
      )
    );
  }

  return clauses;
}

