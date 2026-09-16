'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  options: DropdownOption[];
  onSelect: (value: string) => void;
}

export function Step21TotalDuration({ formState, options, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Total Duration</h3>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = formState.total_duration === opt.value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`py-3 rounded-[5px] border text-center text-sm font-medium transition-all ${
                isSelected
                  ? 'border-[#5AC3E7] bg-amber-50 text-[#10263B]'
                  : 'border-[#DCD7C6] text-[#55666E] hover:border-[#DCD7C6]'
              }`}
            >
              {opt.label || `${opt.value} min`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
