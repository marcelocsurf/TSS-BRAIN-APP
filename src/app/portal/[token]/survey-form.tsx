'use client';

import { useState } from 'react';
import { submitSurvey } from '@/lib/actions/survey';
import { BRAND } from '@/lib/constants/brand';

interface Props {
  resultId: string;
  studentId: string;
  token: string;
}

// 3-question coach rating survey. Sent by the coach at the end of class so
// the student can rate them while the experience is fresh. Feeds the
// coach's official rating used for performance audits.
//
// Schema-wise we still have the legacy 7-column survey_responses table —
// the server action backfills the obsolete columns with coach_rating so
// existing aggregates keep working without a migration.
export function SurveyForm({ resultId, studentId, token: _token }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    coach_rating: 0,
    feedback_clarity: 0,
    improvement_value: 0,
    open_comment: '',
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      form.coach_rating === 0 ||
      form.feedback_clarity === 0 ||
      form.improvement_value === 0
    ) {
      setError('Please rate all 3 questions before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await submitSurvey({
        session_result_id: resultId,
        student_id: studentId,
        coach_rating: form.coach_rating,
        feedback_clarity: form.feedback_clarity,
        improvement_value: form.improvement_value,
        open_comment: form.open_comment.trim() || '',
      });
      setJustUnlocked(!!result.justUnlockedCoachProfile);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">🤙</p>
          <p className="text-sm font-semibold text-green-700">Thanks for rating your coach!</p>
          <p className="text-xs text-green-600 mt-1">
            Your feedback is part of their official record.
          </p>
        </div>
        {justUnlocked && (
          <div
            className="rounded-xl p-5 text-center border-2"
            style={{ background: '#FEF3C7', borderColor: BRAND.colors.gold }}
          >
            <p className="text-3xl mb-1">&#128275;</p>
            <p className="text-sm font-bold text-amber-900">
              You just unlocked your coach&apos;s profile
            </p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Open the new <strong>My Coach</strong> tab to see their rating,
              certifications, and your session history together.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-4 text-center" style={{ background: BRAND.colors.navy }}>
        <h3 className="text-sm font-bold text-white">Rate Your Coach</h3>
        <p className="text-xs mt-0.5" style={{ color: BRAND.colors.gold }}>
          3 quick questions. Your honest feedback becomes part of their record.
        </p>
      </div>

      <div className="p-4 space-y-5">

        <StarQuestion
          label="1. How was your coach overall?"
          value={form.coach_rating}
          onChange={v => set('coach_rating', v)}
        />

        <StarQuestion
          label="2. How clear was their feedback?"
          value={form.feedback_clarity}
          onChange={v => set('feedback_clarity', v)}
        />

        <StarQuestion
          label="3. How much did this session help you improve?"
          value={form.improvement_value}
          onChange={v => set('improvement_value', v)}
        />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Comments <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.open_comment}
            onChange={e => set('open_comment', e.target.value)}
            rows={3}
            placeholder="What worked? What could be better?"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          style={{ background: BRAND.colors.navy }}
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </form>
  );
}

function StarQuestion({ label, value, onChange }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2 leading-relaxed">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            className={`flex-1 h-10 rounded-lg border text-lg transition-all ${
              n <= value
                ? 'border-transparent'
                : 'border-gray-200 text-gray-300 hover:border-gray-400'
            }`}
            style={
              n <= value
                ? { background: BRAND.colors.gold, color: '#fff' }
                : {}
            }
          >
            {n <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-300">Poor</span>
        <span className="text-[10px] text-gray-300">Excellent</span>
      </div>
    </div>
  );
}
