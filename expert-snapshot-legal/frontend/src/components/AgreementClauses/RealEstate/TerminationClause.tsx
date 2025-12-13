// src/components/AgreementClauses/RealEstate/TerminationClause.tsx

type TerminationClauseProps = {
  terminationClause?: string;
  defaultRemedies?: string;
};

export default function TerminationClause({
  terminationClause,
  defaultRemedies,
}: TerminationClauseProps) {
  const resolvedTermination =
    terminationClause?.trim() || 'Termination rights as agreed between the parties';
  const resolvedRemedies =
    defaultRemedies?.trim() || 'Remedies available under applicable law';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Termination</h3>
      <p>
        {resolvedTermination}. Obligations and fees incurred through the date of termination remain enforceable.
        {resolvedRemedies && (
          <> In the event of default, the following remedies shall apply: <strong>{resolvedRemedies}</strong>.</>
        )}
      </p>
    </section>
  );
}
