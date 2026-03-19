'use client';

import type { CascadeFormState } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  onSelect: (date: string) => void;
}

export function Step05Date({ formState, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Session Date</h3>

      <input
        type="date"
        value={formState.session_date}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]"
      />

      <p className="text-xs text-gray-400 text-center">
        Default: today. Change only if logging a past session.
      </p>
    </div>
  );
}
