'use client';

import type { CascadeFormState } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  onChange: (value: number) => void;
}

export function Step13Repetitions({ formState, onChange }: Props) {
  const value = formState.repetitions ?? 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Repetitions</h3>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-14 h-14 rounded-full border-2 border-gray-200 text-2xl text-gray-600 hover:border-[#D4A843] transition-colors"
        >
          &minus;
        </button>
        <span className="text-4xl font-bold text-[#1A1A2E] w-16 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-14 h-14 rounded-full border-2 border-gray-200 text-2xl text-gray-600 hover:border-[#D4A843] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
