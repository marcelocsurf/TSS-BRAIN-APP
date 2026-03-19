'use client';

import type { CascadeFormState } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  onChange: (value: string) => void;
}

export function Step18Achieved({ formState, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Achieved</h3>
      <p className="text-xs text-gray-400">What did the student accomplish during this session?</p>

      <textarea
        value={formState.achieved ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Document what the student accomplished..."
        rows={4}
        className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]"
      />
    </div>
  );
}
