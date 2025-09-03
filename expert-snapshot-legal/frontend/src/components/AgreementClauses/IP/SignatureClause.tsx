// src/components/AgreementClauses/IP/SignatureClause.tsx

type SignatureClauseProps = {
  signingParty: string[]; // one or more names
  providerName?: string;
  executionDate?: string; // already formatted, e.g. "August 30, 2025"
};

export default function SignatureClause({
  signingParty,
  providerName,
  executionDate,
}: SignatureClauseProps) {
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

        {signingParty.map((name, index) => (
          <div key={`signing-party-${index}`}>
            <p>__________________________</p>
            <p>
              <strong>{name.trim()}</strong>
            </p>
          </div>
        ))}

        <p>__________________________</p>
        <p>
          <strong>{resolvedProvider}</strong>
        </p>
      </section>
    </>
  );
}
