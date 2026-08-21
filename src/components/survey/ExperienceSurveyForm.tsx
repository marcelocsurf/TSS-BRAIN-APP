'use client';

import { useState, useTransition } from 'react';
import { submitExperienceByToken } from '@/lib/actions/experience-survey';
import { EXPERIENCE_QUESTIONS, NPS_LABEL } from '@/lib/survey/experience-questions';

// Formulario de EXPERIENCIA del camp — compartido por el paso 2 de /feedback,
// la página standalone /experience/[token] y la tarjeta del portal.
// Student-facing → inglés. Menos de 60 segundos: puro tap + 1 texto opcional.

const NA = -1; // valor interno para "N/A" (viaja como null)

export function ExperienceSurveyForm({ token, onDone }: { token: string; onDone?: () => void }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [nps, setNps] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ratings.value_rating || ratings.value_rating === NA) {
      setError('Please rate the value for the money.');
      return;
    }
    if (nps == null) {
      setError('Please answer the recommendation question.');
      return;
    }
    startTransition(async () => {
      const val = (col: string) => {
        const v = ratings[col];
        return v == null || v === NA ? null : v;
      };
      const res = await submitExperienceByToken(token, {
        facilities_rating: val('facilities_rating'),
        equipment_rating: val('equipment_rating'),
        transport_rating: val('transport_rating'),
        communication_rating: val('communication_rating'),
        value_rating: val('value_rating'),
        nps,
        open_comment: comment,
      });
      if (!res.ok) {
        setError(res.error || 'Could not submit. Try again.');
        return;
      }
      setDone(true);
      onDone?.();
    });
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl text-emerald-600">{'✓'}</span>
        </div>
        <h2 className="text-base font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Thank you!
        </h2>
        <p className="text-sm text-gray-500 mt-2 leading-snug">
          Your feedback shapes the next camp. See you in the water.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {EXPERIENCE_QUESTIONS.map((q) => (
        <div key={q.col}>
          <p className="text-sm text-gray-700 mb-2">{q.label}</p>
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRatings((prev) => ({ ...prev, [q.col]: n }))}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
                  (ratings[q.col] ?? 0) >= n && ratings[q.col] !== NA
                    ? 'bg-[var(--tss-cyan,#5AC3E7)] text-white'
                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                }`}
                aria-label={`Rate ${n}`}
              >
                {'★'}
              </button>
            ))}
            {q.allowNA && (
              <button
                type="button"
                onClick={() => setRatings((prev) => ({ ...prev, [q.col]: prev[q.col] === NA ? 0 : NA }))}
                className={`h-10 px-2.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  ratings[q.col] === NA
                    ? 'bg-[var(--tss-navy)] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                N/A
              </button>
            )}
          </div>
        </div>
      ))}

      {/* NPS 0-10 */}
      <div>
        <p className="text-sm text-gray-700 mb-2">{NPS_LABEL}</p>
        <div className="grid grid-cols-11 gap-1">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNps(n)}
              className={`h-9 rounded-md text-[12px] font-semibold transition-colors ${
                nps === n
                  ? 'bg-[var(--tss-navy)] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              aria-label={`${n} out of 10`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">Not likely</span>
          <span className="text-[10px] text-gray-500">Absolutely</span>
        </div>
      </div>

      <div>
        <label
          className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {"What's one thing we could do better? (optional)"}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={800}
          placeholder="Anything about the facilities, equipment, transport or communication…"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-[var(--tss-danger,#DC2626)] bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
      >
        {submitting ? 'Sending…' : 'Submit'}
      </button>

      <p className="text-[10px] text-gray-500 text-center leading-snug">
        Takes 1 minute. Your answers go straight to the academy team.
      </p>
    </form>
  );
}
