'use client';

import { useState } from 'react';
import type { CascadeFormState, PilarPart, SessionStatus } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  pilarParts: PilarPart[]; // Same filtered list as Step 6
  currentPilarPartId: string | null;
  status: SessionStatus | null;
  onSelect: (partId: string) => void;
}

const PILAR_LABELS: Record<string, string> = {
  technical: 'Technical',
  tactical:  'Tactical',
  mental:    'Mental',
  physical:  'Physical',
};

export function Step19WhatsNext({ formState, pilarParts, currentPilarPartId, status, onSelect }: Props) {
  const [search, setSearch] = useState('');

  // Determine suggested pilar part
  const currentPart = pilarParts.find((p) => p.id === currentPilarPartId);
  let suggestedPart: PilarPart | null = null;
  let suggestionBadge = '';

  if (status === 'mastered' && currentPart) {
    // Find next pilar part by display_order + 1 in same pilar
    const nextPart = pilarParts.find(
      (p) => p.pilar_id === currentPart.pilar_id && p.display_order === currentPart.display_order + 1
    );
    if (nextPart) {
      suggestedPart = nextPart;
      suggestionBadge = 'Suggested';
    }
  } else if ((status === 'partial' || status === 'not_achieved') && currentPart) {
    suggestedPart = currentPart;
    suggestionBadge = 'Continue';
  }

  const filtered = search
    ? pilarParts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : pilarParts;

  // Group by pilar
  const grouped = filtered.reduce<Record<string, PilarPart[]>>((acc, part) => {
    if (!acc[part.pilar_id]) acc[part.pilar_id] = [];
    acc[part.pilar_id].push(part);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">What&apos;s Next</h3>
      <p className="text-xs text-gray-400">Select the focus for the next session</p>

      {/* Contextual suggestion */}
      {suggestedPart && (
        <button
          type="button"
          onClick={() => onSelect(suggestedPart!.id)}
          className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
            formState.whats_next_pilar_part_id === suggestedPart.id
              ? 'border-[#D4A843] bg-amber-50 font-medium'
              : 'border-[#D4A843]/40 bg-amber-50/30 hover:bg-amber-50/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                suggestionBadge === 'Suggested'
                  ? 'bg-[#D4A843] text-white'
                  : 'bg-[#1A1A2E] text-white'
              }`}
            >
              {suggestionBadge}
            </span>
            <span className="text-gray-800">{suggestedPart.name}</span>
            {formState.whats_next_pilar_part_id === suggestedPart.id && (
              <span className="ml-auto text-[#D4A843]">&#10003;</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{PILAR_LABELS[suggestedPart.pilar_id] || suggestedPart.pilar_id}</p>
        </button>
      )}

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#D4A843]"
      />

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {['technical', 'tactical', 'mental', 'physical'].map((pilar) => {
          const parts = grouped[pilar];
          if (!parts?.length) return null;
          return (
            <div key={pilar}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {PILAR_LABELS[pilar]}
              </p>
              {parts.map((part) => {
                const isSelected = formState.whats_next_pilar_part_id === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => onSelect(part.id)}
                    className={`w-full p-2.5 rounded-lg border text-left text-sm transition-all mb-1 ${
                      isSelected
                        ? 'border-[#D4A843] bg-amber-50 font-medium'
                        : 'border-gray-50 hover:border-gray-200'
                    }`}
                  >
                    {part.name}
                    {isSelected && <span className="float-right text-[#D4A843]">&#10003;</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
