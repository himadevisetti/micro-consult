type IPOwnershipClauseProps = {
  employerName?: string;
  employeeName?: string;
};

export default function IPOwnershipClause({ employerName, employeeName }: IPOwnershipClauseProps) {
  const resolvedEmployer = employerName?.trim() || 'the Employer';
  const resolvedEmployee = employeeName?.trim() || 'the Employee';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Intellectual Property Ownership</h3>
      <p>
        All intellectual property created by <strong>{resolvedEmployee}</strong> in the course of employment shall be the sole property of <strong>{resolvedEmployer}</strong>, unless otherwise agreed in writing.
      </p>
    </section>
  );
}

