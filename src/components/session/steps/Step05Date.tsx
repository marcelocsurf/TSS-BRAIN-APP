'use client';

import type { CascadeFormState } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  onSelect: (date: string) => void;
  onTimeChange: (value: string) => void;
}

export function Step05Date({ formState, onSelect, onTimeChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Date &amp; Time</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#55666E] mb-1 block">Date</label>
          <input
            type="date"
            value={formState.session_date}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full p-3 rounded-[5px] border border-[#DCD7C6] text-sm text-[#10263B] focus:outline-none focus:border-[#5AC3E7] focus:ring-1 focus:ring-[#5AC3E7]"
          />
        </div>
        <div>
          <label className="text-xs text-[#55666E] mb-1 block">Time</label>
          <input
            type="time"
            value={formState.session_time ?? ''}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full p-3 rounded-[5px] border border-[#DCD7C6] text-sm text-[#10263B] focus:outline-none focus:border-[#5AC3E7] focus:ring-1 focus:ring-[#5AC3E7]"
          />
        </div>
      </div>

      <p className="text-xs text-[#55666E] text-center">
        Default: today. Change only if logging a past session.
      </p>
    </div>
  );
}
