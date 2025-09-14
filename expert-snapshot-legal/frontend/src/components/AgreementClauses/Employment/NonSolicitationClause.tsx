type NonSolicitationClauseProps = {
  employeeName?: string;
  employerName?: string;
};

export default function NonSolicitationClause({
  employeeName,
  employerName,
}: NonSolicitationClauseProps) {
  const resolvedEmployee = employeeName?.trim() || 'the Employee';
  const resolvedEmployer = employerName?.trim() || 'the Employer';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Non-Solicitation</h3>
      <p>
        <strong>{resolvedEmployee}</strong> agrees not to solicit clients, customers, or employees of <strong>{resolvedEmployer}</strong> for a period following termination, as permitted by law.
      </p>
    </section>
  );
}

