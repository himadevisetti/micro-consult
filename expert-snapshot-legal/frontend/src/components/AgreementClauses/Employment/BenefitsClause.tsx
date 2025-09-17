type BenefitsClauseProps = {
  benefitsList?: string[];
};

export default function BenefitsClause({ benefitsList }: BenefitsClauseProps) {
  const resolvedBenefits =
    benefitsList && benefitsList.length > 0
      ? benefitsList.join(', ')
      : 'health insurance, retirement plans, and other benefits as offered by the Employer';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Benefits</h3>
      <p>
        The Employee will be entitled to participate in the Employer’s benefits programs, which will
        include <strong>{resolvedBenefits}</strong>. Participation in these programs is subject to
        the terms, conditions, and eligibility requirements of each program, as well as all
        applicable laws and regulations.
      </p>
    </section>
  );
}
