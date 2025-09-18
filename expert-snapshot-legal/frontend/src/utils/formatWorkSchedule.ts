import type { WorkScheduleEntry } from '../types/EmploymentAgreementFormData';

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayNameMap: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

function collapseDays(days: string[]): string {
  if (!days.length) return '';
  const sorted = [...days].sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    const prevIndex = dayOrder.indexOf(prev);
    const currentIndex = dayOrder.indexOf(current);
    if (currentIndex !== prevIndex + 1) {
      if (start === prev) {
        ranges.push(dayNameMap[start]);
      } else {
        ranges.push(`${dayNameMap[start]} through ${dayNameMap[prev]}`);
      }
      start = current;
    }
    prev = current;
  }
  return ranges.join(', ').replace(/, ([^,]*)$/, ' and $1');
}

function formatTime12h(time: string): string {
  if (!time) return '';
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export function formatWorkSchedule(entries?: WorkScheduleEntry[]): string {
  if (!Array.isArray(entries)) return '';
  return entries
    .map(({ days, hours }) => {
      const dayStr = Array.isArray(days) ? collapseDays(days) : '';
      const start = hours?.start || '';
      const end = hours?.end || '';
      const timeStr =
        start && end
          ? `from ${formatTime12h(start)} to ${formatTime12h(end)}`
          : start
            ? `starting at ${formatTime12h(start)}`
            : end
              ? `ending at ${formatTime12h(end)}`
              : '';
      return dayStr && timeStr
        ? `${dayStr} ${timeStr}`
        : dayStr || timeStr;
    })
    .filter(Boolean)
    .join('; ');
}

