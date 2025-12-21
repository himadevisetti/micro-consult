// src/components/AgreementClauses/RealEstate/TerminationClause.tsx

type TerminationClauseProps = {
  terminationClause?: string;
  defaultRemedies?: string;
};

// Utility to strip trailing periods
function normalizeSentence(input?: string, fallback?: string): string {
  const trimmed = input?.trim();
  if (!trimmed) return fallback ?? '';
  return trimmed.replace(/\.*$/, '');
}

export default function TerminationClause({
  terminationClause,
  defaultRemedies,
}: TerminationClauseProps) {
  const resolvedTermination =
    normalizeSentence(terminationClause, 'Termination rights as agreed between the parties');
  const resolvedRemedies = normalizeSentence(defaultRemedies);

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