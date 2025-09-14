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
          <strong>{resolvedEmployerName}</strong>
          <br />
          {resolvedEmployerTitle}
        </p>

        <p>__________________________</p>
        <p>
          <strong>{resolvedEmployeeName}</strong>
        </p>
      </section>
    </>
  );
}
