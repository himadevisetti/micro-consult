// src/components/AgreementClauses/FamilyLaw/ChildSupportClause.tsx

type ChildSupportClauseProps = {
  motherIncome?: string;
  fatherIncome?: string;
  custodyPercentageMother?: string;
  custodyPercentageFather?: string;
  childSupportAmount?: string;
  paymentFrequency?: string;
  paymentMethod?: string;
  responsibleParty?: string;
  healthInsuranceResponsibility?: string;
};

export default function ChildSupportClause({
  motherIncome,
  fatherIncome,
  custodyPercentageMother,
  custodyPercentageFather,
  childSupportAmount,
  paymentFrequency,
  paymentMethod,
  responsibleParty,
  healthInsuranceResponsibility,
}: ChildSupportClauseProps) {
  const resolvedMotherIncome = motherIncome?.trim() || 'unspecified';
  const resolvedFatherIncome = fatherIncome?.trim() || 'unspecified';
  const resolvedCustodyMother = custodyPercentageMother?.trim() || 'unspecified';
  const resolvedCustodyFather = custodyPercentageFather?.trim() || 'unspecified';
  const resolvedAmount = childSupportAmount?.trim() || 'an agreed amount';
  const resolvedFrequency = paymentFrequency?.trim() || 'Monthly';
  const resolvedMethod = paymentMethod?.trim() || 'Direct Deposit';
  const resolvedResponsible = responsibleParty?.trim() || 'Joint';
  const resolvedInsurance = healthInsuranceResponsibility?.trim() || 'Joint';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Child Support</h3>
      <p>
        Mother’s income is <strong>{resolvedMotherIncome}</strong>, and Father’s income is{' '}
        <strong>{resolvedFatherIncome}</strong>. Custody percentages are Mother:{' '}
        <strong>{resolvedCustodyMother}%</strong> and Father:{' '}
        <strong>{resolvedCustodyFather}%</strong>.
      </p>
      <p>
        Child support shall be paid in the amount of <strong>{resolvedAmount}</strong>, on a{' '}
        <strong>{resolvedFrequency}</strong> basis, via <strong>{resolvedMethod}</strong>. The
        responsible party is <strong>{resolvedResponsible}</strong>. Health insurance responsibility
        is assigned to <strong>{resolvedInsurance}</strong>.
      </p>
    </section>
  );
}
