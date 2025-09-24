type AdditionalTermsClauseProps = {
  additionalTerms?: string;
};

export default function AdditionalTermsClause({ additionalTerms }: AdditionalTermsClauseProps) {
  // Trim whitespace and remove a trailing period if present
  const cleanedTerms = additionalTerms
    ? additionalTerms.trim().replace(/\.$/, '')
    : 'any additional terms mutually agreed upon by the parties in writing';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Additional Terms</h3>
      <p>
        This Agreement may include <strong>{cleanedTerms}</strong>.
      </p>
    </section>
  );
}
