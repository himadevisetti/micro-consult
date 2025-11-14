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

  const pairStyle = { marginBottom: '4px', lineHeight: '1.2' };
  const lineStyle = { margin: 0, lineHeight: '1.2', width: '3.5in' };

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

        <br />
        <br />

        {signingParty.map((name, index) => (
          <div key={`signing-party-${index}`} style={pairStyle}>
            <p style={lineStyle}>__________________________</p>
            <p style={lineStyle}>
              <strong>{name.trim()}</strong>
            </p>
            <br />
            <br />
          </div>
        ))}

        <div style={pairStyle}>
          <p style={lineStyle}>__________________________</p>
          <p style={lineStyle}>
            <strong>{resolvedProvider}</strong>
          </p>
        </div>
      </section>
    </>
  );
}
