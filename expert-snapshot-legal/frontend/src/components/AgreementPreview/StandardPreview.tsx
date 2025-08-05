import { useEffect, useRef } from 'react';
import PartiesClause from '../AgreementClauses/PartiesClause';
import ScopeClause from '../AgreementClauses/ScopeClause';
import ResponsibilitiesClause from '../AgreementClauses/ResponsibilitiesClause';
import FeeClause from '../AgreementClauses/FeeClause';
import CostsClause from '../AgreementClauses/CostsClause';
import CommunicationClause from '../AgreementClauses/CommunicationClause';
import ConfidentialityClause from '../AgreementClauses/ConfidentialityClause';
import TerminationClause from '../AgreementClauses/TerminationClause';
import GoverningLawClause from '../AgreementClauses/GoverningLawClause';
import EntireAgreementClause from '../AgreementClauses/EntireAgreementClause';
import SignatureClause from '../AgreementClauses/SignatureClause';
import styles from '../../styles/StandardPreview.module.css';

interface PreviewProps {
  formData: Record<string, string>;
  onRefReady?: (element: HTMLElement | null) => void;
}

export default function StandardPreview({ formData, onRefReady }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  // Pass the ref back to parent if needed for export
  // if (onRefReady) {
  // onRefReady(previewRef.current);
  // }

  useEffect(() => {
    if (onRefReady && previewRef.current) {
      console.log('Preview ref mounted: ', previewRef.current);
      onRefReady(previewRef.current);
    }
  }, [onRefReady]);

  return (
    <div ref={previewRef} className={styles.retainerPreview}>
      <h2>Legal Retainer Agreement</h2>

      <PartiesClause
        clientName={formData.clientName}
        legalGroup="Expert Snapshot Legal"
        effectiveDate={formData.startDate}
      />

      <ScopeClause retainerPurpose={formData.retainerPurpose} />
      <ResponsibilitiesClause />
      <CommunicationClause contactPerson={formData.clientName} />

      <FeeClause
        structure={formData.feeStructure}
        rate="350"
        retainerAmount="1500"
        jurisdiction={formData.jurisdiction}
      />

      <CostsClause />
      <ConfidentialityClause />
      <TerminationClause />
      <GoverningLawClause jurisdiction={formData.jurisdiction} />
      <EntireAgreementClause />

      <SignatureClause
        clientName={formData.clientName}
        legalGroup="Expert Snapshot Legal"
        executionDate={formData.startDate}
      />
    </div>
  );
}
