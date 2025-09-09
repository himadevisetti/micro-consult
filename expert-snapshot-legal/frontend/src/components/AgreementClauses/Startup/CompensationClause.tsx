// src/components/AgreementClauses/Startup/CompensationClause.tsx

type CompensationClauseProps = {
  compensationType?: string;
  splitEquityGrant?: boolean;
  // Non-split
  equityPercentage?: string;
  equityShares?: string;
  // Split
  initialEquityPercentage?: number;
  initialEquityShares?: number;
  futureEquityPercentage?: number;
  futureEquityShares?: number;
  // Common
  vestingStartDate?: string;
  cliffPeriod?: string;
  totalVestingPeriod?: string;
  cashAmount?: string;
  paymentFrequency?: string;
  expenseReimbursement?: boolean;
  expenseDetails?: string;
};

export default function CompensationClause({
  compensationType,
  splitEquityGrant,
  equityPercentage,
  equityShares,
  initialEquityPercentage,
  initialEquityShares,
  futureEquityPercentage,
  futureEquityShares,
  vestingStartDate,
  cliffPeriod,
  totalVestingPeriod,
  cashAmount,
  paymentFrequency,
  expenseReimbursement,
  expenseDetails,
}: CompensationClauseProps) {
  const compTypeMap: Record<string, string> = {
    'Equity + Cash': 'equity and cash',
    'Equity Only': 'equity',
    'Cash Only': 'cash',
  };
  const resolvedType =
    (compensationType && compTypeMap[compensationType.trim()]) ||
    compensationType?.trim() ||
    'no monetary or equity compensation';

  const hasEquity = resolvedType.toLowerCase().includes('equity');
  const hasCash = resolvedType.toLowerCase().includes('cash');

  const resolvedCliff = cliffPeriod?.trim();
  const resolvedTotalVesting = totalVestingPeriod?.trim();

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Compensation</h3>
      <p>The Advisor will be compensated via <strong>{resolvedType}</strong>.</p>

      {hasEquity && !splitEquityGrant && (
        <p>
          The equity component shall consist of{' '}
          {equityPercentage ? <strong>{equityPercentage}</strong> : 'an agreed percentage'}{' '}
          {equityShares && `(${equityShares} shares)`}, subject to the Company’s equity plan.
          Vesting shall commence on <strong>{vestingStartDate || 'the vesting start date'}</strong>
          {resolvedCliff && `, with a cliff period of ${resolvedCliff}`}
          {resolvedTotalVesting && `, over a total vesting period of ${resolvedTotalVesting}`}.
        </p>
      )}

      {hasEquity && splitEquityGrant && (
        <p>
          The equity component shall consist of an initial grant of{' '}
          {initialEquityPercentage != null && initialEquityShares != null
            ? <><strong>{initialEquityPercentage}%</strong> ({initialEquityShares} shares)</>
            : initialEquityPercentage != null
              ? <><strong>{initialEquityPercentage}%</strong></>
              : initialEquityShares != null
                ? <><strong>{initialEquityShares}</strong> shares</>
                : 'an agreed initial grant'}{' '}
          and a future grant of{' '}
          {futureEquityPercentage != null && futureEquityShares != null
            ? <><strong>{futureEquityPercentage}%</strong> ({futureEquityShares} shares)</>
            : futureEquityPercentage != null
              ? <><strong>{futureEquityPercentage}%</strong></>
              : futureEquityShares != null
                ? <><strong>{futureEquityShares}</strong> shares</>
                : 'an agreed future grant'}, subject to the Company’s equity plan.
          Vesting shall commence on <strong>{vestingStartDate || 'the vesting start date'}</strong>
          {resolvedCliff && `, with a cliff period of ${resolvedCliff}`}
          {resolvedTotalVesting && `, over a total vesting period of ${resolvedTotalVesting}`}.
        </p>
      )}

      {hasCash && (
        <p>
          The cash component shall be <strong>{cashAmount ? `$${cashAmount}` : 'an agreed amount'}</strong>
          {paymentFrequency && `, payable on a ${paymentFrequency.toLowerCase()} basis`}.
        </p>
      )}

      {expenseReimbursement && (
        <p>
          The Company shall reimburse the Advisor for reasonable expenses incurred in the performance of duties
          {expenseDetails && `, including ${expenseDetails}`}.
        </p>
      )}
    </section>
  );
}

