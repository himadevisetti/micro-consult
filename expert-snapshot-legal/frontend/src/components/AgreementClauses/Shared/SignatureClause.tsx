// src/components/AgreementClauses/Shared/SignatureClause.tsx

type SignatureClauseProps = {
  clientName?: string;
  providerName?: string;
  executionDate?: string; // already formatted, e.g. "August 30, 2025"
};

export default function SignatureClause({
  clientName,
  providerName,
  executionDate,
}: SignatureClauseProps) {
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
