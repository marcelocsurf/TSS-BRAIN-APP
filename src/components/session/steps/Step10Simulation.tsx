'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  options: DropdownOption[];
  onSelect: (value: string) => void;
}

export function Step10Simulation({ formState, options, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Simulation</h3>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = formState.simulation === opt.value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full p-3 rounded-[5px] border text-left text-sm font-medium transition-all ${
                isSelected
                  ? 'border-[#5AC3E7] bg-amber-50 text-[#10263B]'
                  : 'border-[#DCD7C6] text-[#55666E] hover:border-[#DCD7C6]'
              }`}
            >
              {opt.label || opt.value}
              {isSelected && <span className="float-right text-[#5AC3E7]">&#10003;</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
