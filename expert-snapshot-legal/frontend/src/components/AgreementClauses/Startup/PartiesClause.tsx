// src/components/AgreementClauses/StartupAdvisory/PartiesClause.tsx

type PartiesClauseProps = {
  companyName?: string;
  companyAddress?: string;
  advisorName?: string;
  advisorAddress?: string;
  advisorRole?: string;
  effectiveDate?: string; // already formatted, e.g. "August 30, 2025"
};

export default function PartiesClause({
  companyName,
  companyAddress,
  advisorName,
  advisorAddress,
  advisorRole,
  effectiveDate,
}: PartiesClauseProps) {
  const resolvedCompany = companyName?.trim() || 'the Company';
  const resolvedCompanyAddress = companyAddress?.trim() || 'the Company’s address';
  const resolvedAdvisor = advisorName?.trim() || 'the Advisor';
  const resolvedAdvisorAddress = advisorAddress?.trim() || 'the Advisor’s address';
  const resolvedRole = advisorRole?.trim() || 'Advisor';
  const resolvedDate = effectiveDate?.trim() || 'the effective date of this Agreement';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Agreement is entered into between <strong>{resolvedCompany}</strong>, located at{' '}
        <strong>{resolvedCompanyAddress}</strong>, and <strong>{resolvedAdvisor}</strong>, whose
        address is <strong>{resolvedAdvisorAddress}</strong>, in the capacity of{' '}
        <strong>{resolvedRole}</strong>, effective as of <strong>{resolvedDate}</strong>.
      </p>
    </section>
  );
}

