import React, { useState } from 'react';
import { Check, Plus, Search, Loader2 } from 'lucide-react';
import type { Course } from '../../../types';
import type { CatalogCourse } from '../../../constants/courseCatalog';

export interface QuickAddChoice {
  /** Existing course record to reuse, when the code or name is already in the system. */
  courseId?: string;
  name: string;
  code: string;
}

interface Row extends QuickAddChoice {
  key: string;
  group: string;
  state: 'add' | 'added' | 'other-level';
}

interface CourseQuickAddProps {
  /** Built-in suggestions for the selected level (college programs or SHS strands). */
  catalog: CatalogCourse[];
  /** Every course already in the system. */
  courses: Course[];
  /** Courses that may be assigned at the selected level (others belong to another level). */
  availableIds: Set<string>;
  /** Courses already assigned to this school at the selected level. */
  addedIds: Set<string>;
  disabled: boolean;
  onAdd: (choice: QuickAddChoice) => Promise<void>;
}

const norm = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Search the built-in course list (plus courses already in the system) and add a course to
 * the school with one click. Codes and names that already exist reuse the existing course.
 */
export const CourseQuickAdd: React.FC<CourseQuickAddProps> = ({ catalog, courses, availableIds, addedIds, disabled, onAdd }) => {
  const [query, setQuery] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const byCode = new Map(courses.filter((c) => c.code).map((c) => [norm(c.code!), c]));
  const byName = new Map(courses.map((c) => [norm(c.name), c]));

  const rowFor = (code: string, name: string, group: string, existing?: Course): Row => {
    const course = existing ?? byCode.get(norm(code)) ?? byName.get(norm(name));
    const state = course && addedIds.has(course.id) ? 'added'
      : course && !availableIds.has(course.id) ? 'other-level' : 'add';
    return {
      key: course?.id ?? 'catalog:' + code,
      courseId: course?.id,
      name: course?.name ?? name,
      code: course?.code || code,
      group,
      state,
    };
  };

  // Built-in list first, then courses the studio already created that are not in it.
  const rows = new Map<string, Row>();
  for (const item of catalog) {
    const row = rowFor(item.code, item.name, item.group);
    if (!rows.has(row.key)) rows.set(row.key, row);
  }
  for (const course of courses) {
    if (!rows.has(course.id) && availableIds.has(course.id)) rows.set(course.id, rowFor(course.code ?? '', course.name, 'Added by the studio', course));
  }

  const q = norm(query);
  const words = q.split(' ').filter(Boolean);
  const matches = [...rows.values()]
    .filter((row) => !q || words.every((word) => norm(`${row.code} ${row.name} ${row.group}`).includes(word)))
    .sort((a, b) => {
      const score = (row: Row) => (norm(row.code) === q ? 0 : norm(row.code).startsWith(q) ? 1 : 2);
      return (q ? score(a) - score(b) : 0) || Number(a.state !== 'add') - Number(b.state !== 'add');
    });
  const addable = matches.filter((row) => row.state === 'add').length;

  const add = async (row: Row) => {
    setBusyKey(row.key);
    try {
      await onAdd({ courseId: row.courseId, name: row.name, code: row.code });
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="course-quick-search" className="block text-[10px] font-black uppercase">
        Quick Add from Course List
      </label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          id="course-quick-search"
          type="search"
          value={query}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          // Enter must not submit the manual "add course" form this sits in.
          onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }}
          placeholder='Type to filter, e.g. "nursing", "BSIT", "engineering"'
          className="w-full min-h-[40px] pl-9 pr-3 py-2 bg-panel border border-line font-bold text-xs"
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-neutral-500">
        <span>{matches.length} shown · {addable} not yet added</span>
        <span>Click <strong>+</strong> to add to this school</span>
      </div>
      <ul className="max-h-64 overflow-y-auto border border-neutral-300 bg-panel divide-y divide-neutral-200" aria-label="Course list">
        {matches.length === 0 && (
          <li className="p-3 text-xs text-neutral-500">Not in the list. Add it below under &ldquo;Add a Course Manually&rdquo; with its name and acronym.</li>
        )}
        {matches.map((row) => (
          <li key={row.key} className="flex items-center gap-2 px-2.5 py-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink truncate" title={row.name}>
                <span className="font-mono text-gold-soft mr-1.5">{row.code || '—'}</span>{row.name}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-neutral-500">{row.group}</div>
            </div>
            {row.state === 'added' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700"><Check className="w-3.5 h-3.5" /> Added</span>
            ) : row.state === 'other-level' ? (
              <span className="text-[9px] font-bold uppercase text-neutral-500" title="This course is already used for another academic level.">Other level</span>
            ) : (
              <button
                type="button"
                disabled={disabled || !!busyKey}
                onClick={() => void add(row)}
                aria-label={`Add ${row.code} ${row.name}`}
                className="btn-tactile shrink-0 inline-flex items-center justify-center w-8 h-8 bg-obsidian text-gold cursor-pointer disabled:opacity-40"
              >
                {busyKey === row.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
