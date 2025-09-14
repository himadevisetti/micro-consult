type CompensationClauseProps = {
  contractType?: string;
  baseSalary?: string;
  payFrequency?: string;
  hourlyRate?: string;
  hoursPerWeek?: string;
  bonusAmount?: string; // formatted string
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
  const resolvedContractType = contractType?.trim();
  const resolvedBaseSalary = baseSalary?.trim() || 'the agreed salary';
  const resolvedPayFrequency = payFrequency?.trim() || 'the agreed schedule';
  const resolvedHourlyRate = hourlyRate?.trim() || 'the agreed hourly rate';
  const resolvedHoursPerWeek = hoursPerWeek?.trim() || 'the agreed number of';

  const hasBonus =
    bonusAmount != null &&
    bonusAmount.trim() !== '' &&
    bonusUnit != null &&
    bonusUnit.trim().toLowerCase() !== 'none';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Compensation</h3>
      {resolvedContractType === 'hourly' ? (
        <p>
          The Employee will be compensated at <strong>{resolvedHourlyRate}</strong> per hour for{' '}
          <strong>{resolvedHoursPerWeek}</strong> hours per week.
        </p>
      ) : (
        <p>
          The Employee will receive a base salary of <strong>{resolvedBaseSalary}</strong>, payable{' '}
          <strong>{resolvedPayFrequency}</strong>.
        </p>
      )}
      {hasBonus && (
        <p>
          The Employee will receive a bonus of{' '}
          <strong>
            {bonusAmount} {bonusUnit?.toLowerCase()}
          </strong>
          .
        </p>
      )}
    </section>
  );
}
