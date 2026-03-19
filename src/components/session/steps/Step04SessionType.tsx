'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  options: DropdownOption[];
  onSelect: (value: string) => void;
}

export function Step04SessionType({ formState, options, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Session Type</h3>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = formState.session_type === opt.value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                isSelected
                  ? 'border-[#D4A843] bg-amber-50 text-gray-800'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200'
              }`}
            >
              {opt.label || opt.value}
              {isSelected && <span className="float-right text-[#D4A843]">&#10003;</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
