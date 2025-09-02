type LicenseClauseProps = {
  licenseScope?: string;
  jurisdiction?: string;
};

export default function LicenseClause({
  licenseScope,
  jurisdiction,
}: LicenseClauseProps) {
  const resolvedScope = licenseScope?.trim() || 'non-exclusive, worldwide, perpetual';
  const resolvedJurisdiction = jurisdiction?.trim() || 'California';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>License Terms</h3>
      <p>
        The intellectual property is licensed under a <strong>{resolvedScope}</strong> model. All
        licensing terms shall be interpreted in accordance with the laws of{' '}
        <strong>{resolvedJurisdiction}</strong>.
      </p>
    </section>
  );
}

