'use client';

import type { CascadeFormState, DropdownOption } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  incidentTypes: DropdownOption[];
  onToggleIncident: (value: boolean) => void;
  onSetIncidentType: (value: string) => void;
  onSetIncidentDescription: (value: string) => void;
  onSetIncidentAction: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function Step22IncidentClose({
  formState,
  incidentTypes,
  onToggleIncident,
  onSetIncidentType,
  onSetIncidentDescription,
  onSetIncidentAction,
  onSave,
  isSaving,
}: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Close Session</h3>

      {/* Incident toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-medium text-gray-800">Incident Report</p>
          <p className="text-xs text-gray-400">Did any incident occur?</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleIncident(!formState.incident_report)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            formState.incident_report ? 'bg-red-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              formState.incident_report ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Incident fields */}
      {formState.incident_report && (
        <div className="space-y-3 p-4 bg-red-50 rounded-xl border border-red-100">
          <p className="text-sm font-semibold text-red-700">Incident Details</p>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-xs text-red-600 font-medium">Type</label>
            <div className="flex flex-wrap gap-2">
              {incidentTypes.map((opt) => {
                const isSelected = formState.incident_type === opt.value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSetIncidentType(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-red-600 border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {opt.label || opt.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-red-600 font-medium">Description</label>
            <textarea
              value={formState.incident_description ?? ''}
              onChange={(e) => onSetIncidentDescription(e.target.value)}
              placeholder="What happened..."
              rows={2}
              className="w-full p-2.5 rounded-lg border border-red-200 text-sm resize-none focus:outline-none focus:border-red-400"
            />
          </div>

          {/* Action taken */}
          <div className="space-y-1">
            <label className="text-xs text-red-600 font-medium">Action Taken</label>
            <textarea
              value={formState.incident_action_taken ?? ''}
              onChange={(e) => onSetIncidentAction(e.target.value)}
              placeholder="What was done about it..."
              rows={2}
              className="w-full p-2.5 rounded-lg border border-red-200 text-sm resize-none focus:outline-none focus:border-red-400"
            />
          </div>
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className={`w-full py-4 rounded-xl text-white text-sm font-semibold transition-all ${
          isSaving
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#1A1A2E] hover:opacity-90 active:scale-[0.98]'
        }`}
      >
        {isSaving ? 'Saving Session...' : 'Save Session'}
      </button>
    </div>
  );
}
