// src/components/AgreementClauses/FamilyLaw/SpousalSupportClause.tsx

type SpousalSupportClauseProps = {
  spousalSupportAmount?: string;
  spousalSupportDurationMonths?: string;
  terminationConditions?: string;
  responsibleParty?: string;
};

export default function SpousalSupportClause({
  spousalSupportAmount,
  spousalSupportDurationMonths,
  terminationConditions,
  responsibleParty,
}: SpousalSupportClauseProps) {
  const resolvedAmount = spousalSupportAmount?.trim() || 'an agreed amount';
  const resolvedDuration = spousalSupportDurationMonths?.trim() || 'a specified duration';
  const resolvedConditions = terminationConditions?.trim() || 'standard termination conditions';
  const resolvedResponsible = responsibleParty?.trim() || 'None';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Spousal Support</h3>
      <p>
        Spousal support shall be paid in the amount of <strong>{resolvedAmount}</strong> for{' '}
        <strong>{resolvedDuration}</strong>. Termination conditions include{' '}
        <strong>{resolvedConditions}</strong>. The responsible party is{' '}
        <strong>{resolvedResponsible}</strong>.
      </p>
    </section>
  );
}

