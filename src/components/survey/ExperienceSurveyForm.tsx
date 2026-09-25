'use client';

import { useState, useTransition } from 'react';
import { submitExperienceByToken } from '@/lib/actions/experience-survey';
import { EXPERIENCE_QUESTIONS, NPS_LABEL } from '@/lib/survey/experience-questions';
import { NpsScale, StarScale, SurveyDone, SurveyError, SurveyField, SurveySubmit, SV } from '@/components/survey/SurveyUi';

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
    return <SurveyDone title="Thank you" lines={[<>Your feedback shapes the next camp. See you in the water.</>]} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {EXPERIENCE_QUESTIONS.map((q) => (
        <StarScale
          key={q.col}
          label={q.label}
          value={ratings[q.col] === NA ? 0 : (ratings[q.col] ?? 0)}
          onChange={(v) => setRatings((prev) => ({ ...prev, [q.col]: v }))}
          na={q.allowNA ? { on: ratings[q.col] === NA, toggle: () => setRatings((prev) => ({ ...prev, [q.col]: prev[q.col] === NA ? 0 : NA })) } : undefined}
        />
      ))}

      <NpsScale label={NPS_LABEL} value={nps} onChange={setNps} />

      <SurveyField
        label="What's one thing we could do better? (optional)"
        value={comment}
        onChange={setComment}
        maxLength={800}
        placeholder="Anything about the facilities, equipment, transport or communication…"
      />

      {error && <SurveyError>{error}</SurveyError>}

      <SurveySubmit loading={submitting} label="Send" />

      <p className="m-0 text-[12.5px] text-center leading-snug" style={{ color: SV.muted }}>
        One minute. Your answers go straight to the academy team.
      </p>
    </form>
  );
}
