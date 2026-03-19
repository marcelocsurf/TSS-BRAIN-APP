'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  cueOptions: DropdownOption[];
  onToggleCue: (cue: string) => void;
  onChangeText: (value: string) => void;
}

export function Step20Homework({ formState, cueOptions, onToggleCue, onChangeText }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Homework</h3>

      {/* Cue chips */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Select cues for the student to practice</p>
        <div className="flex flex-wrap gap-2">
          {cueOptions.map((opt) => {
            const isSelected = formState.homework_cues.includes(opt.value);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggleCue(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#D4A843] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label || opt.value}
              </button>
            );
          })}
        </div>
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
