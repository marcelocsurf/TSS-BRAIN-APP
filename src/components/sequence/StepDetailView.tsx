'use client';

import { useState, useEffect } from 'react';
import { getStepDetail, updateStepRating } from '@/lib/actions/sequence';
import { StarRating } from './StarRating';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { Dumbbell, Waves, Target, BookOpen, Check, PenLine, CircleDot, X } from 'lucide-react';
import { displayDate } from '@/lib/utils/tz';
import { COMPLETION_LABEL_EN } from '@/lib/utils/criteria';
import { starsFromCriteria } from '@/lib/stars';


// Brand Manual v10
const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };
type AssessResult = 'met' | 'partial' | 'not_met';
const ASSESS_OPTS: { key: AssessResult; label: string; bg: string; fg: string }[] = [
  { key: 'met', label: 'I have it', bg: GREEN, fg: INK },
  { key: 'partial', label: 'Halfway', bg: GOLD, fg: '#5b4300' },
  { key: 'not_met', label: 'Not yet', bg: '#FF6B6B', fg: '#fff' },
];


interface Props {
  stepId: string;
  portalToken: string;
  onBack: () => void;
  onRatingChange?: () => void;
  onPracticeDrill?: (drillMissionId: string) => void;
}

export function StepDetailView({ stepId, portalToken, onBack, onRatingChange, onPracticeDrill }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingRating, setSavingRating] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStepDetail(portalToken, stepId).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [stepId, portalToken]);

  // Autoevaluación por indicadores (Marcelo 2026-09-10): sin ola. Ubica,
  // no hace propia la secuencia — eso es del agua o del coach.
  const [assess, setAssess] = useState<Record<number, AssessResult>>({});
  const [assessMsg, setAssessMsg] = useState<string | null>(null);
  const handleRate = async (rating: number) => {
    setSavingRating(true);
    await updateStepRating(portalToken, stepId, rating);
    const fresh = await getStepDetail(portalToken, stepId);
    setData(fresh);
    setSavingRating(false);
    onRatingChange?.();
  };
  const handleAssess = async () => {
    const list = Object.entries(assess).map(([i, r]) => ({ criterion_index: Number(i), result: r }));
    if (!list.length) return;
    setSavingRating(true); setAssessMsg(null);
    const res = await updateStepRating(portalToken, stepId, starsFromCriteria(list.map((l) => l.result)), list);
    if (!res.ok) { setAssessMsg(res.error ?? 'Could not save.'); setSavingRating(false); return; }
    const fresh = await getStepDetail(portalToken, stepId);
    setData(fresh);
    setAssess({});
    setSavingRating(false);
    onRatingChange?.();
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Target size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan)]" />
        <p className="text-gray-500 text-sm">Loading step...</p>
      </div>
    );
  }

  if (!data || !data.lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Step not found</p>
        <button onClick={onBack} className="mt-4 text-sm underline">← Back</button>
      </div>
    );
  }

  const { lesson, drill, mission, rating, ratingCount, lastRated, sessionHistory, coachRating, selfSource, assessedCriteria, coachCriteria } = data;
  const coachMark: Record<number, { result: AssessResult; at: string }> = coachCriteria ?? {};
  const markWord = (r: AssessResult) => (r === 'met' ? 'yes' : r === 'partial' ? 'halfway' : 'not yet');
  const criteria: string[] = mission?.success_criteria ?? [];
  const assessedMap: Record<number, AssessResult> = Object.fromEntries(((assessedCriteria ?? []) as { criterion_index: number; result: AssessResult }[]).map((c) => [c.criterion_index, c.result]));
  const preview = Object.keys(assess).length ? starsFromCriteria(Object.values(assess)) : null;
  const anyNotYet = Object.values(assess).some((r) => r !== 'met') || Object.values(assessedMap).some((r) => r !== 'met');

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-3"
        >
          ← Back to My Sequence
        </button>

        <div className="text-white rounded-2xl p-5" style={{ background: INK, borderLeft: `4px solid ${CYAN}` }}>
          <div className="text-[12px]" style={{ ...F_M, color: CYAN }}>{stepId}</div>
          <h1 className="text-[20px] mt-1.5" style={F_D}>{lesson.title}</h1>
          {lesson.subtitle && (
            <p className="text-sm mt-1.5" style={{ color: 'rgba(247,249,250,.7)' }}>{lesson.subtitle}</p>
          )}
          {lesson.pillar && (
            <p className="text-[12px] mt-2.5" style={{ ...F_M, color: GOLD }}>Pillar · {lesson.pillar}</p>
          )}
        </div>
      </div>

      {/* Self-assessment · sin ola (Marcelo 2026-09-10) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-1.5 text-[12px] mb-2" style={{ ...F_M, color: '#0090B0' }}>
          <Target size={12} strokeWidth={1.75} />
          Where you are on this step
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            {coachRating != null ? (
              <p className="text-[15px]" style={{ ...F_D, color: INK }}>{coachRating}★ <span className="text-[12px] font-normal normal-case tracking-normal text-gray-500">rated by your coach</span></p>
            ) : rating != null ? (
              <p className="text-[15px]" style={{ ...F_D, color: INK }}>{rating}★ <span className="text-[12px] font-normal normal-case tracking-normal text-gray-500">{selfSource === 'assessed' ? 'self-assessed · not surfed yet' : 'from your last session'}</span></p>
            ) : (
              <p className="text-[13px] text-gray-500">Not rated yet</p>
            )}
            {lastRated && <p className="text-[12px] text-gray-400 mt-1">Updated {ratingCount} {ratingCount === 1 ? 'time' : 'times'} · Last: {displayDate(lastRated)}</p>}
          </div>
          <StarRating value={coachRating ?? rating} size="sm" readOnly variant={coachRating != null ? 'official' : undefined} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-[15px]" style={{ ...F_D, color: INK }}>Assess yourself · no wave needed</h3>
          <p className="text-[12px] text-gray-500 mt-1 leading-snug">Read the indicators and be honest. All of them → 4★ · one halfway → 3★ · one not yet → 2★. It maps where you are; you own it in the water, or your coach confirms it.</p>
          {criteria.length > 0 ? (
            <div className="space-y-2 mt-3">
              {criteria.map((text: string, i: number) => {
                const cur = assess[i] ?? assessedMap[i];
                return (
                  <div key={i} className="border border-gray-200 rounded-xl p-2.5">
                    <p className="text-[12px] text-gray-800 mb-1.5 leading-snug"><span className="font-bold mr-1">{i + 1}.</span>{text}</p>
                    {(assessedMap[i] || coachMark[i]) && (
                      <p className="text-[11px] mb-1.5" style={{ color: '#0A5C70' }}>
                        {assessedMap[i] ? `You: ${markWord(assessedMap[i])}` : ''}{assessedMap[i] && coachMark[i] ? ' · ' : ''}{coachMark[i] ? `Your coach: ${markWord(coachMark[i].result)}` : ''}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-1">
                      {ASSESS_OPTS.map((o) => {
                        const sel = cur === o.key;
                        return (
                          <button key={o.key} type="button" aria-pressed={sel} onClick={() => setAssess((p) => ({ ...p, [i]: o.key }))}
                            className="py-1.5 rounded-lg text-[12px] font-bold"
                            style={sel ? { background: o.bg, color: o.fg } : { background: '#f3f4f6', color: '#6b7280' }}>{o.label}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <button type="button" disabled={!Object.keys(assess).length || savingRating} onClick={handleAssess}
                className="w-full h-11 rounded-xl text-[12.5px] font-bold disabled:opacity-40 active:scale-[0.99]"
                style={{ background: INK, color: PAPER }}>
                {savingRating ? 'Saving…' : preview ? `Save my self-assessment · ${preview}★` : 'Mark the indicators to save'}
              </button>
              {assessMsg && <p className="text-[12px] text-red-600">{assessMsg}</p>}
            </div>
          ) : (
            <div className="mt-3">
              <StarRating value={rating} onChange={handleRate} size="lg" showLabel readOnly={savingRating} />
              <p className="text-[12px] text-gray-400 mt-1">This step has no indicator card yet — rate honestly.</p>
            </div>
          )}
          {anyNotYet && (
            <p className="mt-3 text-[12.5px] leading-snug rounded-lg px-3 py-2" style={{ background: 'rgba(0,210,255,.08)', color: '#0A5C70' }}>
              The small details that turn a halfway into a yes are what a certified coach sees in one session with you.
            </p>
          )}
        </div>
      </div>

      {/* Pedagogy doctrine note (when both drill + mission available) */}
      {drill && mission && (
        <div className="rounded-2xl p-3.5 text-[12.5px] leading-relaxed" style={{ background: '#0A2438', border: '1px solid rgba(0,210,255,.35)', color: 'rgba(247,249,250,.85)' }}>
          <strong>THINK</strong> — the lesson: understand what the movement does and how it works.
          <br />
          <strong>FEEL</strong> — the drill: visualize it and simulate it in a controlled setting (sand, calm water, pool, skateboard).
          <br />
          <strong>DO</strong> — the mission: execute it in real conditions, in real time.
          <br />
          Choose the practice that fits today&apos;s session.
        </div>
      )}

      {/* DRILL card */}
      {drill && (
        <DrillOrMissionCard
          item={drill}
          onPractice={onPracticeDrill}
        />
      )}

      {/* MISSION card */}
      {mission && (
        <DrillOrMissionCard
          item={mission}
          onPractice={onPracticeDrill}
        />
      )}

      {/* Session history */}
      {sessionHistory && sessionHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-1.5 text-[12px] mb-2" style={{ ...F_M, color: '#0090B0' }}>
            <Waves size={12} strokeWidth={1.75} />
            Recent practice sessions
          </div>
          <div className="space-y-2">
            {sessionHistory.map((s: any) => (
              <div key={s.id} className="pl-3 py-1" style={{ borderLeft: `3px solid ${CYAN}66` }}>
                <div className="text-xs text-gray-500">
                  {displayDate(s.created_at)}
                </div>
                <div className="text-sm">
                  {s.duration_minutes ? `${s.duration_minutes} min` : 'Duration not set'}
                  {s.execution_rating && ` · Rated ${s.execution_rating}/5`}
                  {s.mission_completion && ` · ${COMPLETION_LABEL_EN[s.mission_completion] ?? s.mission_completion}`}
                  {s.automaticity && ` · ${({ yes: 'Ready for the water', almost: 'Almost ready', not_yet: 'Stayed in the drill' } as Record<string, string>)[s.automaticity] ?? s.automaticity}`}
                  {s.from_run && ` · marked in ${s.from_run}`}
                </div>
                {Array.isArray(s.criteria_evaluation) && s.criteria_evaluation.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {[...s.criteria_evaluation].sort((a: any, b: any) => a.criterion_index - b.criterion_index).map((c: any) => {
                      const Icon = c.result === 'met' ? Check : c.result === 'partial' ? CircleDot : X;
                      const color = c.result === 'met' ? '#0f7b4f' : c.result === 'partial' ? '#7a5c00' : '#B4232C';
                      return (
                        <div key={c.criterion_index} className="flex items-start gap-1.5 text-[12px] leading-snug text-gray-600">
                          <Icon size={11} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color }} aria-label={c.result === 'met' ? 'Met' : c.result === 'partial' ? 'Partial' : 'Not met'} />
                          <span>{c.criterion_text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theory link */}
      <div className="rounded-2xl p-4 text-center" style={{ background: INK }}>
        <div className="inline-flex items-center gap-1.5 text-[12px]" style={{ ...F_M, color: CYAN }}>
          <BookOpen size={12} strokeWidth={1.75} />
          Review the theory
        </div>
        <div className="text-[12px] mt-1" style={{ color: 'rgba(247,249,250,.65)' }}>
          Course tab → {stepId} in your belt section
        </div>
      </div>
    </div>
  );
}

// ─── DrillOrMissionCard — renders a single drill OR mission with Practice button ───

function DrillOrMissionCard({
  item,
  onPractice,
}: {
  item: any;
  onPractice?: (drillMissionId: string) => void;
}) {
  const isDrill = item.type === 'drill';
  const TypeIcon = isDrill ? Dumbbell : Waves;
  const typeLabel = isDrill ? 'FEEL — visualize and simulate it, in a controlled setting' : 'DO — execute it in real conditions, in real time';
  const accentHex = isDrill ? GOLD : CYAN;
  const accentText = isDrill ? '#7a5c00' : '#0090B0';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: `2px solid ${accentHex}55` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[12px]" style={{ ...F_M, color: accentText }}>
            <TypeIcon size={12} strokeWidth={1.75} />
            {isDrill ? 'FEEL · Drill' : 'DO · Mission'}
          </div>
          <h3 className="text-[16px] mt-1" style={{ ...F_D, color: INK }}>{item.title}</h3>
          <div className="text-xs text-gray-500 mt-1">{typeLabel}</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl p-2.5 text-center" style={{ background: PAPER }}>
          <div className="text-[12px] text-gray-400" style={F_M}>Time</div>
          <div className="text-sm font-bold mt-0.5" style={{ color: INK }}>{item.time_estimate || '—'}</div>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: PAPER }}>
          <div className="text-[12px] text-gray-400" style={F_M}>Reps</div>
          <div className="text-sm font-bold mt-0.5" style={{ color: INK }}>{item.reps_recommended || '—'}</div>
        </div>
      </div>

      {/* 5 Key Words — only on drill (canonical chain) */}
      {isDrill && item.key_words && item.key_words.length > 0 && (
        <div className="mb-4">
          <div className="text-[12px] text-gray-400 mb-2" style={F_M}>
            5 key words · canonical chain
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.key_words.map((kw: string, i: number) => (
              <span
                key={i}
                className="px-2.5 py-1 text-[12px] font-bold rounded-full" style={{ background: INK, color: CYAN }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description / Procedure */}
      {item.description_md && (
        <div className="mt-4">
          <div className="text-[12px] text-gray-400 mb-2" style={F_M}>
            {isDrill ? 'Procedure' : 'What to do in the water'}
          </div>
          <div className="prose prose-sm max-w-none">
            <MarkdownContent markdown={item.description_md} />
          </div>
        </div>
      )}

      {/* Success criteria */}
      {item.success_criteria && item.success_criteria.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl" style={{ background: 'rgba(6,214,160,.08)', border: '1px solid rgba(6,214,160,.35)' }}>
          <div className="flex items-center gap-1.5 text-[12px] mb-2" style={{ ...F_M, color: '#0a7c5d' }}>
            <Check size={12} strokeWidth={2} />
            Success criteria
          </div>
          <ul className="space-y-1">
            {item.success_criteria.map((sc: string, i: number) => (
              <li key={i} className="text-xs flex gap-2" style={{ color: '#085041' }}>
                <span className="font-bold">{i + 1}.</span>
                <span>{sc}</span>
              </li>
            ))}
          </ul>
          {/* Una sola vez, fija, y solo en la misión: la confirmación del coach
              no es un criterio, y el drill no lo confirma nadie en el app. */}
          {!isDrill && (
            <p className="mt-2 text-[12px]" style={{ color: '#0a7c5d', opacity: .8 }}>
              Your coach confirms it when you train together.
            </p>
          )}
        </div>
      )}

      {/* Los drills son ensayo (doctrina 2026-09-10): se hacen, no se
          registran. Solo la misión — la ejecución en el agua — se anota. */}
      {isDrill ? (
        <p className="mt-4 text-[12px] text-gray-500 leading-snug">Rehearsal: do it on land or on the skate as many times as you need. No need to log it — what you log is the mission, in the water.</p>
      ) : (
        <button
          onClick={() => onPractice?.(item.id)}
          disabled={!onPractice}
          className="mt-5 w-full rounded-full py-3.5 text-[12px] transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ ...F_M, background: onPractice ? accentHex : '#e5e7eb', color: INK, fontWeight: 700 }}
        >
          <span className="inline-flex items-center gap-1.5">
            <PenLine size={14} strokeWidth={1.75} />
            Practice this mission →
          </span>
        </button>
      )}
    </div>
  );
}
