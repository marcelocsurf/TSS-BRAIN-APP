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
      <p className="text-xs text-[#55666E]">{drills.length} drills available</p>

      <input
        type="text"
        placeholder="Search drills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2.5 rounded-lg border border-[#DCD7C6] text-sm focus:outline-none focus:border-[#5AC3E7]"
      />

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map((drill) => {
          const isSelected = formState.drill_id === drill.id;
          return (
            <button
              key={drill.id}
              type="button"
              onClick={() => onSelect(drill.id)}
              className={`w-full p-3 rounded-[5px] border text-left transition-all ${
                isSelected
                  ? 'border-[#5AC3E7] bg-amber-50'
                  : 'border-[#DCD7C6] hover:border-[#DCD7C6]'
              }`}
            >
              <p className="text-sm font-medium text-[#10263B]">{drill.name}</p>
              {drill.goal && (
                <p className="text-xs text-[#55666E] mt-0.5">{drill.goal}</p>
              )}
              {drill.key_cue && (
                <p className="text-xs text-[#5AC3E7] mt-0.5">Cue: {drill.key_cue}</p>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-[#55666E] text-center py-4">No drills match your search</p>
        )}
      </div>
    </div>
  );
}
