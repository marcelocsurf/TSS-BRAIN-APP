'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  missionTypes: DropdownOption[];
  selectedPilarPartName: string | null;
  onChange: (value: string) => void;
  onMissionTypeChange: (value: string) => void;
}

export function Step07Mission({ formState, missionTypes, selectedPilarPartName, onChange, onMissionTypeChange }: Props) {
  // Auto-generate mission suggestion when both pilar part and mission type are selected
  const suggestion =
    selectedPilarPartName && formState.mission_type
      ? `${selectedPilarPartName} — ${
          missionTypes.find((m) => m.value === formState.mission_type)?.label || formState.mission_type
        }`
      : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Mission</h3>
      <p className="text-xs text-[#55666E]">What is the session objective?</p>

      {/* Mission type chips */}
      {missionTypes.length > 0 && (
        <div>
          <p className="text-xs text-[#55666E] mb-2">Mission Type</p>
          <div className="flex flex-wrap gap-2">
            {missionTypes.map((mt) => {
              const isSelected = formState.mission_type === mt.value;
              return (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => onMissionTypeChange(mt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#1A1A2E] text-white'
                      : 'bg-[#EDF3F5] text-[#55666E] hover:bg-[#DCD7C6]'
                  }`}
                >
                  {mt.label || mt.value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Auto-generated suggestion */}
      {suggestion && formState.mission !== suggestion && (
        <button
          type="button"
          onClick={() => onChange(suggestion)}
          className="w-full p-3 rounded-[5px] border border-dashed border-[#5AC3E7] bg-amber-50/50 text-left text-sm text-[#10263B] hover:bg-amber-50 transition-colors"
        >
          <span className="text-xs font-semibold text-[#5AC3E7] block mb-0.5">Suggested Mission</span>
          {suggestion}
        </button>
      )}

      <textarea
        value={formState.mission ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="E.g., Improve pop-up timing on green waves..."
        rows={3}
        className="w-full p-3 rounded-[5px] border border-[#DCD7C6] text-sm resize-none focus:outline-none focus:border-[#5AC3E7] focus:ring-1 focus:ring-[#5AC3E7]"
      />

      {/* Reference: last session context */}
      {formState.student?.last_session_mission && (
        <div className="p-3 bg-[#F7F9FA] rounded-[5px]">
          <p className="text-xs font-semibold text-[#55666E] mb-1">Last Session Mission</p>
          <p className="text-xs text-[#55666E]">{formState.student.last_session_mission}</p>
        </div>
      )}
      {formState.student?.next_recommended_focus && (
        <div className="p-3 bg-amber-50 rounded-[5px]">
          <p className="text-xs font-semibold text-amber-700 mb-1">Recommended Focus</p>
          <p className="text-xs text-amber-800">{formState.student.next_recommended_focus}</p>
        </div>
      )}
    </div>
  );
}
