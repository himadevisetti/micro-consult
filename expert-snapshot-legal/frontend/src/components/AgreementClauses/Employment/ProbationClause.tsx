type ProbationClauseProps = {
  probationPeriod?: string; // formatted number string
  probationPeriodUnit?: string;
};

export default function ProbationClause({
  probationPeriod,
  probationPeriodUnit,
}: ProbationClauseProps) {
  const hasPeriod =
    probationPeriod?.trim() &&
    probationPeriodUnit?.trim() &&
    probationPeriodUnit.trim().toLowerCase() !== 'none';

  const resolvedProbation = hasPeriod
    ? `${probationPeriod} ${probationPeriodUnit?.toLowerCase()}`
    : 'a period determined by the Employer';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Probation</h3>
      <p>
        The Employee will be subject to a probationary period of{' '}
        <strong>{resolvedProbation}</strong>, during which performance and suitability for the role
        will be evaluated.
      </p>
    </section>
  );
}
