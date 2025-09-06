// src/components/AgreementClauses/Startup/ScopeOfWorkClause.tsx

type ScopeOfWorkClauseProps = {
  scopeOfWork?: string;
  timeCommitment?: string;
};

export default function ScopeOfWorkClause({
  scopeOfWork,
  timeCommitment,
}: ScopeOfWorkClauseProps) {
  const resolvedScope =
    scopeOfWork?.trim() || 'the advisory services described in this Agreement';
  const resolvedTime =
    timeCommitment?.trim() || 'the agreed time commitment';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Scope of Work</h3>
      <p>
        The Advisor shall provide <strong>{resolvedScope}</strong> to the Company,
        dedicating approximately <strong>{resolvedTime}</strong> during the term of this Agreement.
      </p>
    </section>
  );
}

