// src/components/AgreementClauses/Startup/CompensationClause.tsx

type CompensationClauseProps = {
  compensationType?: string;
  equityPercentage?: string;
  equityShares?: string;
  vestingStartDate?: string; // already formatted long date
  cliffPeriod?: string;
  totalVestingPeriod?: string;
  cashAmount?: string;
  paymentFrequency?: string;
  expenseReimbursement?: boolean;
  expenseDetails?: string;
};

export default function CompensationClause({
  compensationType,
  equityPercentage,
  equityShares,
  vestingStartDate,
  cliffPeriod,
  totalVestingPeriod,
  cashAmount,
  paymentFrequency,
  expenseReimbursement,
  expenseDetails,
}: CompensationClauseProps) {
  const resolvedType = compensationType?.trim() || 'no monetary or equity compensation';
  const hasEquity = resolvedType.includes('Equity');
  const hasCash = resolvedType.includes('Cash');

  const resolvedCliff = cliffPeriod?.trim();
  const resolvedTotalVesting = totalVestingPeriod?.trim();

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Compensation</h3>
      <p>
        The Advisor will be compensated via <strong>{resolvedType}</strong>.
      </p>

      {hasEquity && (
        <p>
          The equity component shall consist of{' '}
          {equityPercentage ? <strong>{equityPercentage}</strong> : 'an agreed percentage'}{' '}
          {equityShares && `(${equityShares} shares)`}, subject to the Company’s equity plan.
          Vesting shall commence on{' '}
          <strong>{vestingStartDate || 'the vesting start date'}</strong>
          {resolvedCliff && `, with a cliff period of ${resolvedCliff}`}
          {resolvedTotalVesting && `, over a total vesting period of ${resolvedTotalVesting}`}.
        </p>
      )}

      {hasCash && (
        <p>
          The cash component shall be{' '}
          <strong>
            {cashAmount ? `$${cashAmount}` : 'an agreed amount'}
          </strong>
          {paymentFrequency && `, payable on a ${paymentFrequency.toLowerCase()} basis`}.
        </p>
      )}

      {expenseReimbursement && (
        <p>
          The Company shall reimburse the Advisor for reasonable expenses incurred in the
          performance of duties{expenseDetails && `, including ${expenseDetails}`}.
        </p>
      )}
    </section>
  );
}
