type PartiesClauseProps = {
  employerName?: string;
  employerAddress?: string;
  employeeName?: string;
  employeeAddress?: string;
  jobTitle?: string;
  department?: string;
  reportsTo?: string;
  workLocation?: string;
  workSchedule?: string;
  effectiveDate?: string;
  contractType?: string;
};

export default function PartiesClause({
  employerName,
  employerAddress,
  employeeName,
  employeeAddress,
  jobTitle,
  department,
  reportsTo,
  workLocation,
  workSchedule,
  effectiveDate,
  contractType,
}: PartiesClauseProps) {
  const resolvedEmployer = employerName?.trim() || 'the Employer';
  const resolvedEmployerAddress = employerAddress?.trim() || 'the Employer’s address';
  const resolvedEmployee = employeeName?.trim() || 'the Employee';
  const resolvedEmployeeAddress = employeeAddress?.trim() || 'the Employee’s address';
  const resolvedJobTitle = jobTitle?.trim() || 'the agreed position';
  const resolvedDepartment = department?.trim();
  const resolvedReportsTo = reportsTo?.trim();
  const resolvedWorkLocation = workLocation?.trim();
  const resolvedWorkSchedule = workSchedule?.trim();
  const resolvedDate = effectiveDate?.trim() || 'the effective date of this Agreement';

  const shouldShowWorkSchedule =
    resolvedWorkSchedule &&
    ['Fixed-Term', 'Probationary', 'Part-Time', 'Temporary', 'Hourly'].includes(contractType || '');

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Parties</h3>
      <p>
        This Employment Agreement (“Agreement”) is entered into between <strong>{resolvedEmployer}</strong>, located at{' '}
        <strong>{resolvedEmployerAddress}</strong>, and <strong>{resolvedEmployee}</strong>, whose address is{' '}
        <strong>{resolvedEmployeeAddress}</strong>, effective as of <strong>{resolvedDate}</strong>.{' '}
        The Employee is appointed as <strong>{resolvedJobTitle}</strong>
        {resolvedDepartment && <> in the <strong>{resolvedDepartment}</strong> department</>}
        {resolvedReportsTo && <> and will report to <strong>{resolvedReportsTo}</strong></>}
        {resolvedWorkLocation && <>. Primary work location: <strong>{resolvedWorkLocation}</strong></>}
        {shouldShowWorkSchedule && <>. Regular schedule: <strong>{resolvedWorkSchedule}</strong></>}
        .
      </p>
    </section>
  );
}
