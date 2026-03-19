'use client';

import type { CascadeFormState } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  onSelect: (value: number) => void;
}

export function Step15Focus({ formState, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Focus Rating</h3>
      <p className="text-xs text-gray-400">Rate the student's focus during the session (1-5)</p>

      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = formState.focus_rating === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              className={`w-14 h-14 rounded-full text-lg font-bold transition-all ${
                isSelected
                  ? 'bg-[#D4A843] text-white scale-110'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        1 = Very distracted &middot; 5 = Fully focused
      </p>
    </div>
  );
}
