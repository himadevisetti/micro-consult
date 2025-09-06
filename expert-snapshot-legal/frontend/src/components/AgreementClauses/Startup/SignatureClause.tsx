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
          <strong>{resolvedCompanyRep}</strong>
          <br />
          {resolvedCompanyTitle}
        </p>

        <p>__________________________</p>
        <p>
          <strong>{resolvedAdvisor}</strong>
        </p>
      </section>
    </>
  );
}

