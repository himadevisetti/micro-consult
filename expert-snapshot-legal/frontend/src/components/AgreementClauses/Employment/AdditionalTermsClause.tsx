type AdditionalTermsClauseProps = {
  additionalTerms?: string;
};

export default function AdditionalTermsClause({ additionalTerms }: AdditionalTermsClauseProps) {
  const resolvedTerms =
    additionalTerms?.trim() || 'any additional terms mutually agreed upon by the parties in writing';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Additional Terms</h3>
      <p>
        This Agreement may include <strong>{resolvedTerms}</strong>.
      </p>
    </section>
  );
}

