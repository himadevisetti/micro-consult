type NonCompeteClauseProps = {
  durationValue?: number;
  durationUnit?: string;
  employeeName?: string;
  employerName?: string;
  nonCompeteScope?: string;
};

export default function NonCompeteClause({
  durationValue,
  durationUnit,
  employeeName,
  employerName,
  nonCompeteScope,
}: NonCompeteClauseProps) {
  const resolvedDurationValue =
    durationValue !== undefined && durationValue > 0
      ? String(durationValue)
      : 'the agreed';
  const resolvedDurationUnit = durationUnit?.trim() || 'period';
  const resolvedEmployee = employeeName?.trim() || 'the Employee';
  const resolvedEmployer = employerName?.trim() || 'the Employer';

  // Clean up scope text if provided
  const cleanedScope = nonCompeteScope
    ? nonCompeteScope.trim().replace(/\.$/, '')
    : '';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Non-Compete</h3>
      <p>
        <strong>{resolvedEmployee}</strong> agrees not to engage in any business that competes with{' '}
        <strong>{resolvedEmployer}</strong> for a period of{' '}
        <strong>{resolvedDurationValue} {resolvedDurationUnit}</strong> following termination of employment.
        {cleanedScope && <> This restriction applies to <strong>{cleanedScope}</strong>.</>}
      </p>
    </section>
  );
}
