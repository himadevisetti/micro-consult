// src/components/AgreementClauses/Shared/ConfidentialityClause.tsx

type ConfidentialityClauseProps = {
  disclosingParty?: string;
  receivingParty?: string;
};

export default function ConfidentialityClause({
  disclosingParty = 'the Parties',
  receivingParty = 'the Parties',
}: ConfidentialityClauseProps) {
  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Confidentiality</h3>
      <p>
        All communications, materials, proprietary information, invention disclosures, and related
        exchanges between <strong>{disclosingParty}</strong> and <strong>{receivingParty}</strong>{' '}
        shall remain confidential and protected under applicable intellectual property and
        attorney‑client privilege laws. The parties agree not to disclose such information to any
        third party without prior written consent, except as required by law.
      </p>
    </section>
  );
}

