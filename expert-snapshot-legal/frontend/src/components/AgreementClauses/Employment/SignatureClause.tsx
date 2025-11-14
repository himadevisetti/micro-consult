// src/components/AgreementClauses/Employment/SignatureClause.tsx

type SignatureClauseProps = {
  employerSignatoryName?: string;
  employerSignatoryTitle?: string;
  employeeName?: string;
  dateSigned?: string; // already formatted, e.g. "August 30, 2025"
};

export default function SignatureClause({
  employerSignatoryName,
  employerSignatoryTitle,
  employeeName,
  dateSigned,
}: SignatureClauseProps) {
  const resolvedEmployerName =
    employerSignatoryName?.trim() || 'Authorized Representative';
  const resolvedEmployerTitle =
    employerSignatoryTitle?.trim() || 'Title';
  const resolvedEmployeeName =
    employeeName?.trim() || 'Employee';
  const resolvedDate =
    dateSigned?.trim() || 'the date of execution';

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
            <strong>{resolvedEmployerName}</strong>
            <br />
            {resolvedEmployerTitle}
          </p>
        </div>

        <br />
        <br />

        <div style={pairStyle}>
          <p style={lineStyle}>__________________________</p>
          <p style={lineStyle}>
            <strong>{resolvedEmployeeName}</strong>
          </p>
        </div>
      </section>
    </>
  );
}
