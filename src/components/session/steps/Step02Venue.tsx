'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  options: DropdownOption[];
  onSelect: (venue: string, isWater: boolean) => void;
}

export function Step02Venue({ formState, options, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Training Venue</h3>

      <div className="space-y-2">
        {options.map((opt) => {
          const isWater = (opt.metadata as Record<string, boolean>)?.is_water ?? true;
          const isSelected = formState.training_venue === opt.value;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.value, isWater)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'border-[#D4A843] bg-amber-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="text-lg">{isWater ? '🌊' : '🏋️'}</span>
              <span className="text-sm font-medium text-gray-800">
                {opt.label || opt.value}
              </span>
              {!isWater && (
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  Dry land
                </span>
              )}
              {isSelected && (
                <span className="ml-auto text-[#D4A843] text-lg">&#10003;</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
