'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  cueOptions: DropdownOption[];
  currentPilar: string | null;
  onToggleCue: (cue: string) => void;
  onChangeText: (value: string) => void;
}

export function Step20Homework({ formState, cueOptions, currentPilar, onToggleCue, onChangeText }: Props) {
  // Split cues into recommended (matching pilar) and other
  const recommended: DropdownOption[] = [];
  const other: DropdownOption[] = [];

  for (const opt of cueOptions) {
    const metaPilars = (opt.metadata as Record<string, unknown> | null)?.pilars;
    if (currentPilar && Array.isArray(metaPilars) && metaPilars.includes(currentPilar)) {
      recommended.push(opt);
    } else {
      other.push(opt);
    }
  }

  // If no metadata match, show all as one group
  const hasRecommended = recommended.length > 0;

  function renderCueChips(options: DropdownOption[], highlight: boolean) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = formState.homework_cues.includes(opt.value);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggleCue(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#D4A843] text-white'
                  : highlight
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label || opt.value}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Homework</h3>

      {/* Cue chips */}
      <div>
        {hasRecommended ? (
          <>
            <p className="text-xs text-amber-700 font-semibold mb-2">Recommended for this pilar</p>
            {renderCueChips(recommended, true)}
            {other.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mt-3 mb-2">Other</p>
                {renderCueChips(other, false)}
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-2">Select cues for the student to practice</p>
            {renderCueChips(cueOptions, false)}
          </>
        )}
      </div>

      {/* Free text */}
      <textarea
        value={formState.homework_text ?? ''}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Additional homework instructions (optional)..."
        rows={3}
        className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]"
      />
    </div>
  );
}
