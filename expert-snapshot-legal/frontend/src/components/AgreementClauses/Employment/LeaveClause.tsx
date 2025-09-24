type LeaveClauseProps = {
  annualLeaveDays: string; // always provided
  sickLeaveDays: string;   // always provided
};

export default function LeaveClause({ annualLeaveDays, sickLeaveDays }: LeaveClauseProps) {
  const numAnnual = Number(annualLeaveDays);
  const numSick = Number(sickLeaveDays);

  const hasAnnual = numAnnual > 0;
  const hasSick = numSick > 0;

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Leave</h3>
      {hasAnnual || hasSick ? (
        <p>
          The Employee is entitled to{' '}
          {hasAnnual ? (
            <strong>{numAnnual} days of paid annual leave</strong>
          ) : (
            <strong>no paid annual leave</strong>
          )}{' '}
          per year and{' '}
          {hasSick ? (
            <strong>{numSick} days of paid sick leave</strong>
          ) : (
            <strong>no paid sick leave</strong>
          )}
          , in accordance with company policy and applicable law.
        </p>
      ) : (
        <p>
          The Employee is not entitled to any paid annual or sick leave under this Agreement.
        </p>
      )}
    </section>
  );
}
