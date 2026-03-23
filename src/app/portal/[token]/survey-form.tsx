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
    academy_rating: 0,
    session_quality: 0,
    q1_clarity: 0,
    q2_feedback: 0,
    q3_homework_clarity: 0,
    q4_session_value: 0,
    open_comment: '',
    equipment_notes: '',
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      form.coach_rating === 0 ||
      form.academy_rating === 0 ||
      form.session_quality === 0 ||
      form.q1_clarity === 0 ||
      form.q2_feedback === 0 ||
      form.q3_homework_clarity === 0 ||
      form.q4_session_value === 0
    ) {
      setError('Please answer all rating questions.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitSurvey({
        session_result_id: resultId,
        student_id: studentId,
        coach_rating: form.coach_rating,
        academy_rating: form.academy_rating,
        session_quality: form.session_quality,
        q1_clarity: form.q1_clarity,
        q2_feedback: '',
        q3_homework_clarity: form.q3_homework_clarity,
        q4_session_value: form.q4_session_value,
        open_comment: [
          form.open_comment,
          form.equipment_notes ? `Equipment/facilities: ${form.equipment_notes}` : '',
        ].filter(Boolean).join('\n') || '',
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
        <p className="text-2xl mb-2">🤙</p>
        <p className="text-sm font-semibold text-green-700">Thank you for your feedback!</p>
        <p className="text-xs text-green-600 mt-1">It helps us get better every session.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-4 text-center" style={{ background: BRAND.colors.navy }}>
        <h3 className="text-sm font-bold text-white">Share Your Feedback</h3>
        <p className="text-xs mt-0.5" style={{ color: BRAND.colors.gold }}>Takes 20 seconds. Helps us improve.</p>
      </div>

      <div className="p-4 space-y-5">

        <StarQuestion
          label="1. How was your coach?"
          value={form.coach_rating}
          onChange={v => set('coach_rating', v)}
        />

        <StarQuestion
          label="2. How was the overall experience?"
          value={form.academy_rating}
          onChange={v => set('academy_rating', v)}
        />

        <StarQuestion
          label="3. How useful was this session?"
          value={form.session_quality}
          onChange={v => set('session_quality', v)}
        />

        <StarQuestion
          label="4. Was today's goal clear?"
          value={form.q1_clarity}
          onChange={v => set('q1_clarity', v)}
        />

        <StarQuestion
          label="5. Did your coach help you understand what to improve?"
          value={form.q2_feedback}
          onChange={v => set('q2_feedback', v)}
        />

        <StarQuestion
          label="6. Do you understand your next step?"
          value={form.q3_homework_clarity}
          onChange={v => set('q3_homework_clarity', v)}
        />

        <StarQuestion
          label="7. How valuable was this session for your progress?"
          value={form.q4_session_value}
          onChange={v => set('q4_session_value', v)}
        />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            8. Any comments or suggestions? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.open_comment}
            onChange={e => set('open_comment', e.target.value)}
            rows={2}
            placeholder="e.g. The drill on rotation really clicked, but I needed more time on the takeoff..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            9. Any issue with equipment, facilities, or logistics? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.equipment_notes}
            onChange={e => set('equipment_notes', e.target.value)}
            rows={2}
            placeholder="e.g. Board was too large for the conditions..."
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
          {loading ? 'Submitting...' : 'Submit Feedback'}
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
            className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${
              value === n
                ? 'text-white border-transparent'
                : 'border-gray-200 text-gray-400 hover:border-gray-400'
            }`}
            style={value === n ? { background: BRAND.colors.navy } : {}}
          >
            {n}
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
