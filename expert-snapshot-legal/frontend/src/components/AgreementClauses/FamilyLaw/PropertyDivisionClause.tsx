// src/components/AgreementClauses/FamilyLaw/PropertyDivisionClause.tsx

type PropertyDivisionClauseProps = {
  propertyDivisionMethod?: string;
  assetList?: string[];
  debtAllocation?: string;
  retirementAccounts?: string;
  taxConsiderations?: string;
};

export default function PropertyDivisionClause({
  propertyDivisionMethod,
  assetList,
  debtAllocation,
  retirementAccounts,
  taxConsiderations,
}: PropertyDivisionClauseProps) {
  const resolvedMethod = propertyDivisionMethod?.trim() || 'Equal Split';
  const resolvedDebt = debtAllocation?.trim() || 'as agreed';
  const resolvedRetirement = retirementAccounts?.trim() || 'to be divided equitably';
  const resolvedTax = taxConsiderations?.trim() || 'standard tax considerations';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Property Division</h3>
      <p>
        Property shall be divided by <strong>{resolvedMethod}</strong>. Debt allocation is{' '}
        <strong>{resolvedDebt}</strong>. Retirement accounts are <strong>{resolvedRetirement}</strong>.
        Tax considerations include <strong>{resolvedTax}</strong>.
      </p>
      {assetList?.length ? (
        <ul>
          {assetList.map((asset, i) => (
            <li key={i}>{asset}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

