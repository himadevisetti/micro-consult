type LeaveClauseProps = {
  annualLeaveDays?: string;
  sickLeaveDays?: string;
};

export default function LeaveClause({ annualLeaveDays, sickLeaveDays }: LeaveClauseProps) {
  const resolvedAnnualLeave = annualLeaveDays?.trim() || 'a reasonable number of';
  const resolvedSickLeave = sickLeaveDays?.trim() || 'a reasonable number of';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Leave</h3>
      <p>
        The Employee is entitled to <strong>{resolvedAnnualLeave}</strong> days of paid annual leave
        per year and <strong>{resolvedSickLeave}</strong> days of paid sick leave, in accordance
        with company policy and applicable law.
      </p>
    </section>
  );
}

