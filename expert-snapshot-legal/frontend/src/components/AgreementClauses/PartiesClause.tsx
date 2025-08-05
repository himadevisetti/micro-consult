export default function PartiesClause({
  clientName,
  legalGroup,
  effectiveDate,
}: {
  clientName?: string;
  legalGroup?: string;
  effectiveDate?: string;
}) {
  const resolvedClient = clientName?.trim() || 'the Client';
  const resolvedGroup = legalGroup?.trim() || 'the Attorney';
  const resolvedDate = effectiveDate?.trim() || 'the effective date of this Agreement';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Agreement is entered into between <strong>{resolvedClient}</strong> and{' '}
        <strong>{resolvedGroup}</strong>, effective as of <strong>{resolvedDate}</strong>.
      </p>
    </section>
  );
}
