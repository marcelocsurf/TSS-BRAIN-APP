'use client';

import { useState } from 'react';
import type { CascadeFormState, PilarPart } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  pilarParts: PilarPart[];
  onSelect: (partId: string, pilarId: string) => void;
}

const PILAR_LABELS: Record<string, string> = {
  technical: 'Technical',
  tactical:  'Tactical',
  mental:    'Mental',
  physical:  'Physical',
};

const PILAR_ICONS: Record<string, string> = {
  technical: '🏄',
  tactical:  '🎯',
  mental:    '🧠',
  physical:  '💪',
};

export function Step06PilarPart({ formState, pilarParts, onSelect }: Props) {
  const [search, setSearch] = useState('');

  // Group by pilar
  const grouped = pilarParts.reduce<Record<string, PilarPart[]>>((acc, part) => {
    if (!acc[part.pilar_id]) acc[part.pilar_id] = [];
    acc[part.pilar_id].push(part);
    return acc;
  }, {});

  const filtered = search
    ? pilarParts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Pilar Part</h3>
      <p className="text-xs text-gray-400">
        Filtered for {formState.student?.belt_level?.replace('_', ' ')}
      </p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search parts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#D4A843]"
      />

      {/* Search results */}
      {filtered ? (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filtered.map((part) => (
            <PartButton
              key={part.id}
              part={part}
              isSelected={formState.pilar_part_id === part.id}
              onSelect={onSelect}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No parts found</p>
          )}
        </div>
      ) : (
        /* Grouped by pilar */
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {['technical', 'tactical', 'mental', 'physical'].map((pilar) => {
            const parts = grouped[pilar];
            if (!parts?.length) return null;

            return (
              <div key={pilar}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {PILAR_ICONS[pilar]} {PILAR_LABELS[pilar]} ({parts.length})
                </p>
                <div className="space-y-1">
                  {parts.map((part) => (
                    <PartButton
                      key={part.id}
                      part={part}
                      isSelected={formState.pilar_part_id === part.id}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PartButton({
  part,
  isSelected,
  onSelect,
}: {
  part: PilarPart;
  isSelected: boolean;
  onSelect: (id: string, pilarId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(part.id, part.pilar_id)}
      className={`w-full p-2.5 rounded-lg border text-left text-sm transition-all ${
        isSelected
          ? 'border-[#D4A843] bg-amber-50 font-medium'
          : 'border-gray-50 hover:border-gray-200'
      }`}
    >
      {part.name}
      {isSelected && <span className="float-right text-[#D4A843]">&#10003;</span>}
    </button>
  );
}
