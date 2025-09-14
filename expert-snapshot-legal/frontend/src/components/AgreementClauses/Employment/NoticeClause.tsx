type NoticeClauseProps = {
  noticePeriodEmployer?: string; // formatted number string
  noticePeriodEmployerUnit?: string;
  noticePeriodEmployee?: string; // formatted number string
  noticePeriodEmployeeUnit?: string;
};

export default function NoticeClause({
  noticePeriodEmployer,
  noticePeriodEmployerUnit,
  noticePeriodEmployee,
  noticePeriodEmployeeUnit,
}: NoticeClauseProps) {
  const hasEmployerNotice =
    noticePeriodEmployer?.trim() &&
    noticePeriodEmployerUnit?.trim() &&
    noticePeriodEmployerUnit.trim().toLowerCase() !== 'none';

  const hasEmployeeNotice =
    noticePeriodEmployee?.trim() &&
    noticePeriodEmployeeUnit?.trim() &&
    noticePeriodEmployeeUnit.trim().toLowerCase() !== 'none';

  const resolvedEmployerNotice = hasEmployerNotice
    ? `${noticePeriodEmployer} ${noticePeriodEmployerUnit?.toLowerCase()}`
    : 'reasonable';

  const resolvedEmployeeNotice = hasEmployeeNotice
    ? `${noticePeriodEmployee} ${noticePeriodEmployeeUnit?.toLowerCase()}`
    : 'reasonable';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Notice</h3>
      <p>
        The Employer may terminate this Agreement by providing{' '}
        <strong>{resolvedEmployerNotice}</strong> notice to the Employee. The Employee may resign by
        providing <strong>{resolvedEmployeeNotice}</strong> notice to the Employer.
      </p>
    </section>
  );
}