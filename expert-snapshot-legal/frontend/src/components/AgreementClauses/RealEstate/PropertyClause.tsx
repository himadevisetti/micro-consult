// src/components/AgreementClauses/RealEstate/PropertyClause.tsx

type PropertyClauseProps = {
  propertyAddress?: string;
  legalDescription?: string;
};

export default function PropertyClause({
  propertyAddress,
  legalDescription,
}: PropertyClauseProps) {
  const resolvedAddress = propertyAddress?.trim() || 'the Property address';
  const resolvedLegalDescription = legalDescription?.trim();

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Property</h3>
      <p>
        The subject of this Agreement is the real property located at{' '}
        <strong>{resolvedAddress}</strong>
        {resolvedLegalDescription && (
          <>
            , further described as <strong>{resolvedLegalDescription}</strong>
          </>
        )}
        .
      </p>
    </section>
  );
}