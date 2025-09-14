type PositionAndDutiesClauseProps = {
  jobTitle?: string;
  department?: string;
  reportsTo?: string;
  bandOrGroup?: string;
  contractType?: string;
};

export default function PositionAndDutiesClause({
  jobTitle,
  department,
  reportsTo,
  bandOrGroup,
  contractType,
}: PositionAndDutiesClauseProps) {
  const resolvedJobTitle = jobTitle?.trim() || 'the agreed position';
  const resolvedDepartment = department?.trim();
  const resolvedReportsTo = reportsTo?.trim();
  const resolvedBandOrGroup = bandOrGroup?.trim();
  const resolvedContractType = contractType?.trim();

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Position and Duties</h3>
      <p>
        The Employee shall serve as <strong>{resolvedJobTitle}</strong>
        {resolvedDepartment && <> in the <strong>{resolvedDepartment}</strong> department</>}
        {resolvedBandOrGroup && <> within <strong>{resolvedBandOrGroup}</strong></>}
        {resolvedContractType && <> under a <strong>{resolvedContractType}</strong> arrangement</>}
        {resolvedReportsTo && <> and will report to <strong>{resolvedReportsTo}</strong></>}
        .
      </p>
      <p>
        The Employee agrees to perform all duties reasonably assigned and to act in the best interests of the Employer.
      </p>
    </section>
  );
}

