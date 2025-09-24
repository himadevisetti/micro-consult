import type { WorkScheduleEntry } from '../../../types/EmploymentAgreementFormData';
import { formatWorkSchedule } from '../../../utils/formatWorkSchedule';

type PartiesClauseProps = {
  employerName?: string;
  employerAddress?: string;
  employeeName?: string;
  employeeAddress?: string;
  workLocation?: string;
  workSchedule?: WorkScheduleEntry[];
  effectiveDate?: string;
  contractType?: string;
};

export default function PartiesClause({
  employerName,
  employerAddress,
  employeeName,
  employeeAddress,
  workLocation,
  workSchedule,
  effectiveDate,
  contractType,
}: PartiesClauseProps) {
  const resolvedEmployer = employerName?.trim() || 'the Employer';
  const resolvedEmployerAddress = employerAddress?.trim() || 'the Employer’s address';
  const resolvedEmployee = employeeName?.trim() || 'the Employee';
  const resolvedEmployeeAddress = employeeAddress?.trim() || 'the Employee’s address';
  const resolvedWorkLocation = workLocation?.trim();
  const resolvedWorkSchedule = formatWorkSchedule(workSchedule);
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
        <strong>{resolvedEmployeeAddress}</strong>, effective as of <strong>{resolvedDate}</strong>.
        {resolvedWorkLocation && <> Primary work location is <strong>{resolvedWorkLocation}</strong></>}
        {shouldShowWorkSchedule && <>. Regular schedule is <strong>{resolvedWorkSchedule}</strong></>}
        .
      </p>
    </section>
  );
}
