// src/components/AgreementClauses/FamilyLaw/SignatureClause.tsx

type SignatureClauseProps = {
  // Divorce
  petitionerSignatoryName?: string;
  petitionerSignatoryRole?: string;
  respondentSignatoryName?: string;
  respondentSignatoryRole?: string;

  // Custody / Child Support
  motherSignatoryName?: string;
  motherSignatoryRole?: string;
  fatherSignatoryName?: string;
  fatherSignatoryRole?: string;

  // Spousal Support / Property Settlement
  spouse1SignatoryName?: string;
  spouse1SignatoryRole?: string;
  spouse2SignatoryName?: string;
  spouse2SignatoryRole?: string;

  dateSigned?: string; // already formatted, e.g. "December 21, 2025"
};

export default function SignatureClause({
  petitionerSignatoryName,
  petitionerSignatoryRole,
  respondentSignatoryName,
  respondentSignatoryRole,
  motherSignatoryName,
  motherSignatoryRole,
  fatherSignatoryName,
  fatherSignatoryRole,
  spouse1SignatoryName,
  spouse1SignatoryRole,
  spouse2SignatoryName,
  spouse2SignatoryRole,
  dateSigned,
}: SignatureClauseProps) {
  const resolvedDate = dateSigned?.trim() || 'the date of execution';

  const pairStyle = { marginBottom: '4px', lineHeight: '1.2' };
  const lineStyle = { margin: 0, lineHeight: '1.2', width: '3.5in' };

  const renderSignature = (name?: string, role?: string) =>
    name ? (
      <div style={pairStyle}>
        <p style={lineStyle}>__________________________</p>
        <p style={lineStyle}>
          <strong>{name.trim()}</strong>
        </p>
        {role && (
          <p style={lineStyle}>
            {role.trim()}
          </p>
        )}
        <br />
        <br />
      </div>
    ) : null;

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

        {renderSignature(petitionerSignatoryName, petitionerSignatoryRole)}
        {renderSignature(respondentSignatoryName, respondentSignatoryRole)}
        {renderSignature(motherSignatoryName, motherSignatoryRole)}
        {renderSignature(fatherSignatoryName, fatherSignatoryRole)}
        {renderSignature(spouse1SignatoryName, spouse1SignatoryRole)}
        {renderSignature(spouse2SignatoryName, spouse2SignatoryRole)}
      </section>
    </>
  );
}
