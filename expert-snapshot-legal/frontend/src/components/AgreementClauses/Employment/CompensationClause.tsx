type CompensationClauseProps = {
  contractType?: string;
  baseSalary?: string;
  payFrequency?: string;
  hourlyRate?: string;
  hoursPerWeek?: string;
  bonusAmount?: string;
  bonusUnit?: string;
};

export default function CompensationClause({
  contractType,
  baseSalary,
  payFrequency,
  hourlyRate,
  hoursPerWeek,
  bonusAmount,
  bonusUnit,
}: CompensationClauseProps) {
  // Normalize contract type
  const type = (contractType ?? '').trim().toLowerCase();

  // Define which types are hourly-based in your product
  const HOURLY_TYPES = new Set(['hourly', 'temporary', 'part-time']);

  // Derive payment model with a defensive fallback
  const isHourly =
    HOURLY_TYPES.has(type) ||
    (!!(hourlyRate && hourlyRate.trim()) && !(baseSalary && baseSalary.trim()));

  const resolvedBaseSalary = baseSalary?.trim() || 'the agreed salary';
  const resolvedPayFrequency = payFrequency?.trim() || 'the agreed schedule';
  const resolvedHourlyRate = hourlyRate?.trim() || 'the agreed hourly rate';
  const resolvedHoursPerWeek = hoursPerWeek?.trim() || 'the agreed number of';

  const parsedBonus = bonusAmount != null ? parseFloat(bonusAmount) : null;
  const hasBonusField =
    bonusAmount != null &&
    bonusAmount.trim() !== '' &&
    bonusUnit != null &&
    bonusUnit.trim().toLowerCase() !== 'none';

  const bonusText =
    hasBonusField && parsedBonus !== null
      ? parsedBonus > 0
        ? (
          <>
            The Employee will receive a bonus of{' '}
            <strong>
              ${bonusAmount} {bonusUnit?.toLowerCase()}
            </strong>.
          </>
        )
        : 'The Employee will not be entitled to a bonus for this year.'
      : '';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Compensation</h3>
      {isHourly ? (
        <p>
          The Employee will be compensated at <strong>${resolvedHourlyRate}</strong> per hour for{' '}
          <strong>{resolvedHoursPerWeek}</strong> hours per week.
          {bonusText && ' '}
          {bonusText}
        </p>
      ) : (
        <p>
          The Employee will receive a base salary of <strong>${resolvedBaseSalary}</strong>, payable{' '}
          <strong>{resolvedPayFrequency}</strong>.
          {bonusText && ' '}
          {bonusText}
        </p>
      )}
    </section>
  );
}
