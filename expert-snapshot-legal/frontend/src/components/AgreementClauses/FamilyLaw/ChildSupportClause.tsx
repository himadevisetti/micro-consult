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

// Format currency safely: "75000" → "$75,000.00"
const formatCurrency = (value?: string): string => {
  if (!value) return "unspecified";
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) return value;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Normalize percent: "50" → "50%", "50%" → "50%"
const formatPercent = (value?: string): string => {
  if (!value) return "unspecified";
  return value.replace(/%+/g, "").trim() + "%";
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
  const resolvedMotherIncome = formatCurrency(motherIncome);
  const resolvedFatherIncome = formatCurrency(fatherIncome);
  const resolvedCustodyMother = formatPercent(custodyPercentageMother);
  const resolvedCustodyFather = formatPercent(custodyPercentageFather);
  const resolvedAmount = formatCurrency(childSupportAmount);
  const resolvedFrequency = paymentFrequency?.trim() || "Monthly";
  const resolvedMethod = paymentMethod?.trim() || "Direct Deposit";
  const resolvedResponsible = responsibleParty?.trim() || "Joint";
  const resolvedInsurance = healthInsuranceResponsibility?.trim() || "Joint";

  return (
    <section>
      <h3 style={{ fontWeight: "bold" }}>Child Support</h3>

      <p>
        Mother’s income is <strong>{resolvedMotherIncome}</strong>, and Father’s income is{" "}
        <strong>{resolvedFatherIncome}</strong>. Custody percentages are Mother:{" "}
        <strong>{resolvedCustodyMother}</strong> and Father:{" "}
        <strong>{resolvedCustodyFather}</strong>.
      </p>

      <p>
        Child support shall be paid in the amount of <strong>{resolvedAmount}</strong>, on a{" "}
        <strong>{resolvedFrequency}</strong> basis, via <strong>{resolvedMethod}</strong>. The
        responsible party is <strong>{resolvedResponsible}</strong>. Health insurance responsibility
        is assigned to <strong>{resolvedInsurance}</strong>.
      </p>
    </section>
  );
}
