'use client';

import { useState } from 'react';
import type { CascadeFormState, DrillOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  drills: DrillOption[];
  onSelect: (drillId: string) => void;
}

export function Step08Drill({ formState, drills, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? drills.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.goal?.toLowerCase().includes(search.toLowerCase())
      )
    : drills;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Drill</h3>
      <p className="text-xs text-gray-400">{drills.length} drills available</p>

      <input
        type="text"
        placeholder="Search drills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#D4A843]"
      />

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map((drill) => {
          const isSelected = formState.drill_id === drill.id;
          return (
            <button
              key={drill.id}
              type="button"
              onClick={() => onSelect(drill.id)}
              className={`w-full p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#D4A843] bg-amber-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <p className="text-sm font-medium text-gray-800">{drill.name}</p>
              {drill.goal && (
                <p className="text-xs text-gray-500 mt-0.5">{drill.goal}</p>
              )}
              {drill.key_cue && (
                <p className="text-xs text-[#D4A843] mt-0.5">Cue: {drill.key_cue}</p>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No drills match your search</p>
        )}
      </div>
    </div>
  );
}
