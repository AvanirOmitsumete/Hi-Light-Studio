import { useMemo } from 'react';
import type { Organization, Registration } from '../../types';
import { isWalkIn } from '../../utils/clientInfo';
import { SearchableSelect } from './SearchableSelect';
import { ALL_CLIENTS, SCHOOL_CLIENTS, WALKIN_CLIENTS } from '../../utils/clientGroup';

interface ClientGroupFilterProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  registrations: Registration[];
  /** All schools (to list ones with no clients yet). Without it, schools come from the orders. */
  organizations?: Organization[];
  className?: string;
}

/**
 * Type-to-search picker for "All clients / School clients / Walk-in clients / one school",
 * with client counts. Stays short and scrolls when there are many schools.
 */
export function ClientGroupFilter({ id, value, onChange, registrations, organizations, className = '' }: Readonly<ClientGroupFilterProps>) {
  const options = useMemo(() => {
    const walkIns = registrations.filter(isWalkIn).length;
    const perSchool = new Map<string, number>();
    const schools = new Map<string, { name: string; code?: string }>();
    for (const org of organizations ?? []) schools.set(org.id, { name: org.name, code: org.code });
    for (const reg of registrations) {
      if (isWalkIn(reg) || !reg.organization) continue;
      perSchool.set(reg.organization, (perSchool.get(reg.organization) ?? 0) + 1);
      const org = reg.expand?.organization;
      if (!schools.has(reg.organization) && org) schools.set(reg.organization, { name: org.name, code: org.code });
    }
    return [
      { value: ALL_CLIENTS, label: `All clients (${registrations.length})`, keywords: 'everyone' },
      { value: SCHOOL_CLIENTS, label: `All school clients (${registrations.length - walkIns})`, keywords: 'students graduation' },
      { value: WALKIN_CLIENTS, label: `Walk-in clients (${walkIns})`, keywords: 'family event' },
      ...[...schools].sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([schoolId, school]) => ({
        value: schoolId,
        label: `${school.name}${school.code ? ` (${school.code})` : ''} · ${perSchool.get(schoolId) ?? 0}`,
        keywords: school.code,
      })),
    ];
  }, [registrations, organizations]);

  return (
    <SearchableSelect
      id={id}
      value={value}
      onChange={(next) => onChange(next || ALL_CLIENTS)}
      options={options}
      placeholder="Type a school name or code"
      emptyText="No school matches. Try the school code."
      className={`w-full min-h-10 border-2 border-line py-2 font-bold text-xs text-ink ${value === ALL_CLIENTS ? 'bg-canvas' : 'bg-gold-wash'} ${className}`}
    />
  );
}
