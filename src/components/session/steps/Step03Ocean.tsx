'use client';

import { useTransition } from 'react';
import { checkOceanRules } from '@/lib/actions/cascade-sessions';
import type { CascadeFormState, DropdownOption, OceanRiskState } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  options: DropdownOption[];
  onSelect: (conditions: string, riskState: OceanRiskState) => void;
  onForceVenueSwitch: () => void;
}

const RISK_STYLES: Record<OceanRiskState, { bg: string; text: string; label: string }> = {
  allowed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Safe' },
  caution:  { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Caution' },
  blocked:  { bg: 'bg-red-50',   text: 'text-red-700',   label: 'Blocked' },
};

export function Step03Ocean({ formState, options, onSelect, onForceVenueSwitch }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(conditions: string) {
    if (!formState.student) return;

    startTransition(async () => {
      const riskState = await checkOceanRules(
        formState.student!.belt_level,
        formState.student!.ocean_level,
        conditions
      );
      onSelect(conditions, riskState);
    });
  }

  const risk = formState.oceanRiskState;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Ocean Conditions</h3>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = formState.ocean_conditions === opt.value;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.value)}
              disabled={isPending}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'border-[#D4A843] bg-amber-50'
                  : 'border-gray-100 hover:border-gray-200'
              } ${isPending ? 'opacity-50' : ''}`}
            >
              <span className="text-sm font-medium text-gray-800">
                {opt.label || opt.value}
              </span>
              {isSelected && (
                <span className="ml-auto text-[#D4A843] text-lg">&#10003;</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Risk state badge */}
      {risk && (
        <div className={`p-3 rounded-xl ${RISK_STYLES[risk].bg}`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${RISK_STYLES[risk].text}`}>
              {RISK_STYLES[risk].label}
            </span>
          </div>

          {risk === 'caution' && (
            <p className="text-xs text-amber-600 mt-1">
              Proceed with caution. Ocean level assessment confirms student can handle these conditions.
            </p>
          )}

          {risk === 'blocked' && (
            <div className="mt-2">
              <p className="text-xs text-red-600 mb-2">
                Student cannot enter the water in these conditions.
                Session will switch to dry-land training.
              </p>
              <button
                type="button"
                onClick={onForceVenueSwitch}
                className="w-full py-2 bg-[#1A1A2E] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
              >
                Switch to Dry-Land Venue
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
