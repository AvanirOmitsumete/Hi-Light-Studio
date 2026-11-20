import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  /** Extra words to match, e.g. the course code. */
  keywords?: string;
}

interface SearchableSelectProps {
  id: string;
  value: string;
  options: SearchableOption[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

const searchKey = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

/** Best matches first: exact, then starts-with (any word), then contains. */
function rank(option: SearchableOption, query: string) {
  let best = Infinity;
  for (const text of [option.label, option.keywords ?? '']) {
    const key = searchKey(text);
    if (!key) continue;
    if (key === query) best = Math.min(best, 0);
    else if (key.startsWith(query)) best = Math.min(best, 1);
    else if (key.split(/[\s—-]+/).some((word) => word.startsWith(query))) best = Math.min(best, 2);
    else if (key.includes(query)) best = Math.min(best, 3);
  }
  return best;
}

/**
 * A dropdown you can type into to filter, like a country picker.
 * Only listed options can be chosen; typed text that matches nothing is discarded.
 */
export function SearchableSelect({
  id, value, options, onChange, placeholder, disabled, emptyText = 'No matches', className = '', ...aria
}: SearchableSelectProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value);
  const key = searchKey(query);
  const results = key
    ? options.map((option) => ({ option, rank: rank(option, key) }))
      .filter((match) => Number.isFinite(match.rank))
      .sort((a, b) => a.rank - b.rank || a.option.label.localeCompare(b.option.label))
      .map(({ option }) => option)
    : options;
  const active = open ? results[Math.min(activeIndex, results.length - 1)] : undefined;

  useEffect(() => {
    if (open && active) listRef.current?.querySelector(`[data-value="${CSS.escape(active.value)}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(Math.max(0, results.findIndex((option) => option.value === value)));
  };
  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const choose = (option: SearchableOption) => {
    onChange(option.value);
    close();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) return openList();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (Math.min(index, results.length - 1) + step + results.length) % Math.max(1, results.length));
    } else if (event.key === 'Enter') {
      if (open && active) {
        event.preventDefault();
        choose(active);
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        close();
      }
    } else if (event.key === 'Tab' && open && key && results.length === 1) {
      choose(results[0]);
    }
  };

  return (
    <div className="relative">
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={active ? `${listId}-${active.value}` : undefined}
        {...aria}
        disabled={disabled}
        placeholder={selected ? selected.label : placeholder}
        value={open ? query : selected?.label ?? ''}
        onFocus={openList}
        onClick={openList}
        onChange={(event) => {
          // While closed the box shows the chosen option's label; typing then starts a new search
          // instead of appending to that label.
          const typed = open ? event.target.value : (event.nativeEvent as InputEvent).data ?? '';
          setQuery(typed);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onBlur={close}
        className={`${className} pl-10 pr-10 truncate ${open && selected ? 'placeholder:text-ink/60' : ''}`}
      />
      <ChevronDown aria-hidden className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-panel border-2 border-line shadow-lux-gold"
        >
          {results.length === 0 && <li className="px-3.5 py-3 text-sm text-neutral-500">{emptyText}</li>}
          {results.map((option) => (
            <li
              key={option.value}
              id={`${listId}-${option.value}`}
              data-value={option.value}
              role="option"
              aria-selected={option.value === value}
              // Keep focus in the input so blur does not close the list before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
              onMouseEnter={() => setActiveIndex(results.indexOf(option))}
              className={`px-3.5 py-2.5 text-sm cursor-pointer ${
                option === active ? 'bg-gold text-on-gold' : option.value === value ? 'bg-gold-wash text-ink font-black' : 'text-ink'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
