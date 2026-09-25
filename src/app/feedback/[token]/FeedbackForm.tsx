'use client';

import { useState, useTransition } from 'react';
import { submitFeedbackByToken } from '@/lib/actions/feedback-token';
import { surveyForService } from '@/lib/survey/questions';
import { ExperienceSurveyForm } from '@/components/survey/ExperienceSurveyForm';
import { StarScale, SurveyDivider, SurveyDone, SurveyError, SurveyField, SurveySubmit, SV, SV_ARCHIVO, SV_PLEX } from '@/components/survey/SurveyUi';

// Survey form. Renders client-side so the user gets immediate validation +
// a thank-you state after submit. Las preguntas se eligen SEGÚN EL SERVICIO
// (Yoga no pregunta "safe in the water") desde la fuente única de preguntas.

interface Props {
  token: string;
  serviceKind?: string | null;
  serviceName?: string | null;
  /** Paso 2 (Opción A): encuesta de experiencia del camp pendiente. */
  experience?: { token: string; campName: string | null } | null;
}

export function FeedbackForm({ token, serviceKind, serviceName, experience }: Props) {
  const SET = surveyForService(serviceKind, serviceName);
  const QUESTIONS = SET.questions;
  const METHOD = SET.method ?? [];
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
        method_clarity: ratings.method_clarity,
        method_next: ratings.method_next,
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
    // Paso 2 encadenado (Opción A): con experiencia pendiente, en vez del
    // gracias final viene la encuesta de EXPERIENCIA del camp — un solo link.
    if (experience) {
      return (
        <div className="space-y-4 pt-2">
          <div className="rounded-[5px] px-3 py-2.5 flex items-center gap-2.5" style={{ background: SV.sand, border: `1px solid ${SV.border}` }}>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[14px] font-black shrink-0" style={{ background: SV.ink, color: SV.cyan }}>✓</span>
            <p className="m-0 text-[15px]" style={{ color: SV.inkText }}>Method &amp; coach sent — thank you.</p>
          </div>
          <div>
            <p className="m-0" style={{ ...SV_PLEX, color: SV.muted }}>2 · Experience</p>
            <h3 className="m-0 mt-1 text-[22px]" style={{ ...SV_ARCHIVO, color: SV.inkText }}>{experience.campName || 'Your camp experience'}</h3>
            <p className="m-0 mt-1 text-[15px] leading-snug" style={{ color: SV.muted }}>One more minute: facilities, equipment, transport and value.</p>
          </div>
          <ExperienceSurveyForm token={experience.token} />
        </div>
      );
    }
    return <SurveyDone title="Thank you" lines={[<>Your feedback was sent. See you in the water.</>]} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {QUESTIONS.map((q) => (
        <StarScale key={q.col} label={q.label} value={ratings[q.col] ?? 0} onChange={(v) => setRatings((prev) => ({ ...prev, [q.col]: v }))} />
      ))}
      {METHOD.length > 0 && (
        <>
          <SurveyDivider label="The method" />
          {METHOD.map((q) => (
            <StarScale key={q.col} label={q.label} value={ratings[q.col] ?? 0} onChange={(v) => setRatings((prev) => ({ ...prev, [q.col]: v }))} />
          ))}
        </>
      )}

      <SurveyField label="Anything else? (optional)" value={comment} onChange={setComment} placeholder="Comments for your coach or the academy…" />

      {error && <SurveyError>{error}</SurveyError>}

      <SurveySubmit loading={submitting} label="Send my feedback" />

      <p className="m-0 text-[12.5px] text-center leading-snug" style={{ color: SV.muted }}>
        Two minutes. Your coach never sees who said what — only the academy does.
      </p>
    </form>
  );
}
