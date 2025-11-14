// src/components/AgreementClauses/Startup/SignatureClause.tsx

type SignatureClauseProps = {
  companyRepName?: string;
  companyRepTitle?: string;
  advisorName?: string;
  dateSigned?: string; // already formatted, e.g. "August 30, 2025"
};

export default function SignatureClause({
  companyRepName,
  companyRepTitle,
  advisorName,
  dateSigned,
}: SignatureClauseProps) {
  const resolvedCompanyRep = companyRepName?.trim() || 'Authorized Representative';
  const resolvedCompanyTitle = companyRepTitle?.trim() || 'Title';
  const resolvedAdvisor = advisorName?.trim() || 'Advisor';
  const resolvedDate = dateSigned?.trim() || 'the date of execution';

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
            <strong>{resolvedCompanyRep}</strong>
            <br />
            {resolvedCompanyTitle}
          </p>
        </div>

        <br />
        <br />

        <div style={pairStyle}>
          <p style={lineStyle}>__________________________</p>
          <p style={lineStyle}>
            <strong>{resolvedAdvisor}</strong>
          </p>
        </div>
      </section>
    </>
  );
}
