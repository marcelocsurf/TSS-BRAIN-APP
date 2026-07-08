'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitSurvey } from '@/lib/actions/survey';
import { BRAND } from '@/lib/constants/brand';
import { ThumbsUp, Lock, MessageSquare } from 'lucide-react';

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
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    coach_rating: 0,
    feedback_clarity: 0,
    safety_rating: 0,
    improvement_value: 0,
    recommend_rating: 0,
    flow_channel: 0,
    open_comment: '',
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      form.coach_rating === 0 ||
      form.feedback_clarity === 0 ||
      form.safety_rating === 0 ||
      form.improvement_value === 0 ||
      form.recommend_rating === 0 ||
      form.flow_channel === 0
    ) {
      setError('Please answer all 6 questions before submitting.');
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
        safety_rating: form.safety_rating,
        improvement_value: form.improvement_value,
        recommend_rating: form.recommend_rating,
        flow_channel: form.flow_channel,
        open_comment: form.open_comment.trim() || '',
      });
      setJustUnlocked(!!result.justUnlockedCoachProfile);
      setSubmitted(true);
      // Re-fetch the server components so the pending badge, the red dot,
      // and the now-unlocked coach feedback all update. router.refresh()
      // keeps this client component's "submitted" state intact.
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <ThumbsUp size={24} strokeWidth={1.75} className="mx-auto mb-2 text-green-600" />
          <p className="text-sm font-semibold text-green-700">Thanks for rating your coach!</p>
          <p className="text-xs text-green-600 mt-1">
            Your honest feedback becomes part of their record.
          </p>
        </div>
        {/* The real reward: the coach's written feedback for this session
            is now unlocked. */}
        <div
          className="rounded-xl p-5 text-center border-2"
          style={{ background: '#ECFDF5', borderColor: '#10B981' }}
        >
          <MessageSquare size={26} strokeWidth={1.75} className="mx-auto mb-1 text-emerald-700" />
          <p className="text-sm font-bold text-emerald-900">
            Your session feedback is unlocked
          </p>
          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
            Open the <strong>Sessions</strong> tab to read what your coach wrote
            for you — feedback and what&apos;s next.
          </p>
        </div>
        {justUnlocked && (
          <div
            className="rounded-xl p-4 text-center border"
            style={{ background: '#FEF3C7', borderColor: BRAND.colors.gold }}
          >
            <Lock size={20} strokeWidth={1.75} className="mx-auto mb-1 text-amber-700" />
            <p className="text-xs font-semibold text-amber-900">
              Bonus: the <strong>My Coach</strong> tab is now open
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
              See your coach&apos;s rating, certifications, and your history together.
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
          A few quick questions. Your honest feedback becomes part of their record.
        </p>
      </div>

      <div className="p-4 space-y-5">

        <StarQuestion
          label="1. How was your coach overall?"
          value={form.coach_rating}
          onChange={v => set('coach_rating', v)}
        />

        <StarQuestion
          label="2. Were the instructions and explanations clear and easy to follow?"
          value={form.feedback_clarity}
          onChange={v => set('feedback_clarity', v)}
        />

        <StarQuestion
          label="3. Did you feel safe and well looked after in the water?"
          value={form.safety_rating}
          onChange={v => set('safety_rating', v)}
        />

        <StarQuestion
          label="4. Did you learn something and feel you improved?"
          value={form.improvement_value}
          onChange={v => set('improvement_value', v)}
        />

        <StarQuestion
          label="5. Would you take another class with this coach?"
          value={form.recommend_rating}
          onChange={v => set('recommend_rating', v)}
        />

        {/* M47 — Student-reported flow channel. Same 1-5 scale the coach
            fills on their side; comparing the two lets the academy spot
            mismatches (coach thought it was optimal, student felt
            frustrated → next class needs less exigency). */}
        <FlowChannelQuestion
          label="6. How did the class feel?"
          value={form.flow_channel}
          onChange={v => set('flow_channel', v)}
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

// M47 — Csíkszentmihályi flow channel self-report. 1 = boring/too easy,
// 3 = optimal/flow, 5 = frustrating/too hard. Center is the goal.
function FlowChannelQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const options = [
    { n: 1, color: '#3B82F6', label: 'Bored' },
    { n: 2, color: '#06B6D4', label: 'Easy' },
    { n: 3, color: '#10B981', label: 'Optimal' },
    { n: 4, color: '#F59E0B', label: 'Hard' },
    { n: 5, color: '#EF4444', label: 'Frustrating' },
  ];
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2 leading-relaxed">
        {label}
      </label>
      <div className="grid grid-cols-5 gap-1">
        {options.map((opt) => (
          <button
            key={opt.n}
            type="button"
            onClick={() => onChange(opt.n)}
            className="py-2 rounded-lg text-[10px] font-bold transition-all"
            style={
              value === opt.n
                ? { background: opt.color, color: 'white' }
                : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-1 italic text-center">
        Honest answers help your coach dial the next class to your level.
      </p>
    </div>
  );
}
