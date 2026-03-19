'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  achievementOptions: DropdownOption[];
  onChange: (value: string) => void;
}

export function Step18Achieved({ formState, achievementOptions, onChange }: Props) {
  // Filter achievement chips by status metadata
  const statusFiltered = achievementOptions.filter((opt) => {
    if (!formState.status) return true; // Show all if no status set
    const metaStatus = (opt.metadata as Record<string, unknown> | null)?.status;
    if (!metaStatus) return true; // No metadata restriction = show always
    return metaStatus === formState.status;
  });

  function handleChipToggle(chipLabel: string) {
    const current = formState.achieved ?? '';
    if (current.includes(chipLabel)) {
      // Remove chip text
      const updated = current.replace(chipLabel, '').replace(/\n{2,}/g, '\n').trim();
      onChange(updated);
    } else {
      // Add chip text
      const updated = current ? `${current}\n${chipLabel}` : chipLabel;
      onChange(updated);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Achieved</h3>
      <p className="text-xs text-gray-400">What did the student accomplish during this session?</p>

      {/* Quick achievement chips */}
      {statusFiltered.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {statusFiltered.map((opt) => {
              const chipText = opt.label || opt.value;
              const isActive = (formState.achieved ?? '').includes(chipText);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleChipToggle(chipText)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#D4A843] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {chipText}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
