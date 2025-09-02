// src/components/AgreementClauses/Standard/TerminationClause.tsx

type TerminationClauseProps = {
  endDate?: string; // already formatted, e.g. "August 30, 2025"
};

export default function TerminationClause({ endDate }: TerminationClauseProps) {
  const resolvedEndDate = endDate?.trim() || 'the end date of this Agreement';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Termination</h3>
      <p>
        Either party may terminate this agreement with written notice. Client remains responsible
        for fees incurred through the date of termination. This agreement will automatically
        terminate on <strong>{resolvedEndDate}</strong> unless extended in writing.
      </p>
    </section>
  );
}
