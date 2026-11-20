import type { Registration } from '../types';

/** Walk-in client (family portrait, event...) rather than a school/graduation student. */
export const isWalkIn = (reg: Pick<Registration, 'client_kind'>) => reg.client_kind === 'walkin';

/**
 * Where the client comes from, short: school code/name, or the walk-in's company / "Walk-in".
 * Used wherever the screens used to show the school.
 */
export function clientGroup(reg: Registration, long = false): string {
  if (isWalkIn(reg)) return reg.client_org || 'Walk-in';
  const school = reg.expand?.organization;
  return (long ? school?.name || school?.code : school?.code || school?.name) || '';
}

/** What they came for, short: course acronym (BSCS) or walk-in session type. */
export function clientDetail(reg: Registration, long = false): string {
  if (isWalkIn(reg)) return reg.expand?.session_type?.name || 'Session';
  const course = reg.expand?.course;
  return (long ? course?.name || course?.code : course?.code || course?.name) || reg.course || '';
}

/** One line for lists and cards, e.g. "SJU · BSCS" or "Walk-in · Family Portrait". */
export function clientSummary(reg: Registration, long = false): string {
  return [clientGroup(reg, long), clientDetail(reg, long)].filter(Boolean).join(' · ');
}

/** Event date as "Dec 12, 2026" (walk-in on-location sessions), or ''. */
export function eventDateLabel(reg: Pick<Registration, 'event_date'>): string {
  if (!reg.event_date) return '';
  const date = new Date(reg.event_date.slice(0, 10) + 'T00:00:00Z');
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString('en-PH', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' })
    : '';
}
