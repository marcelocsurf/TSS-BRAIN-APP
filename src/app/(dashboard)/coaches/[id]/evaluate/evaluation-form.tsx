'use client';

// ═══ Evaluación del director · v2 acorde al método (Marcelo 2026-09-17) ═══
// Cinco dimensiones 0–3 con descriptor por nivel, fortalezas, áreas, nota
// privada y recomendación de nivel. Escribe en coach_evaluations con
// instrument = 'v2'; el historial v1 (1–10) se muestra tal cual.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Lock, Star } from 'lucide-react';
import { COACH_EVAL_DIMENSIONS, COACH_EVAL_MAX, COACH_EVAL_BELTS, type CoachEvalDimension } from '@/lib/constants/coach-eval';

interface Props {
  coachId: string;
  coachName: string;
  evaluatorId: string;
  currentMaxBelt: string | null;
}

type Scores = Record<CoachEvalDimension['key'], number | null>;

export function EvaluationForm({ coachId, coachName, evaluatorId, currentMaxBelt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Scores>({ eye_score: null, delivery_score: null, cues_score: null, safety_score: null, plan_score: null });
  const [strengths, setStrengths] = useState('');
  const [areas, setAreas] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendedBelt, setRecommendedBelt] = useState<string>(currentMaxBelt || 'yellow_belt');
  const [promote, setPromote] = useState(false);

  const total = COACH_EVAL_DIMENSIONS.reduce((a, d) => a + (scores[d.key] ?? 0), 0);
  const complete = COACH_EVAL_DIMENSIONS.every((d) => scores[d.key] != null);

  const handleSubmit = async () => {
    if (!complete) { setError('Mark all five dimensions.'); return; }
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from('coach_evaluations').insert({
      coach_id: coachId,
      evaluated_by: evaluatorId,
      instrument: 'v2',
      ...scores,
      strengths: strengths || null,
      areas_to_improve: areas || null,
      director_notes: notes || null,
      recommended_max_belt: recommendedBelt || null,
      recommended_for_promotion: promote,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => router.push(`/coaches/${coachId}`), 1200);
  };

  if (saved) {
    return (
      <div className="bg-emerald-50 rounded-lg p-8 text-center">
        <CheckCircle2 size={32} strokeWidth={1.75} className="mx-auto mb-2 text-emerald-600" />
        <p className="text-lg font-semibold text-emerald-700">Evaluation saved</p>
        <p className="text-sm text-emerald-600/80 mt-1">Back to the coach…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-mono tracking-[0.22em] text-[var(--tss-cyan,#5AC3E7)] uppercase mb-1 font-semibold" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}>
          Director Evaluation · the method
        </p>
        <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>{coachName}</h2>
        <p className="text-sm text-[#55666E]">Five dimensions, 0–3 each. Tap the line that describes what you saw.</p>
      </div>

      <div className="space-y-3">
        {COACH_EVAL_DIMENSIONS.map((d, i) => {
          const v = scores[d.key];
          return (
            <div key={d.key} className="bg-[#F7F9FA] rounded-lg border border-[#DCD7C6] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-bold text-[var(--tss-navy)]">{i + 1} · {d.title}</p>
                <p className="text-[13px] font-mono text-[#55666E]">{v == null ? '—' : v}/3</p>
              </div>
              <p className="text-[13px] text-[#55666E] mt-0.5">{d.what}</p>
              <div className="mt-2.5 grid gap-1.5">
                {d.levels.map((txt, n) => {
                  const on = v === n;
                  return (
                    <button key={n} type="button" aria-pressed={on} onClick={() => setScores((s) => ({ ...s, [d.key]: n }))}
                      className="w-full text-left rounded-[5px] px-3 py-2 flex items-start gap-2.5 border transition-colors"
                      style={on ? { background: '#061C2B', borderColor: '#061C2B', color: '#F7F9FA' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
                      <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[12px] font-black" style={on ? { background: '#00D2FF', color: '#061C2B' } : { background: '#E9E2D2', color: '#10263B' }}>{n}</span>
                      <span className="text-[13px] leading-snug">{txt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg p-4" style={{ background: '#061C2B' }}>
        <p className="text-[11px] font-mono uppercase tracking-[0.16em]" style={{ color: '#00D2FF' }}>Total</p>
        <p className="text-[28px] font-black leading-none mt-1" style={{ color: '#F7F9FA', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>{total} <span className="text-[16px] font-bold" style={{ color: 'rgba(247,249,250,.6)' }}>/ {COACH_EVAL_MAX}</span></p>
        <p className="text-[12px] mt-1.5" style={{ color: 'rgba(247,249,250,.75)' }}>{complete ? (total >= 13 ? 'Ready to lead this level and be considered for the next one.' : total >= 9 ? 'Solid. One or two dimensions to work before the next level.' : 'Not ready yet: train the dimensions at 0–1 before the next camp.') : 'Mark all five to see the reading.'}</p>
      </div>

      <div className="bg-[#F7F9FA] rounded-lg border border-[#DCD7C6] p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#55666E] mb-1">Strengths</label>
          <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2} placeholder="What this coach does particularly well…"
            className="w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#55666E] mb-1">To work before the next camp</label>
          <textarea value={areas} onChange={(e) => setAreas(e.target.value)} rows={2} placeholder="The one or two things to train, in the method's words…"
            className="w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-navy)] mb-1 inline-flex items-center gap-1">
            <Lock size={12} strokeWidth={1.75} /> Director notes <span className="text-[#55666E] font-normal">(internal only)</span>
          </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Private assessment — not shared with the coach…"
            className="w-full px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#55666E] mb-1">Level this coach is ready to teach up to</label>
          <select value={recommendedBelt} onChange={(e) => setRecommendedBelt(e.target.value)} className="w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm bg-white">
            {COACH_EVAL_BELTS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <p className="text-[11px] text-[#55666E] mt-1">Recommendation only. The clearance itself is set in the coach profile (Edit → Level clearance).{currentMaxBelt ? ` Today: ${COACH_EVAL_BELTS.find((b) => b.value === currentMaxBelt)?.label ?? currentMaxBelt}.` : ''}</p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={promote} onChange={(e) => setPromote(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm font-medium text-[var(--tss-navy)] inline-flex items-center gap-1.5">
            <Star size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" /> Recommend for certification upgrade
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={handleSubmit} disabled={loading || !complete}
        className="w-full py-3 bg-[var(--tss-navy)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
        {loading ? 'Saving…' : 'Save evaluation'}
      </button>
    </div>
  );
}
