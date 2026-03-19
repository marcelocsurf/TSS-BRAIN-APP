'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  options: DropdownOption[];
  onSelectQuick: (value: string) => void;
  onChangeText: (value: string) => void;
}

export function Step17CoachFeedback({ formState, options, onSelectQuick, onChangeText }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Coach Feedback</h3>

      {/* Quick select */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = formState.coach_feedback_quick === opt.value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectQuick(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label || opt.value}
            </button>
          );
        })}
      </div>

      {/* Free text */}
      <textarea
        value={formState.coach_feedback_text ?? ''}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Detailed feedback (optional)..."
        rows={3}
        className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]"
      />
    </div>
  );
}
