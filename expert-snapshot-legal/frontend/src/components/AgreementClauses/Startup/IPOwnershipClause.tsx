// src/components/AgreementClauses/Startup/IPOwnershipClause.tsx

type IPOwnershipClauseProps = {
  ipOwnership?: string; // e.g., "Company", "Advisor", "Joint"
};

export default function IPOwnershipClause({ ipOwnership }: IPOwnershipClauseProps) {
  const resolvedOwnership = ipOwnership?.trim() || 'the Company';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Intellectual Property Ownership</h3>
      <p>
        All intellectual property, work product, and related materials created in connection with
        the Advisor’s services under this Agreement shall be owned by <strong>{resolvedOwnership}</strong>,
        unless otherwise agreed in writing by both parties.
      </p>
    </section>
  );
}

