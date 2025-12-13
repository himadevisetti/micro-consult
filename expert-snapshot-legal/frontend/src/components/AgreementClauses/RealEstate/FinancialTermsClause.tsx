// src/components/AgreementClauses/RealEstate/FinancialTermsClause.tsx

type FinancialTermsClauseProps = {
  contractType?: string;
  purchasePrice?: string;
  earnestMoneyDeposit?: string;
  financingTerms?: string;
  rentAmount?: string;
  securityDeposit?: string;
  paymentFrequency?: string;
  optionFee?: string;
  rentCreditTowardPurchase?: string;
  commissionValue?: string;
  commissionUnit?: string;
  leaseDuration?: string;
};

export default function FinancialTermsClause({
  contractType,
  purchasePrice,
  earnestMoneyDeposit,
  financingTerms,
  rentAmount,
  securityDeposit,
  paymentFrequency,
  optionFee,
  rentCreditTowardPurchase,
  commissionValue,
  commissionUnit,
  leaseDuration,
}: FinancialTermsClauseProps) {
  const resolvedPurchasePrice = purchasePrice?.trim() || '';
  const resolvedEarnestMoney = earnestMoneyDeposit?.trim() || '';
  const resolvedFinancingTerms = financingTerms?.trim() || '';
  const resolvedRentAmount = rentAmount?.trim() || '';
  const resolvedSecurityDeposit = securityDeposit?.trim() || '';
  const resolvedPaymentFrequency = paymentFrequency?.trim() || '';
  const resolvedOptionFee = optionFee?.trim() || '';
  const resolvedRentCredit = rentCreditTowardPurchase?.trim() || '';
  const resolvedCommissionValue = commissionValue?.trim() || '';
  const resolvedCommissionUnit = commissionUnit?.trim() || '';
  const resolvedLeaseDuration = leaseDuration?.trim() || '';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Financial Terms</h3>
      {contractType === 'Purchase' && (
        <p>
          The purchase price is <strong>{resolvedPurchasePrice}</strong>, with an earnest money deposit of{' '}
          <strong>{resolvedEarnestMoney}</strong>. Financing terms: <strong>{resolvedFinancingTerms}</strong>.
        </p>
      )}
      {contractType === 'Lease' && (
        <p>
          Rent is <strong>{resolvedRentAmount}</strong> payable <strong>{resolvedPaymentFrequency}</strong>, with a
          security deposit of <strong>{resolvedSecurityDeposit}</strong>. Lease duration:{' '}
          <strong>{resolvedLeaseDuration}</strong>.
        </p>
      )}
      {contractType === 'Option' && (
        <p>
          Option fee is <strong>{resolvedOptionFee}</strong>, with rent credit toward purchase of{' '}
          <strong>{resolvedRentCredit}</strong>.
        </p>
      )}
      {contractType === 'Listing' && (
        <p>
          Commission is <strong>{resolvedCommissionValue}</strong> ({resolvedCommissionUnit}).
        </p>
      )}
    </section>
  );
}
