export default function PartiesClause({
  clientName,
  providerName,
  effectiveDate,
}: {
  clientName?: string;
  providerName?: string;
  effectiveDate?: string;
}) {
  const resolvedClient = clientName?.trim() || 'the Client';
  const resolvedProvider = providerName?.trim() || 'the Attorney';
  const resolvedDate = effectiveDate?.trim() || 'the effective date of this Agreement';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Agreement is entered into between <strong>{resolvedClient}</strong> and{' '}
        <strong>{resolvedProvider}</strong>, effective as of <strong>{resolvedDate}</strong>.
      </p>
    </section>
  );
}
