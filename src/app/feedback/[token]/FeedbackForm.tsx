'use client';

import { useState, useTransition } from 'react';
import { submitFeedbackByToken } from '@/lib/actions/feedback-token';
import { surveyForService } from '@/lib/survey/questions';

// Survey form. Renders client-side so the user gets immediate validation +
// a thank-you state after submit. Las preguntas se eligen SEGÚN EL SERVICIO
// (Yoga no pregunta "safe in the water") desde la fuente única de preguntas.

interface Props {
  token: string;
  serviceKind?: string | null;
  serviceName?: string | null;
}

export function FeedbackForm({ token, serviceKind, serviceName }: Props) {
  const QUESTIONS = surveyForService(serviceKind, serviceName).questions;
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submitting, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ratings.coach_rating) {
      setError('Please rate your coach first.');
      return;
    }
    startTransition(async () => {
      const res = await submitFeedbackByToken(token, {
        coach_rating: ratings.coach_rating,
        q1_clarity: ratings.q1_clarity,
        q3_homework_clarity: ratings.q3_homework_clarity,
        q4_session_value: ratings.q4_session_value,
        academy_rating: ratings.academy_rating,
        open_comment: comment,
      });
      if (!res.ok) {
        setError(res.error || 'Could not submit. Try again.');
        return;
      }
      setDone(true);
    });
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl text-emerald-600">{'✓'}</span>
        </div>
        <h2 className="text-base font-bold text-[var(--tss-navy)]"
            style={{ fontFamily: 'var(--font-heading)' }}>
          Thanks!
        </h2>
        <p className="text-sm text-gray-500 mt-2 leading-snug">
          Your feedback was sent. See you in the water.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {QUESTIONS.map((q) => (
        <StarRating
          key={q.col}
          label={q.label}
          value={ratings[q.col] ?? 0}
          onChange={(v) => setRatings((prev) => ({ ...prev, [q.col]: v }))}
        />
      ))}

      <div>
        <label
          className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Anything else? (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Comments for your coach or the academy…"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-[var(--tss-danger,#DC2626)] bg-red-50 px-3 py-2 rounded">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
      >
        {submitting ? 'Sending…' : 'Submit feedback'}
      </button>

      <p className="text-[10px] text-gray-400 text-center leading-snug">
        Takes 30 seconds. Your responses are anonymous to the coach
        and only the academy sees the rollup.
      </p>
    </form>
  );
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-sm text-gray-700 mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
              n <= value
                ? 'bg-[var(--tss-cyan,#5AC3E7)] text-white'
                : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
            }`}
            aria-label={`Rate ${n}`}
          >
            {'★'}
          </button>
        ))}
      </div>
    </div>
  );
}
