'use client';

import type { CascadeFormState, SessionStatus } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  onSelect: (value: SessionStatus) => void;
}

const STATUS_OPTIONS: { value: SessionStatus; label: string; color: string; bg: string }[] = [
  { value: 'not_yet',      label: 'Not Yet',       color: 'text-gray-600',  bg: 'bg-gray-50 border-gray-200' },
  { value: 'partial',      label: 'Partial',      color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { value: 'competent',    label: 'Competent',    color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
  { value: 'mastered',     label: 'Mastered',     color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
];

export function Step14Status({ formState, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Session Status</h3>
      <p className="text-xs text-gray-400">How did the student perform?</p>

      <div className="space-y-2">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = formState.status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full p-4 rounded-xl border-2 text-left text-sm font-semibold transition-all ${
                isSelected
                  ? `${opt.bg} ${opt.color}`
                  : 'border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              {opt.label}
              {isSelected && <span className="float-right">&#10003;</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
