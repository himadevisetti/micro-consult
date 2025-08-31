// src/components/AgreementClauses/PartiesClause.tsx

type PartiesClauseProps = {
  clientName?: string;
  providerName?: string;
  effectiveDate?: string; // already formatted, e.g. "August 30, 2025"
};

export default function PartiesClause({
  clientName,
  providerName,
  effectiveDate,
}: PartiesClauseProps) {
  const resolvedClient = clientName?.trim() || 'the Client';
  const resolvedProvider = providerName?.trim() || 'the Attorney';
  const resolvedDate = effectiveDate?.trim() || 'the effective date of this Agreement';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Agreement is entered into between <strong>{resolvedClient}</strong> and{' '}
        <strong>{resolvedProvider}</strong>, effective as of <strong>{resolvedDate}</strong>.
      </p>
    </section>
  );
}
