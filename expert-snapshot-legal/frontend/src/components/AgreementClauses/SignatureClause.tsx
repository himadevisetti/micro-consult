export default function SignatureClause({
  clientName,
  providerName,
  executionDate,
}: {
  clientName?: string;
  providerName?: string;
  executionDate?: string;
}) {
  const resolvedClient = clientName?.trim() || 'Client';
  const resolvedProvider = providerName?.trim() || 'Attorney';
  const resolvedDate = executionDate?.trim() || 'the date of execution';

  return (
    <>
      <br />
      <br />
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
          <strong>{resolvedProvider}</strong>
        </p>
      </section>
    </>
  );
}
