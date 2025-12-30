// src/components/AgreementClauses/FamilyLaw/VisitationClause.tsx

import type { VisitationScheduleEntry } from '@/types/FamilyLawAgreementFormData';

type VisitationClauseProps = {
  visitationSchedule?: string;
  visitationScheduleEntries?: VisitationScheduleEntry[];
  holidaySchedule?: string;
};

export default function VisitationClause({
  visitationSchedule,
  visitationScheduleEntries,
  holidaySchedule,
}: VisitationClauseProps) {
  const resolvedSchedule = visitationSchedule?.trim() || 'Standard';
  const resolvedHoliday = holidaySchedule?.trim() || 'as mutually agreed';

  return (
    <section>
      <h3 style={{ fontWeight: 'bold' }}>Visitation</h3>
      <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>
        The visitation schedule shall follow the <strong>{resolvedSchedule}</strong> plan. Holiday
        visitation shall be <strong>{resolvedHoliday}</strong>.
      </p>
      {visitationScheduleEntries?.length ? (
        <ul
          style={{
            fontSize: '1rem',
            lineHeight: '1.5',
            marginLeft: '1.5rem',
            listStyleType: 'disc',
            fontFamily: 'Georgia, serif',
          }}
        >
          {visitationScheduleEntries.map((entry, i) => (
            <li
              key={i}
              style={{
                fontSize: '1rem',
                lineHeight: '1.5',
                fontFamily: 'Georgia, serif',
              }}
            >
              {entry.days.join(', ')}: {entry.hours.start} – {entry.hours.end}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
