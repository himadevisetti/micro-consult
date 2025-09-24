type BenefitsClauseProps = {
  benefitsList?: string[];
};

export default function BenefitsClause({ benefitsList }: BenefitsClauseProps) {
  const hasBenefits = Array.isArray(benefitsList) && benefitsList.length > 0;

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Benefits</h3>
      {hasBenefits ? (
        <p>
          The Employee will be entitled to participate in the Employer’s benefits programs, which
          will include <strong>{benefitsList.join(', ')}</strong>. Participation in these programs
          is subject to the terms, conditions, and eligibility requirements of each program, as well
          as all applicable laws and regulations.
        </p>
      ) : (
        <p>The Employee is not entitled to any benefits under this Agreement.</p>
      )}
    </section>
  );
}
