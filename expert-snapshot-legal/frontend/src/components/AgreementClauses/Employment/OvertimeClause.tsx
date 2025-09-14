type OvertimeClauseProps = {
  overtimePolicy?: string;
};

export default function OvertimeClause({ overtimePolicy }: OvertimeClauseProps) {
  const resolvedPolicy = overtimePolicy?.trim() || 'as per applicable law and company policy';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Overtime</h3>
      <p>
        Overtime work will be compensated or otherwise managed in accordance with <strong>{resolvedPolicy}</strong>.
      </p>
    </section>
  );
}

