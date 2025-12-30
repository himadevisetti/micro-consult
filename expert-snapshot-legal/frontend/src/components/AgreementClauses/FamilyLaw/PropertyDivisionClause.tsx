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
  // Direct mapping based on EXACT values coming from the form
  const methodMap: Record<string, string> = {
    EqualSplit: "divided equally between the parties",
    Negotiated: "divided according to the parties’ negotiated agreement",
    CourtOrdered: "divided pursuant to the court’s order",
  };

  const resolvedMethod =
    methodMap[propertyDivisionMethod || ""] ||
    "divided using an agreed method";

  const resolvedDebt = debtAllocation?.trim() || "as agreed by the parties";
  const resolvedRetirement =
    retirementAccounts?.trim() || "to be divided equitably";
  const resolvedTax =
    taxConsiderations?.trim() || "standard tax considerations";

  const resolvedAssets =
    assetList && assetList.length > 0
      ? assetList.map(a => a.trim()).filter(Boolean).join(", ")
      : null;

  return (
    <section>
      <h3 style={{ fontWeight: "bold" }}>Property Division</h3>

      <p>
        The parties agree that their marital property shall be{" "}
        <strong>{resolvedMethod}</strong>. Debts shall be allocated as follows:{" "}
        <strong>{resolvedDebt}</strong>. Retirement accounts shall be{" "}
        <strong>{resolvedRetirement}</strong>. Tax considerations applicable to
        this division include <strong>{resolvedTax}</strong>.
      </p>

      {resolvedAssets && (
        <p>
          The assets subject to division include{" "}
          <strong>{resolvedAssets}</strong>.
        </p>
      )}
    </section>
  );
}
