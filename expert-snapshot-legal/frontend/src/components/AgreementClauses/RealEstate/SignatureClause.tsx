// src/components/AgreementClauses/RealEstate/SignatureClause.tsx

type SignatureClauseProps = {
  partySignatoryName?: string;
  partySignatoryRole?: string;
  executionDate?: string; // already formatted, e.g. "December 11, 2025"
};

export default function SignatureClause({
  partySignatoryName,
  partySignatoryRole,
  executionDate,
}: SignatureClauseProps) {
  const resolvedSignatory = partySignatoryName?.trim() || 'Authorized Signatory';
  const resolvedRole = partySignatoryRole?.trim() || 'Role';
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

        <div style={pairStyle}>
          <p style={lineStyle}>__________________________</p>
          <p style={lineStyle}>
            <strong>{resolvedSignatory}</strong>
            <br />
            {resolvedRole}
          </p>
        </div>
      </section>
    </>
  );
}
