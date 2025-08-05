export default function SignatureClause({
  clientName,
  legalGroup,
  executionDate,
}: {
  clientName?: string;
  legalGroup?: string;
  executionDate?: string;
}) {
  const resolvedClient = clientName?.trim() || 'Client';
  const resolvedGroup = legalGroup?.trim() || 'Attorney';
  const resolvedDate = executionDate?.trim() || 'the date of execution';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Signatures</h3>
      <p>
        IN WITNESS WHEREOF, the parties have executed this Agreement as of{' '}
        <strong>{resolvedDate}</strong>.
      </p>
      <p>__________________________</p>
      <p>
        <strong>{resolvedClient}</strong>
      </p>
      <p>__________________________</p>
      <p>
        <strong>{resolvedGroup}</strong>
      </p>
    </section>
  );
}
