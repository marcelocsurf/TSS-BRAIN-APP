'use client';

// Filter strip rendered above the calendar. Filters live in the URL
// so navigation + the calendar week/month toggle preserve them.
// Server filters the rendered set; this component just edits the URL.

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

type Tpl = {
  id: string;
  template_name: string;
  level_name: string | null;
  service_kind: 'surf_lesson' | 'surf_camp' | 'custom' | null;
};

interface Props {
  templates: Tpl[];
}

export function CampFilters({ templates }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kind = searchParams.get('kind') ?? '';
  const level = searchParams.get('level') ?? '';
  const minOpen = searchParams.get('minOpen') ?? '';
  const anchor = searchParams.get('anchor') ?? '';

  const levels = Array.from(
    new Set(templates.map((t) => t.level_name).filter(Boolean)),
  ) as string[];

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/camps?${params.toString()}`);
  };

  // Jumping to a date both sets the anchor (calendar navigates there)
  // and stays on whatever view (week/month) is currently active.
  const setDate = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('anchor', value);
    else params.delete('anchor');
    router.push(`/camps?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('kind');
    params.delete('level');
    params.delete('minOpen');
    params.delete('anchor');
    router.push(`/camps?${params.toString()}`);
  };

  const active = !!(kind || level || minOpen || anchor);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3 bg-white rounded-xl border border-gray-100 px-3 py-2">
      <span
        className="text-[10px] uppercase tracking-wider text-gray-400 inline-flex items-center gap-1"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        <Filter size={11} strokeWidth={1.75} />
        Filter
      </span>

      <label
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        Go to date
        <input
          type="date"
          value={anchor}
          onChange={(e) => setDate(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-700 normal-case"
        />
      </label>

      <select
        value={kind}
        onChange={(e) => setParam('kind', e.target.value)}
        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white"
      >
        <option value="">All types</option>
        <option value="surf_camp">Surf Camp</option>
        <option value="surf_lesson">Surf / Skate Lesson</option>
        <option value="custom">Custom</option>
      </select>

      <select
        value={level}
        onChange={(e) => setParam('level', e.target.value)}
        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white"
      >
        <option value="">All levels</option>
        {levels.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <select
        value={minOpen}
        onChange={(e) => setParam('minOpen', e.target.value)}
        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white"
      >
        <option value="">Any availability</option>
        <option value="1">≥ 1 spot open</option>
        <option value="2">≥ 2 spots open</option>
        <option value="3">≥ 3 spots open</option>
      </select>

      {active && (
        <button
          type="button"
          onClick={clearAll}
          className="text-[10px] inline-flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors px-2 py-1"
        >
          <X size={10} strokeWidth={2} />
          Clear
        </button>
      )}
    </div>
  );
}
