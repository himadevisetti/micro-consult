type IPDescriptionClauseProps = {
  ipTitle?: string;
  ipType?: string;
  matterDescription?: string;
};

export default function IPDescriptionClause({
  ipTitle,
  ipType,
  matterDescription,
}: IPDescriptionClauseProps) {
  const resolvedTitle = ipTitle?.trim() || 'the intellectual property';
  const resolvedType = ipType?.trim() || 'Patent';
  const resolvedMatter = matterDescription?.trim();

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>IP Description</h3>
      <p>
        This agreement pertains to <strong>{resolvedTitle}</strong>, classified as a{' '}
        <strong>{resolvedType}</strong>.
        {resolvedMatter && <> The scope of representation includes {resolvedMatter}.</>}
      </p>
    </section>
  );
}

