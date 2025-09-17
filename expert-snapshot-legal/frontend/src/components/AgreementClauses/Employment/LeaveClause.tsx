type LeaveClauseProps = {
  annualLeaveDays: string; // now always provided
  sickLeaveDays: string;   // now always provided
};

export default function LeaveClause({ annualLeaveDays, sickLeaveDays }: LeaveClauseProps) {
  const numAnnual = Number(annualLeaveDays);
  const numSick = Number(sickLeaveDays);

  const resolvedAnnualLeave =
    numAnnual === 0
      ? 'no paid annual leave'
      : `${numAnnual} days of paid annual leave`;

  const resolvedSickLeave =
    numSick === 0
      ? 'no paid sick leave'
      : `${numSick} days of paid sick leave`;

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Leave</h3>
      <p>
        The Employee is entitled to <strong>{resolvedAnnualLeave}</strong> per year and{' '}
        <strong>{resolvedSickLeave}</strong>, in accordance with company policy and applicable law.
      </p>
    </section>
  );
}
