type BenefitsClauseProps = {
  benefitsList?: string[];
};

export default function BenefitsClause({ benefitsList }: BenefitsClauseProps) {
  const resolvedBenefits =
    benefitsList && benefitsList.length > 0
      ? benefitsList.join(', ')
      : 'health insurance, retirement plans, and other benefits as offered';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Benefits</h3>
      <p>
        The Employee will be entitled to participate in the Employer’s benefits programs, which may
        include <strong>{resolvedBenefits}</strong>, subject to the terms of each program and
        applicable law.
      </p>
    </section>
  );
}
