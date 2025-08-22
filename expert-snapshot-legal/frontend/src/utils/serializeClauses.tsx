// src/utils/serializeClauses.tsx

import * as React from 'react';

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

import type { RetainerFormData } from '../types/RetainerFormData';
import { normalizeFormData } from './normalizeFormData';
import { formatDateLong } from './formatDate';

export function getSerializedClauses(
  formData: RetainerFormData,
  options?: { exclude?: string[] }
): Record<string, React.ReactNode> {
  const exclude = options?.exclude || [];
  const clauses: Record<string, React.ReactNode> = {};

  const normalized = normalizeFormData(formData); // formData is already the raw string input

  // convert startDate and endDate into readable long format
  const formattedStartDateLong = formatDateLong(normalized.startDate);
  const formattedEndDateLong = formatDateLong(normalized.endDate);

  const formattedRetainerAmount = normalized.retainerAmount?.toFixed(2) ?? '';
  const formattedFeeAmount = normalized.feeAmount.toFixed(2);

  const wrapClause = (component: React.ReactNode, key: string): React.ReactNode => (
    <div key={key} className={styles.clauseBlock}>
      {component}
    </div>
  );

  if (!exclude.includes('partiesClause')) {
    clauses.partiesClause = wrapClause(
      <PartiesClause
        clientName={formData.clientName}
        providerName={formData.providerName}
        effectiveDate={formattedStartDateLong}
      />,
      'partiesClause'
    );
  }

  if (!exclude.includes('scopeClause')) {
    clauses.scopeClause = wrapClause(
      <ScopeClause matterDescription={formData.matterDescription} />,
      'scopeClause'
    );
  }

  if (!exclude.includes('responsibilitiesClause')) {
    clauses.responsibilitiesClause = wrapClause(<ResponsibilitiesClause />, 'responsibilitiesClause');
  }

  if (!exclude.includes('communicationClause')) {
    clauses.communicationClause = wrapClause(
      <CommunicationClause clientName={formData.clientName} />,
      'communicationClause'
    );
  }

  if (!exclude.includes('feeClause')) {
    clauses.feeClause = wrapClause(
      <FeeClause
        structure={formData.feeStructure}
        feeAmount={formattedFeeAmount}
        retainerAmount={formattedRetainerAmount}
        jurisdiction={formData.jurisdiction}
      />,
      'feeClause'
    );
  }

  if (!exclude.includes('costsClause')) {
    clauses.costsClause = wrapClause(<CostsClause />, 'costsClause');
  }

  if (!exclude.includes('confidentialityClause')) {
    clauses.confidentialityClause = wrapClause(<ConfidentialityClause />, 'confidentialityClause');
  }

  if (!exclude.includes('terminationClause')) {
    clauses.terminationClause = wrapClause(
      <TerminationClause endDate={formattedEndDateLong} />,
      'terminationClause'
    );
  }

  if (!exclude.includes('governingLawClause')) {
    clauses.governingLawClause = wrapClause(
      <GoverningLawClause jurisdiction={formData.jurisdiction} />,
      'governingLawClause'
    );
  }

  if (!exclude.includes('entireAgreementClause')) {
    clauses.entireAgreementClause = wrapClause(<EntireAgreementClause />, 'entireAgreementClause');
  }

  if (!exclude.includes('signatureClause')) {
    clauses.signatureClause = wrapClause(
      <SignatureClause
        clientName={formData.clientName}
        providerName={formData.providerName}
        executionDate={formattedStartDateLong}
      />,
      'signatureClause'
    );
  }

  return clauses;
}
