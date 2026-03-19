'use client';

import type { CascadeFormState } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  onChange: (value: string) => void;
}

export function Step07Mission({ formState, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Mission</h3>
      <p className="text-xs text-gray-400">What is the session objective?</p>

      <textarea
        value={formState.mission ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="E.g., Improve pop-up timing on green waves..."
        rows={3}
        className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]"
      />

      {/* Reference: last session context */}
      {formState.student?.last_session_mission && (
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs font-semibold text-gray-500 mb-1">Last Session Mission</p>
          <p className="text-xs text-gray-600">{formState.student.last_session_mission}</p>
        </div>
      )}
      {formState.student?.next_recommended_focus && (
        <div className="p-3 bg-amber-50 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 mb-1">Recommended Focus</p>
          <p className="text-xs text-amber-800">{formState.student.next_recommended_focus}</p>
        </div>
      )}
    </div>
  );
}
