'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitSurvey } from '@/lib/actions/survey';
import { surveyForService } from '@/lib/survey/questions';
import { ChoiceScale, StarScale, SurveyDivider, SurveyDone, SurveyError, SurveyField, SurveySubmit, SV } from '@/components/survey/SurveyUi';

interface Props {
  resultId: string;
  token: string;
}

// La encuesta del portal (área 1 · Method & coach). Las preguntas se eligen
// SEGÚN EL SERVICIO desde la fuente única (src/lib/survey/questions.ts) — la
// misma que usa el form standalone /feedback, así no divergen. El "flow
// channel" solo se muestra en surf. La cabecera (título, fecha, coach) la pone
// la tarjeta que la contiene (FeedbackTab); acá van solo las preguntas.
// Diseño v10.1 compartido en src/components/survey/SurveyUi.tsx (2026-09-25).
export function SurveyForm({ resultId, token, serviceKind, serviceName }: Props & { serviceKind?: string | null; serviceName?: string | null }) {
  const surveySet = surveyForService(serviceKind, serviceName);
  const labels = surveySet.questions.map((q) => q.label);
  const showFlow = surveySet.flow;
  const methodQs = surveySet.method ?? [];
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
    method_clarity: 0,
    method_next: 0,
    flow_channel: 0,
    open_comment: '',
  });
  // Las cinco preguntas del servicio, en orden, sobre las columnas fijas.
  const COLS = ['coach_rating', 'feedback_clarity', 'safety_rating', 'improvement_value', 'recommend_rating'] as const;

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      form.coach_rating === 0 ||
      form.feedback_clarity === 0 ||
      form.safety_rating === 0 ||
      form.improvement_value === 0 ||
      form.recommend_rating === 0 ||
      (methodQs.length > 0 && (form.method_clarity === 0 || form.method_next === 0)) ||
      (showFlow && form.flow_channel === 0)
    ) {
      setError('Please answer every question before sending.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await submitSurvey({
        session_result_id: resultId,
        portal_token: token,
        coach_rating: form.coach_rating,
        feedback_clarity: form.feedback_clarity,
        safety_rating: form.safety_rating,
        improvement_value: form.improvement_value,
        recommend_rating: form.recommend_rating,
        method_clarity: methodQs.length ? form.method_clarity : null,
        method_next: methodQs.length ? form.method_next : null,
        flow_channel: showFlow ? form.flow_channel : null,
        open_comment: form.open_comment.trim() || '',
      });
      setJustUnlocked(!!result.justUnlockedCoachProfile);
      setSubmitted(true);
      // Re-fetch the server components so the pending badge, the red dot,
      // and the now-unlocked coach feedback all update. router.refresh()
      // keeps this client component's "submitted" state intact.
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Could not send your feedback. Try again.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="px-5 py-5">
        <SurveyDone
          title="Thank you"
          lines={[
            <>Your honest feedback becomes part of your coach&apos;s record.</>,
            <>Your session feedback is now open: go to <b>Sessions</b> to read what your coach wrote and what comes next.</>,
            ...(justUnlocked ? [<>The <b>My Coach</b> tab is open too — rating, certifications and your history together.</>] : []),
          ]}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-6">
      {labels.map((label, i) => (
        <StarScale key={COLS[i]} label={label} value={form[COLS[i]]} onChange={(v) => set(COLS[i], v)} />
      ))}

      {/* EL MÉTODO (Marcelo 2026-09-25): el área 1 es método Y coach. */}
      {methodQs.length > 0 && (
        <>
          <SurveyDivider label="The method" />
          {methodQs.map((q) => (
            <StarScale key={q.col} label={q.label} value={(form as any)[q.col] ?? 0} onChange={(v) => set(q.col, v)} />
          ))}
        </>
      )}

      {/* Canal de flow (solo surf): la misma escala 1–5 que llena el coach;
          comparar ambas revela desajustes. Las palabras son las de Let's Play. */}
      {showFlow && (
        <ChoiceScale
          label="How did the sessions feel?"
          value={form.flow_channel}
          onChange={(v) => set('flow_channel', v)}
          options={[{ n: 1, label: 'Bored' }, { n: 2, label: 'Easy' }, { n: 3, label: 'Flow' }, { n: 4, label: 'Hard' }, { n: 5, label: 'Too much' }]}
          hint="Flow lives between boredom and frustration. Honest answers help your coach set the next session to your level."
        />
      )}

      <SurveyField
        label="Anything else? (optional)"
        value={form.open_comment}
        onChange={(v) => set('open_comment', v)}
        placeholder="What worked? What could be better?"
      />

      {error && <SurveyError>{error}</SurveyError>}

      <SurveySubmit loading={loading} label="Send my feedback" />
      <p className="m-0 text-[12.5px] text-center leading-snug" style={{ color: SV.muted }}>
        Two minutes. Your coach never sees who said what — only the academy does.
      </p>
    </form>
  );
}
