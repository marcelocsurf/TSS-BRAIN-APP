'use client';

import { useState } from 'react';
import { submitSurvey } from '@/lib/actions/survey';
import { BRAND } from '@/lib/constants/brand';

interface Props {
  resultId: string;
  studentId: string;
  token: string;
}

export function SurveyForm({ resultId, studentId, token }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    coach_rating: 0,
    q1_clarity: 0,
    q2_feedback: '',
    q3_homework_clarity: 0,
    q4_session_value: 0,
    open_comment: '',
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.coach_rating === 0 || form.q1_clarity === 0 || form.q3_homework_clarity === 0 || form.q4_session_value === 0) {
      setError('Please answer all rating questions.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitSurvey({
        session_result_id: resultId,
        student_id: studentId,
        ...form,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-green-700">Thank you!</p>
        <p className="text-sm text-green-600 mt-1">Your feedback has been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50" style={{ background: BRAND.colors.navy }}>
        <h3 className="text-sm font-semibold text-white">Share Your Feedback</h3>
        <p className="text-xs text-white/60 mt-0.5">Takes 30 seconds. Helps us improve.</p>
      </div>

      <div className="p-4 space-y-5">
        <StarQuestion label="How was your coach?" value={form.coach_rating} onChange={v => set('coach_rating', v)} />
        <StarQuestion label="Was the session goal clear?" value={form.q1_clarity} onChange={v => set('q1_clarity', v)} />
        <StarQuestion label="Do you understand your homework?" value={form.q3_homework_clarity} onChange={v => set('q3_homework_clarity', v)} />
        <StarQuestion label="How valuable was this session?" value={form.q4_session_value} onChange={v => set('q4_session_value', v)} />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">What did you enjoy?</label>
          <textarea
            value={form.q2_feedback}
            onChange={e => set('q2_feedback', e.target.value)}
            rows={2}
            placeholder="Optional..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Anything else? (optional)</label>
          <textarea
            value={form.open_comment}
            onChange={e => set('open_comment', e.target.value)}
            rows={2}
            placeholder="Optional..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          style={{ background: BRAND.colors.navy }}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </form>
  );
}

function StarQuestion({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-full border text-sm font-medium transition-all ${
              value >= n
                ? 'bg-[var(--tss-gold)] border-[var(--tss-gold)] text-white'
                : 'border-gray-200 text-gray-400 hover:border-gray-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
