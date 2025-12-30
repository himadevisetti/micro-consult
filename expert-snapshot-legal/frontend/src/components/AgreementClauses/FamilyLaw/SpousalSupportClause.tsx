// src/components/AgreementClauses/FamilyLaw/SpousalSupportClause.tsx

type SpousalSupportClauseProps = {
  spousalSupportAmount?: string;
  spousalSupportDurationMonths?: string;
  terminationConditions?: string;
  responsibleParty?: string;
  spouse1Name?: string;
  spouse2Name?: string;
};

export default function SpousalSupportClause({
  spousalSupportAmount,
  spousalSupportDurationMonths,
  terminationConditions,
  responsibleParty,
  spouse1Name,
  spouse2Name,
}: SpousalSupportClauseProps) {
  const resolvedAmount = spousalSupportAmount?.trim() || 'an agreed amount';
  const resolvedDuration = spousalSupportDurationMonths?.trim() || 'a specified duration';
  const resolvedConditions = terminationConditions?.trim() || 'standard termination conditions';
  const resolvedResponsible = responsibleParty?.trim() || 'None';
  const resolvedSpouse1 = spouse1Name?.trim() || 'Spouse 1';
  const resolvedSpouse2 = spouse2Name?.trim() || 'Spouse 2';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Spousal Support</h3>
      <p>
        Spousal support shall be paid in the amount of <strong>{resolvedAmount}</strong> for{' '}
        <strong>{resolvedDuration}</strong>. Termination conditions include{' '}
        <strong>{resolvedConditions}</strong>. The responsible party is{' '}
        <strong>{resolvedResponsible === 'Spouse1' ? resolvedSpouse1 : resolvedSpouse2}</strong>.
      </p>
    </section>
  );
}
