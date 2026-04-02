'use client';

import { getRatingColumnsForBelt } from '@/lib/constants/cascade';
import type { BeltLevel, CascadeFormState, RatingScale } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  ratingScales: RatingScale[];
  onRate: (scaleName: string, value: number) => void;
}

// Map scale_name → form state key
const SCALE_TO_KEY: Record<string, keyof CascadeFormState> = {
  frustration: 'frustration_rating',
  composure:   'composure_rating',
  control:     'control_rating',
  autonomy:    'autonomy_rating',
  linking:     'linking_rating',
  commitment:  'commitment_rating',
  variety:     'variety_rating',
  precision:   'precision_rating',
  knowledge:   'knowledge_rating',
  integration: 'integration_rating',
};

// Custom frustration scale (Canon TSS)
const FRUSTRATION_LEVELS = [
  { value: 0, label: 'No frustration', emoji: '😎', color: 'bg-green-500' },
  { value: 1, label: 'Difficult but achievable', emoji: '💪', color: 'bg-yellow-500' },
  { value: 2, label: 'Very difficult', emoji: '😤', color: 'bg-orange-500' },
  { value: 3, label: 'Total frustration', emoji: '🚫', color: 'bg-red-500' },
];

export function Step16ProgressiveRatings({ formState, ratingScales, onRate }: Props) {
  if (!formState.student) return null;

  const beltLevel = formState.student.belt_level as BeltLevel;
  const applicableColumns = getRatingColumnsForBelt(beltLevel);

  // Filter scales that apply to this belt (exclude frustration — rendered separately)
  const applicableScales = ratingScales.filter((scale) => {
    const key = SCALE_TO_KEY[scale.scale_name];
    return key && applicableColumns.includes(key as string) && scale.scale_name !== 'frustration';
  });

  const showFrustration = applicableColumns.includes('frustration_rating');

  if (applicableScales.length === 0 && !showFrustration) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1A1A2E]">Progressive Ratings</h3>
        <p className="text-sm text-gray-400 text-center py-4">
          No additional ratings for this belt level.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Progressive Ratings</h3>
      <p className="text-xs text-gray-400">
        Scales for {beltLevel.replace('_', ' ')}
      </p>

      {/* Frustration: Custom 0-3 scale */}
      {showFrustration && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Frustration Level</span>
            <span className="text-xs text-gray-400">Lower is better</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FRUSTRATION_LEVELS.map((level) => {
              const isSelected = formState.frustration_rating === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => onRate('frustration', level.value)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-[#1A1A2E] bg-[#1A1A2E] text-white shadow-md scale-[1.02]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${level.color}`}>
                    {level.value}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium leading-tight block">{level.label}</span>
                  </div>
                  <span className="text-base">{level.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Other progressive scales: standard 1-5 */}
      {applicableScales.map((scale) => {
        const key = SCALE_TO_KEY[scale.scale_name] as keyof CascadeFormState;
        const currentValue = formState[key] as number | null;

        return (
          <div key={scale.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{scale.label}</span>
              {scale.description && (
                <span className="text-xs text-gray-400">{scale.description}</span>
              )}
            </div>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((n) => {
                const isSelected = currentValue === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onRate(scale.scale_name, n)}
                    className={`w-12 h-12 rounded-full text-sm font-bold transition-all ${
                      isSelected
                        ? 'bg-[#1A1A2E] text-white scale-110'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
