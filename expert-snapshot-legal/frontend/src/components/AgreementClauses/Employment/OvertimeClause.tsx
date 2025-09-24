type OvertimeClauseProps = {
  overtimePolicy?: string;
};

export default function OvertimeClause({ overtimePolicy }: OvertimeClauseProps) {
  // Trim whitespace and remove a trailing period if present
  const cleanedPolicy = overtimePolicy
    ? overtimePolicy.trim().replace(/\.$/, '')
    : 'applicable law and company policy';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Overtime</h3>
      <p>
        Overtime work will be compensated or otherwise managed in accordance with{' '}
        <strong>{cleanedPolicy}</strong>.
      </p>
    </section>
  );
}
