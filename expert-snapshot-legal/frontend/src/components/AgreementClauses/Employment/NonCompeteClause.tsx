type NonCompeteClauseProps = {
  durationValue?: string;
  durationUnit?: string;
  employeeName?: string;
  employerName?: string;
};

export default function NonCompeteClause({
  durationValue,
  durationUnit,
  employeeName,
  employerName,
}: NonCompeteClauseProps) {
  const resolvedDurationValue = durationValue?.trim() || 'the agreed';
  const resolvedDurationUnit = durationUnit?.trim() || 'period';
  const resolvedEmployee = employeeName?.trim() || 'the Employee';
  const resolvedEmployer = employerName?.trim() || 'the Employer';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Non-Compete</h3>
      <p>
        <strong>{resolvedEmployee}</strong> agrees not to engage in any business that competes with <strong>{resolvedEmployer}</strong> for a period of <strong>{resolvedDurationValue} {resolvedDurationUnit}</strong> following termination of employment.
      </p>
    </section>
  );
}

