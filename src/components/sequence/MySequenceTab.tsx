'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMySequence, getThreeCirclesProgress, type SequenceData, type SequenceItem, type ThreeCirclesGameProgress } from '@/lib/actions/sequence';
import { StarRating } from './StarRating';
import { StepDetailView } from './StepDetailView';
import { Dumbbell, Waves, Target } from 'lucide-react';
import { BELT_THEMES, beltLevelFromString, type BeltTheme } from '@/lib/constants/belt-theme';
import { sequencePrefix } from '@/lib/constants/learning-blocks';
import { sequencePageFor } from '@/lib/sequence-pages';
import { SEQUENCE_ROLE, SIDE_SHORT, SIDE_WORD, type SequenceSide } from '@/lib/constants/learning-blocks';
import { sideBalance } from '@/lib/sequence-sides';
import { momentsByStep, type Moment } from '@/lib/sequence-pages/moments';
import { effectiveStars } from '@/lib/stars';
import { getTasks, closeTask, type StudentTask } from '@/lib/actions/lets-play';
import { MAX_OPEN_TASKS } from '@/lib/stars';
import { COMMAND_COLORS } from '@/components/portal/sequence-page/WaveBoard';

/** Los momentos de la línea que cubre una lección, con su punto de color.
 *  Es el lenguaje de la ejecución (posture · palm up · extend · elbow); la
 *  estrella sigue en la lección. */
export function MomentChips({ list, light = false }: { list: Moment[] | undefined; light?: boolean }) {
  if (!list || list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1">
      {list.map((m) => (
        <span key={m.key} className="inline-flex items-center gap-1 text-[12px] leading-tight" style={{ color: light ? 'rgba(247,249,250,.8)' : '#55666E' }} title={m.title}>
          <i className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.command ? COMMAND_COLORS[m.command] : '#55666E' }} />
          {m.short}
        </span>
      ))}
    </div>
  );
}

/** El chip de lado: FS · BS · FS·BS. Va al lado del nombre; el número no cambia. */
function SideChip({ side, small = false, dark = false }: { side: SequenceSide | null; small?: boolean; dark?: boolean }) {
  if (!side) return null;
  const txt = side === 'both' ? 'FS·BS' : SIDE_SHORT[side];
  return (
    <span
      className={`inline-flex items-center rounded ${small ? 'px-1 text-[12px]' : 'px-1.5 py-0.5 text-[12px]'} font-bold`}
      // Chip SÓLIDO (Marcelo 2026-09-16: "cyan sobre celeste se pierde"): sobre
      // claro ink+cyan, sobre oscuro cyan+ink — contraste alto en los dos casos.
      style={{ ...F_M, letterSpacing: '0.08em', background: dark ? '#00D2FF' : '#061C2B', color: dark ? '#061C2B' : '#00D2FF' }}
      title={side === 'both' ? 'Frontside and backside' : SIDE_WORD[side]}
    >
      {txt}
    </span>
  );
}

// Brand Manual v10
const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };

export type TrainSequenceArgs = {
  sequenceId: string;
  mode: 'sequence_run' | 'step_focus';
  focusStepId?: string | null;
  /** La palabra de la sesión (viene del foco elegido en la página de la secuencia). */
  intention?: string | null;
  /** El momento de la línea elegido como foco. */
  focusMoment?: string | null;
  /** Cerrar un plan guardado antes del agua (sesión abierta). */
  sessionId?: string | null;
};

interface Props {
  portalToken: string;
  belt?: string;
  onPracticeDrill?: (drillMissionId: string) => void;
  /** Let's Play por secuencia (Marcelo 2026-09-04): correrla completa o
   *  trabajar un paso como foco. Sin esto, solo se abre el detalle del paso. */
  onTrainSequence?: (args: TrainSequenceArgs) => void;
  initialStepId?: string | null;
  /** Cintas cuyo curso tiene el alumno: los links a la página de la secuencia
   *  solo salen para quien lo tiene (el curso es aprender, la membresía es entrenar). */
  ownedBelts?: string[];
}

export function MySequenceTab({ portalToken, belt = 'white', onPracticeDrill, onTrainSequence, initialStepId, ownedBelts = [] }: Props) {
  const router = useRouter();
  const [data, setData] = useState<SequenceData | null>(null);
  const [loading, setLoading] = useState(true);
  // Tus tareas (paso + detalle, máximo tres). Marcelo 2026-09-10.
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  useEffect(() => { let m = true; getTasks(portalToken).then((t) => { if (m) setTasks(t); }).catch(() => {}); return () => { m = false; }; }, [portalToken]);
  // The Three Circles (Marcelo 2026-09-17): los 6 juegos son el primer
  // requisito en la ola para Yellow y Blue. Se juegan desde acá y se registran.
  const [circles, setCircles] = useState<ThreeCirclesGameProgress[]>([]);
  useEffect(() => { let m = true; getThreeCirclesProgress(portalToken).then((c) => { if (m) setCircles(c); }).catch(() => {}); return () => { m = false; }; }, [portalToken]);
  const [openStepId, setOpenStepId] = useState<string | null>(initialStepId || null);
  // Por secuencia es la entrada natural: es como se enseña en el curso.
  const [view, setView] = useState<'sequence' | 'all'>('sequence');
  // La que se abre sola: la primera que todavía tiene pasos sin evaluar. Es
  // "en qué estoy trabajando" sin preguntárselo.
  // La misma regla que "The path" del Home (getNextMove): la primera secuencia
  // NUMERADA de tu cinta que no es tuya; las de entrada/foundation/closing no
  // frenan el camino (auditoría 2026-09-15: antes se abría "Getting to the
  // wave" mientras el Home decía "#8").
  const focusSequenceId = (() => {
    if (!data) return null;
    const bk = data.belt.replace(/_belt$/, '');
    const mine = data.sequences.filter((s) => s.belt === bk);
    const pool = mine.length ? mine : data.sequences;
    const isAside = (s: (typeof pool)[number]) => !!SEQUENCE_ROLE[s.id];
    return pool.find((s) => s.state !== 'owned' && !isAside(s))?.id ?? pool.find((s) => s.state !== 'owned')?.id ?? pool[0]?.id ?? null;
  })();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMySequence(portalToken, belt).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [portalToken, belt]);

  const refresh = async () => {
    const res = await getMySequence(portalToken, belt);
    setData(res);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Target size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan)]" />
        <p className="text-[#55666E] text-sm">Loading your sequence...</p>
      </div>
    );
  }

  if (!data) return null;

  // If a step is open, show detail
  if (openStepId) {
    return (
      <StepDetailView
        stepId={openStepId}
        portalToken={portalToken}
        onBack={() => {
          setOpenStepId(null);
          refresh();
        }}
        onRatingChange={refresh}
        // "Practice this mission" entra por el MISMO flujo que la secuencia
        // (plan guardado, lado, sesión abierta en Home), con este paso como
        // foco. Auditoría 2026-09-15: antes abría un flujo paralelo con otras
        // reglas. Si el paso no pertenece a ninguna secuencia (deep link viejo),
        // cae al flujo ligado de siempre.
        onPracticeDrill={(drillMissionId) => {
          const seq = data.sequences.find((sq) => sq.items.some((i) => i.step_id === openStepId));
          if (seq && onTrainSequence) { setOpenStepId(null); onTrainSequence({ sequenceId: seq.id, mode: 'step_focus', focusStepId: openStepId }); }
          else onPracticeDrill?.(drillMissionId);
        }}
      />
    );
  }

  const theme = BELT_THEMES[beltLevelFromString(data.belt)];

  // ── El mapa (Marcelo 2026-09-09): "que las personas puedan ubicarse bien
  // dónde están, qué necesitan y claridad de cómo entrenarlo". Primero TU
  // cinta: sus secuencias en el orden del curso, cuántas son tuyas, y la
  // próxima a trabajar con su paso. Las cintas anteriores van plegadas abajo.
  const beltKey = data.belt.replace(/_belt$/, '');
  const isMethodSeq = (id: string) => { const r = SEQUENCE_ROLE[id]; return r !== 'closing' && r !== 'foundation'; };
  const mine = data.sequences.filter((sq) => sq.belt === beltKey);
  const earlier = data.sequences.filter((sq) => sq.belt !== beltKey);
  const levelSeqs = mine.filter((sq) => isMethodSeq(sq.id));
  const owned = levelSeqs.filter((sq) => sq.state === 'owned').length;
  const next = levelSeqs.find((sq) => sq.state !== 'owned') ?? null;
  // El paso: el que frenó tu último run · si no, el primero bajo 4★ · si no,
  // el primero que todavía no calificaste · si no, el primero de la cadena.
  const beltWord = beltKey.charAt(0).toUpperCase() + beltKey.slice(1);
  const pageHrefOf = (id: string) => { const c = sequencePageFor(id); return c && ownedBelts.includes(c.belt) ? `/portal/${portalToken}/seq/${id}` : null; };
  // Progreso por lado (Marcelo 2026-09-10): general · frontside · backside.
  // La misma función que usa el Home, así los dos dicen lo mismo.
  const sides = sideBalance(levelSeqs);
  const starsOf = (v: number | null) => (v == null ? '—' : `${v}★`);
  const headlineOf = (id: string, fallback: string | null) => sequencePageFor(id)?.think.whatIs.headline ?? fallback;

  return (
    <div className="space-y-5">
      {/* Header — el MISMO lenguaje que Course (Marcelo 2026-09-11): eyebrow
          Plex, lockup oficial, barra con brillo cyan y el número grande. */}
      <div className="px-2 pt-2 pb-4 text-white" style={{ borderBottom: '1px solid rgba(247,249,250,.10)' }}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10.5px]" style={{ ...F_M, letterSpacing: '0.18em', color: CYAN }}>Let&apos;s Play · {beltWord} Belt</span>
        </div>
        <h1 className="mt-1 text-[26px]" style={{ ...F_D, fontWeight: 900, lineHeight: 1.06, color: PAPER }}>Let&apos;s Play</h1>
        {/* El % general (promedio de todos los pasos de todas las cintas) salió:
            contradecía "la secuencia vale lo que vale su paso más flojo"
            (auditoría 2026-09-15). Lo que cuenta está en "Your sequences". */}
        <div className="mt-3">
          <p className="text-[12px] text-white/80">
            {/* La validación OFICIAL del coach manda; el auto-rating complementa. */}
            {data.coachRatedSteps > 0 ? (
              <>
                <span style={{ color: '#00D2FF' }}>★ {data.coachRatedSteps} of {data.totalSteps} validated by your coach</span>
                {data.selfRatedSteps > 0 && <> · {data.selfRatedSteps} self-rated</>}
              </>
            ) : (
              <>{data.ratedSteps} of {data.totalSteps} steps self-rated</>
            )}
          </p>
        </div>
      </div>

      {/* HOW IT WORKS — arriba y en tres frases (auditoría 2026-09-15: llegaba
          después del mapa y con jerga). Misma regla de siempre, dicha simple. */}
      <div className="rounded-lg p-4" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
        <p className="text-[23px] mb-1.5" style={{ ...F_D, fontWeight: 900, color: '#10263B' }}>How it works</p>
        <ol className="m-0 pl-0 list-none space-y-1">
          {(onTrainSequence
            ? ['Pick a sequence and save your plan.', 'Go surf.', 'Come back and give it a star.']
            : ['Pick the sequence you are working on.', 'Tap a step and run its mission.', 'Rate yourself honestly.']
          ).map((t, i) => (
            <li key={t} className="flex items-baseline gap-2.5 text-[15px] font-semibold" style={{ color: '#10263B' }}>
              <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[12px] font-black" style={{ background: '#061C2B', color: '#00D2FF' }}>{i + 1}</span>{t}
            </li>
          ))}
        </ol>
        <p className="text-[13px] mt-2.5 leading-snug" style={{ color: '#10263B' }}>A sequence is yours when every step is at 4★. Drills are rehearsal: do them in the course, no need to log them. Your coach confirms in the water.</p>
      </div>

      {/* THE THREE CIRCLES · primer requisito en la ola (Yellow y Blue). Los
          juegos se juegan en el agua y se registran como una misión; no mueven
          la estrella de ningún paso: son la base sobre la que van las secuencias. */}
      {(beltKey === 'yellow' || beltKey === 'blue') && circles.length > 0 && (() => {
        const done = circles.filter((g) => (g.lastStars ?? 0) >= 4).length;
        const played = circles.filter((g) => g.plays > 0).length;
        return (
          <div className="rounded-lg p-4" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
            <p className="text-[12px]" style={{ ...F_M, letterSpacing: '0.08em', color: '#55666E' }}>The Three Circles · your first requirement on the wave</p>
            <p className="text-[23px] mt-1" style={{ ...F_D, fontWeight: 900, color: '#10263B' }}>{done === circles.length ? 'All six games at 4★' : played === 0 ? 'Six games · start here' : `${done} of ${circles.length} games at 4★`}</p>
            <p className="text-[13px] mt-1 leading-snug" style={{ color: '#10263B' }}>Board · Body · Wave. Play each game in the water, then give it a star. Before any sequence, this is the base.</p>
            <div className="mt-3 space-y-1.5">
              {circles.map((g, i) => (
                <div key={g.id} className="flex items-center gap-2.5 rounded-[5px] px-3 py-2" style={{ background: PAPER, border: '1px solid #DCD7C6' }}>
                  <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[12px] font-black" style={{ background: (g.lastStars ?? 0) >= 4 ? '#00A8CC' : INK, color: '#F7F9FA' }}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold leading-tight truncate" style={{ color: '#10263B' }}>{g.title}</p>
                    <p className="text-[11px]" style={{ color: '#55666E' }}>{g.plays === 0 ? 'Not played yet' : `Last: ${g.lastStars ?? '—'}★ · played ${g.plays}×`}</p>
                  </div>
                  {onPracticeDrill && (
                    <button type="button" onClick={() => onPracticeDrill(g.id)} className="shrink-0 h-9 px-3 rounded-[5px] text-[12px] font-black uppercase" style={{ background: CYAN, color: INK, fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>
                      {g.plays === 0 ? 'Play it' : 'Play again'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <a href={`/portal/${portalToken}/circles`} className="inline-block mt-2.5 text-[13px] font-semibold underline underline-offset-2" style={{ color: '#10263B' }}>Read The Three Circles</a>
          </div>
        );
      })()}

      {/* Dónde estás · qué necesitás · cómo entrenarlo */}
      {levelSeqs.length > 0 && (
        <div className="rounded-lg p-4" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
          <p className="text-[12px]" style={{ ...F_M, letterSpacing: '0.08em', color: '#55666E' }}>Your sequences · {beltWord} Belt</p>
          {levelSeqs.every((sq) => sq.state === 'unrated') ? (
            <>
              {/* Primer uso (auditoría 2026-09-10): "0 of 9" se lee como fracaso. */}
              <p className="text-[23px] mt-1" style={{ ...F_D, fontWeight: 900, color: '#10263B' }}>Nothing rated yet — start here</p>
              {onTrainSequence && levelSeqs[0] && (
                <button type="button" onClick={() => onTrainSequence({ sequenceId: levelSeqs[0].id, mode: 'sequence_run' })}
                  className="mt-2.5 h-12 w-full rounded-[5px] text-[15px] font-black uppercase" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', letterSpacing: '0.035em', background: CYAN, color: INK }}>
                  Run {sequencePrefix(levelSeqs[0].id, levelSeqs[0].order)?.startsWith('#') ? sequencePrefix(levelSeqs[0].id, levelSeqs[0].order) : levelSeqs[0].name} →
                </button>
              )}
            </>
          ) : (
            <p className="text-[23px] mt-1" style={{ ...F_D, fontWeight: 900, color: '#10263B' }}>{owned} of {levelSeqs.length} sequences are yours</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {levelSeqs.map((sq) => {
              const st = sq.state === 'owned' ? '#0A7C5D' : sq.state === 'unrated' ? '#55666E' : '#FFD166';
              const pre = sequencePrefix(sq.id, sq.order);
              return (
                <a key={sq.id} href={pageHrefOf(sq.id) ?? undefined} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: '#F7F9FA', border: '1px solid #DCD7C6', color: '#10263B' }}>
                  <i className="inline-block w-2 h-2 rounded-full" style={{ background: st }} />
                  {pre?.startsWith('#') ? `${pre} ` : ''}{sq.name}
                  <SideChip side={sq.side} small dark />
                  {sq.state === 'owned' ? ' ✓' : sq.side === 'both' && sq.sideRatings ? ` ${starsOf(sq.sideRatings.fs)} · ${starsOf(sq.sideRatings.bs)}` : sq.minRating !== null ? ` ${sq.minRating}★` : ''}
                </a>
              );
            })}
          </div>
          {/* Por lado: una línea es tuya cuando es tuya de los dos lados. */}
          {(sides.fs != null || sides.bs != null) && (
            <div className="mt-3 pt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1" style={{ borderTop: '1px solid rgba(6,28,43,.12)' }}>
              {/* Las notas por lado viven en "Both sides" (auditoría 2026-09-15: salían tres veces). Acá solo el consejo. */}
              {sides.advice ? <span className="basis-full text-[13px] leading-snug font-semibold" style={{ color: '#10263B' }}>{sides.advice.text}</span> : <span className="text-[12px]" style={{ color: '#55666E' }}>Frontside and backside, side by side, below in Both sides.</span>}
            </div>
          )}
          {/* El próximo paso vive en UNA sola tarjeta: "Your next moves" arriba
              (coach · método · reciente). Acá solo el mapa. */}
          {!next && <p className="text-[12px] mt-2" style={{ color: '#55666E' }}>Every sequence of this belt is yours. Keep them alive — and ask your coach about the next belt.</p>}
        </div>
      )}

      {/* MY LIST (Marcelo 2026-09-10): las tareas que el alumno se dejó a sí
          mismo — paso + detalle, máximo tres. Se ofrecen, no se imponen. */}
      {tasks.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6', borderTop: '4px solid #FFD166' }}>
          <div className="px-4 pt-3.5 pb-2 flex items-baseline justify-between gap-3">
            <p className="text-[23px]" style={{ ...F_D, fontWeight: 900, color: '#10263B' }}>My list · {tasks.length} of {MAX_OPEN_TASKS}</p>
            <p className="text-[12px] shrink-0" style={{ color: '#55666E' }}>closes itself at 4★ in the water</p>
          </div>
          <div className="px-3 pb-3 space-y-1.5">
            {tasks.map((t) => (
              <div key={t.id} className="rounded-[5px] px-3 py-2.5 flex items-center gap-3" style={{ background: '#F7F9FA', border: '1px solid #DCD7C6' }}>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold leading-snug" style={{ color: '#10263B' }}>{t.stepTitle}{t.detail ? <span className="font-normal" style={{ color: '#10263B' }}> · {t.detail}</span> : null}</p>
                  <p className="text-[12px]" style={{ color: '#55666E' }}>{t.sequenceLabel}</p>
                </div>
                {onTrainSequence && (
                  <button type="button" onClick={() => onTrainSequence({ sequenceId: t.sequenceId, mode: 'step_focus', focusStepId: t.stepId, focusMoment: t.detail, intention: t.detail })}
                    className="shrink-0 h-11 px-3.5 rounded-[5px] text-[13px] font-black uppercase" style={{ background: CYAN, color: INK, letterSpacing: '0.03em' }}>Train it</button>
                )}
                <button type="button" aria-label="Mark done" onClick={async () => { await closeTask(portalToken, t.id, 'marked_done'); setTasks((p) => p.filter((x) => x.id !== t.id)); router.refresh(); }}
                  className="shrink-0 h-11 px-2.5 rounded-[5px] text-[12px] font-semibold" style={{ color: '#10263B', border: '1px solid #DCD7C6', background: '#F7F9FA' }}>Done</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTH SIDES (Marcelo 2026-09-10): la misma línea, de los dos lados.
          Empareja #8↔#9, #10↔#11, #12↔#13 y muestra las de dos lados (#7) con
          sus dos notas. No reemplaza la lista numerada: la resume. */}
      {sides.pairs.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-[23px]" style={{ ...F_D, fontWeight: 900, color: '#10263B' }}>Both sides</p>
            <p className="text-[13px] mt-0.5" style={{ color: '#10263B' }}>Each sequence is one side: frontside or backside. Here the same move sits side by side — a move is complete when both sequences are yours.</p>
          </div>
          <div className="px-3 pb-3 space-y-1.5">
            {sides.pairs.map((p) => {
              const cell = (sd: 'fs' | 'bs', c: { id: string; label: string; value: number | null } | null) => {
                if (!c) return <span className="text-[12px]" style={{ color: '#55666E' }}>—</span>;
                const weak = p.gap != null && p.gap >= 1 && (c.value ?? 0) < ((sd === 'fs' ? p.bs?.value : p.fs?.value) ?? 0);
                const inner = (
                  <>
                    <span className="block text-[12px]" style={{ ...F_M, letterSpacing: '0.08em', color: weak ? '#10263B' : '#55666E' }}>{SIDE_SHORT[sd]}{p.both ? '' : ` · ${c.label.split(' ')[0]}`}</span>
                    <span className="block text-[16px] font-bold" style={{ color: c.value == null ? '#55666E' : weak ? '#10263B' : '#10263B' }}>{c.value == null ? 'not yet' : `${c.value}★`}</span>
                  </>
                );
                const href = pageHrefOf(c.id);
                return href ? <a href={href} className="block">{inner}</a> : <span className="block">{inner}</span>;
              };
              return (
                <div key={p.move} className="grid items-center rounded-[5px] px-3 py-2" style={{ gridTemplateColumns: '1.2fr 1fr 1fr auto', background: '#F7F9FA', border: '1px solid #DCD7C6' }}>
                  <span className="text-[14px] font-bold" style={{ color: '#10263B' }}>{p.move}{p.both && <span className="block text-[12px] font-normal" style={{ color: '#55666E' }}>one sequence · both sides</span>}</span>
                  {cell('fs', p.fs)}
                  {cell('bs', p.bs)}
                  <span className="text-[12px] text-right" style={{ color: p.gap != null && p.gap >= 1 ? '#10263B' : '#55666E' }}>{p.gap == null ? '' : `gap ${p.gap}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primero la SECUENCIA, después la habilidad suelta.
          Un alumno de Blue tiene 48 pasos: elegir entre 48 no es libertad, es
          parálisis. Y practicar el paso suelto no enseña la secuencia — el
          drill sirve cuando llega en su contexto, viendo qué va antes y qué
          va después. La lista completa sigue disponible para buscar algo
          puntual. */}
      {data.sequences.length > 0 && (
        <div className="flex gap-1 p-1 rounded-full" style={{ background: '#0A2532', border: '1px solid rgba(0,210,255,.35)' }}>
          {(['sequence', 'all'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="flex-1 h-11 rounded-full text-[12px] font-bold transition"
              style={
                view === v
                  ? { background: theme.bright, color: '#061C2B' }
                  : { color: 'rgba(247,249,250,.78)' }
              }
            >
              {v === 'sequence' ? 'By sequence' : 'All my skills'}
            </button>
          ))}
        </div>
      )}

      {view === 'sequence' && data.sequences.length > 0 && (
        <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-start">
          {(mine.length ? mine : data.sequences).map((seq) => (
            <BlockSection
              key={seq.id}
              belt={seq.belt}
              blockId={seq.id}
              blockNumber={seq.order}
              blockName={seq.name}
              promise={headlineOf(seq.id, seq.promise)}
              asSequence
              state={seq.state}
              minRating={seq.minRating}
              weakestStepId={seq.weakestStepId}
              weakestTitle={seq.weakestTitle}
              weakestIsOfficial={seq.weakestIsOfficial}
              selfSequenceRating={seq.selfSequenceRating}
              heldBackStepId={seq.heldBackStepId}
              heldBackTitle={seq.heldBackTitle}
              side={seq.side}
              sideRatings={seq.sideRatings}
              defaultOpen={seq.id === focusSequenceId}
              items={seq.items}
              onOpenStep={(id) => setOpenStepId(id)}
              onTrain={onTrainSequence}
              theme={theme}
              pageHref={pageHrefOf(seq.id)}
            />
          ))}
        </div>
      )}

      {/* Las cintas anteriores: siguen entrenables, pero no tapan tu nivel. */}
      {view === 'sequence' && mine.length > 0 && earlier.length > 0 && (
        <details className="rounded-lg overflow-hidden" style={{ background: '#0A2532', border: '1px solid rgba(0,210,255,.25)' }}>
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
            <span>
              <span className="block text-[12px]" style={{ ...F_M, color: 'rgba(247,249,250,.78)' }}>Your foundations · earlier belts</span>
              <span className="block text-[13px] font-semibold" style={{ color: PAPER }}>{earlier.length} sequences from {Array.from(new Set(earlier.map((sq) => sq.belt))).map((b) => b.charAt(0).toUpperCase() + b.slice(1)).join(' & ')} — {earlier.filter((sq) => sq.state === 'owned').length} owned</span>
            </span>
            <span style={{ color: 'rgba(247,249,250,.78)' }}>▾</span>
          </summary>
          <div className="px-3 pb-3 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-start">
            {earlier.map((seq) => (
              <BlockSection
                key={seq.id}
                belt={seq.belt}
                blockId={seq.id}
                blockNumber={seq.order}
                blockName={seq.name}
                promise={headlineOf(seq.id, seq.promise)}
                asSequence
                state={seq.state}
                minRating={seq.minRating}
                weakestStepId={seq.weakestStepId}
                weakestTitle={seq.weakestTitle}
                weakestIsOfficial={seq.weakestIsOfficial}
                selfSequenceRating={seq.selfSequenceRating}
                heldBackStepId={seq.heldBackStepId}
                heldBackTitle={seq.heldBackTitle}
                side={seq.side}
                sideRatings={seq.sideRatings}
                defaultOpen={false}
                items={seq.items}
                onOpenStep={(id) => setOpenStepId(id)}
                onTrain={onTrainSequence}
                theme={BELT_THEMES[beltLevelFromString(seq.belt)]}
                pageHref={pageHrefOf(seq.id)}
              />
            ))}
          </div>
        </details>
      )}

      {/* Blocks — en tablet (md:) van en 2 columnas: la secuencia completa
          (25-48 pasos) entra de un vistazo en vez de scroll infinito. */}
      <div
        className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-start"
        hidden={view === 'sequence' && data.sequences.length > 0}
      >
      {data.blocks.map((block) => (
        <BlockSection
          key={`${block.belt}:${block.block_number}`}
          belt={block.belt}
          blockNumber={block.block_number}
          blockName={block.block_name}
          items={block.items}
          onOpenStep={(id) => setOpenStepId(id)}
          theme={theme}
        />
      ))}
      </div>
    </div>
  );
}

function BlockSection({
  belt: blockBelt,
  blockId = null,
  blockNumber,
  blockName,
  promise = null,
  asSequence = false,
  defaultOpen = true,
  state,
  minRating = null,
  weakestStepId = null,
  weakestTitle = null,
  weakestIsOfficial = false,
  selfSequenceRating = null,
  heldBackStepId = null,
  heldBackTitle = null,
  side = null,
  sideRatings = null,
  pageHref = null,
  items,
  onOpenStep,
  onTrain,
  theme,
}: {
  belt: string;
  /** Id de la secuencia — decide si lleva número o rótulo (Foundation/Closing). */
  blockId?: string | null;
  blockNumber: number;
  blockName: string;
  /** La habilidad que construye la secuencia. */
  promise?: string | null;
  /** true = se rotula como secuencia del método, no como bloque de drills. */
  asSequence?: boolean;
  /** En la vista por secuencia vienen plegadas: si no, son 65 pasos de scroll
   *  y no se gana nada. Se abre sola la primera que no está lograda. */
  defaultOpen?: boolean;
  state?: 'owned' | 'working' | 'partial' | 'unrated';
  minRating?: number | null;
  weakestStepId?: string | null;
  weakestTitle?: string | null;
  weakestIsOfficial?: boolean;
  /** La nota del alumno para la cadena y el paso que la detuvo (Let's Play). */
  selfSequenceRating?: number | null;
  heldBackStepId?: string | null;
  heldBackTitle?: string | null;
  /** El lado (fs · bs · both) y, en las de dos lados, la nota por lado. */
  side?: SequenceSide | null;
  sideRatings?: { fs: number | null; bs: number | null } | null;
  /** La página de la secuencia (Think · Feel · Do · Review), si existe. */
  pageHref?: string | null;
  items: SequenceItem[];
  onOpenStep: (id: string) => void;
  /** Entrenar la secuencia (solo en la vista por secuencia). */
  onTrain?: (args: TrainSequenceArgs) => void;
  theme: BeltTheme;
}) {
  // "Work on one step": la lista pasa a modo elegir. Tocar un paso arranca el
  // entreno con ese foco en vez de abrir su ficha.
  const [picking, setPicking] = useState(false);
  const canTrain = asSequence && !!blockId && !!onTrain;
  // La nota que cuenta es la EFECTIVA: la del coach si existe, si no la
  // auto-evaluación. Contando solo el auto-rating, un alumno con toda su
  // secuencia validada por el coach leía "0/6 rated".
  const effective = (i: SequenceItem) => effectiveStars(i);
  const ratedItems = items.filter((i) => effective(i) !== null);
  const ratedCount = ratedItems.length;
  const avgRating = ratedCount > 0
    ? ratedItems.reduce((sum, i) => sum + (effective(i) || 0), 0) / ratedCount
    : null;

  // "Blue Belt · Sequence #8", o "Blue Belt · Foundation" / "· Closing" para
  // las dos que no son escalones numerados del método.
  const beltWord = blockBelt.charAt(0).toUpperCase() + blockBelt.slice(1);
  const prefix = sequencePrefix(blockId, blockNumber);
  // Los momentos de la línea debajo de cada lección (de la página de la secuencia).
  const moments = asSequence && blockId ? momentsByStep(blockId, items.map((i) => ({ id: i.step_id, title: i.step_title }))) : {};

  return (
    <details
      open={defaultOpen}
      className="group rounded-lg overflow-hidden"
      style={{ background: '#F7F9FA', border: '1px solid rgba(0,210,255,.25)' }}
    >
      {/* Cabecera Ink con el número grande de la secuencia — el mismo lenguaje
          que Course (Marcelo 2026-09-11). El cuerpo sigue en Paper. */}
      <summary className="px-4 py-4 flex items-center justify-between gap-3 cursor-pointer list-none" style={{ background: '#0A2532' }}>
        {prefix?.startsWith('#') ? (
          <span className="shrink-0 w-12 leading-none" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: CYAN }}>{prefix.slice(1).padStart(2, '0')}</span>
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="text-[10px]" style={{ ...F_M, letterSpacing: '0.12em', color: 'rgba(247,249,250,.40)' }}>
            {/* Solo la cinta: el nombre de la etapa ("Getting to the wave") repetía
                lo que ya dice el título grande (Marcelo 2026-09-16). */}
            {asSequence ? `${beltWord} Belt` : `${beltWord} Belt · Block ${blockNumber}`}
          </div>
          <div className="text-[15.5px] font-semibold mt-0.5 flex items-center gap-1.5 leading-tight" style={{ color: PAPER }}>{blockName}<SideChip side={asSequence ? side : null} small dark /></div>
          {promise && (
            <div className="text-[12.5px] mt-1 leading-snug" style={{ color: 'rgba(247,249,250,.62)' }}>{promise}</div>
          )}
        </div>
        <div className="text-right shrink-0" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}>
          {/* La secuencia vale lo que vale su paso más flojo — no el promedio,
              que esconde el hueco. Es la regla del canon: 4★ en cada parte. */}
          {asSequence && state === 'owned' ? (
            <div className="text-[12px] font-semibold" style={{ color: CYAN }}>✓ Owned</div>
          ) : asSequence && minRating !== null ? (
            <>
              <div className="text-[15px] font-semibold" style={{ color: PAPER }}>{minRating}★</div>
              <div className="text-[10.5px]" style={{ color: 'rgba(247,249,250,.45)' }}>
                {state === 'partial' ? `${ratedCount}/${items.length} rated` : 'weakest step'}
              </div>
            </>
          ) : avgRating !== null ? (
            <>
              <div className="text-[15px] font-semibold" style={{ color: PAPER }}>{avgRating.toFixed(1)}/5</div>
              <div className="text-[10.5px]" style={{ color: 'rgba(247,249,250,.45)' }}>{ratedCount}/{items.length} rated</div>
            </>
          ) : (
            <div className="text-[11px]" style={{ color: 'rgba(247,249,250,.45)' }}>Not rated</div>
          )}
          {asSequence && side === 'both' && sideRatings && (sideRatings.fs != null || sideRatings.bs != null) ? (
            <div className="text-[10.5px] mt-0.5" style={{ color: 'rgba(247,249,250,.55)' }}>FS {sideRatings.fs ?? '—'}{sideRatings.fs != null ? '★' : ''} · BS {sideRatings.bs ?? '—'}{sideRatings.bs != null ? '★' : ''}</div>
          ) : asSequence && selfSequenceRating !== null && (
            <div className="text-[10.5px] mt-0.5" style={{ color: 'rgba(247,249,250,.55)' }}>last run {selfSequenceRating}★</div>
          )}
          <div className="text-[10.5px] mt-0.5" style={{ color: 'rgba(247,249,250,.45)' }}>
            {items.length} steps <span className="group-open:hidden">▾</span>
            <span className="hidden group-open:inline">▴</span>
          </div>
        </div>
      </summary>
      {asSequence && pageHref && (
        <a href={pageHref} className="flex items-center justify-between px-4 py-2.5 border-b border-[#DCD7C6] text-[12px]" style={{ background: '#E9E2D2' }}>
          <span>
            <span className="block font-semibold" style={{ color: INK }}>What this sequence is · open it in the course</span>
            <span className="block text-[12px] text-[#55666E]">Think it · Feel it · Do it · Review — the steps, the drills and the indicators you are rated on.</span>
          </span>
          <span className="font-bold" style={{ color: '#00A8CC' }}>→</span>
        </a>
      )}

      {/* Let's Play por secuencia: correrla completa, o elegir un paso como
          foco. Es la unidad de entreno, y la misma forma en que evalúa el
          coach (secuencia → paso → detalle). */}
      {canTrain && (
        <div className="px-3 py-2.5 border-b border-[#DCD7C6] space-y-2" style={{ background: '#F7F9FA' }}>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setPicking(false); onTrain!({ sequenceId: blockId!, mode: 'sequence_run' }); }}
              className="min-h-[44px] px-3 py-2 rounded-[5px] text-[12px] font-black uppercase leading-tight text-center active:scale-[0.98]"
              style={{ background: CYAN, color: INK, letterSpacing: '0.04em', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}
            >
              Run the whole sequence
            </button>
            <button
              type="button"
              onClick={() => setPicking((p) => !p)}
              className="min-h-[44px] px-3 py-2 rounded-[5px] text-[12px] font-black uppercase leading-tight text-center border-[1.5px] active:scale-[0.98]"
              style={{ ...(picking ? { background: 'rgba(255,209,102,.28)', borderColor: '#FFD166', color: '#10263B' } : { background: '#F7F9FA', borderColor: INK, color: INK }), letterSpacing: '0.04em', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}
            >
              {picking ? 'Cancel' : 'Work on one step'}
            </button>
          </div>
          {picking && (
            <div className="rounded-[5px] px-3 py-2.5" style={{ background: 'rgba(255,209,102,.28)' }}>
              <p className="text-[12px]" style={{ ...F_M, color: '#10263B' }}>Pick your focus</p>
              <p className="text-[12px] text-[#10263B] leading-snug mt-0.5">
                Tap the step you want to work on. You still run the whole sequence — that step is your objective.
              </p>
              {/* Primero el paso que la detuvo en tu último run; si no, el
                  que está por debajo de la barra. */}
              {(() => {
                const sid = heldBackStepId ?? (state !== 'owned' ? weakestStepId : null);
                const title = heldBackStepId ? heldBackTitle : weakestTitle;
                if (!sid || !title) return null;
                return (
                  <button
                    type="button"
                    onClick={() => { setPicking(false); onTrain!({ sequenceId: blockId!, mode: 'step_focus', focusStepId: sid }); }}
                    className="mt-2 w-full h-11 rounded-lg text-[12px] font-bold"
                    style={{ background: '#FFD166', color: INK }}
                  >
                    Start with {title} → {heldBackStepId ? '(held your last run back)' : ''}
                  </button>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* La dirección: por dónde empezar. Sin esto la secuencia dice cómo va
          pero no qué hacer. */}
      {asSequence && weakestStepId && state !== 'owned' && !picking && (
        <button
          type="button"
          onClick={() => onOpenStep(weakestStepId)}
          className="w-full text-left px-4 py-2.5 border-b border-[#DCD7C6]"
          style={{ background: 'rgba(255,209,102,.28)' }}
        >
          <span className="text-[12px]" style={{ ...F_M, color: '#10263B' }}>
            Start here
          </span>
          <span className="block text-[12.5px] text-[#10263B] leading-snug">
            <b>{weakestTitle}</b> is holding this sequence back
            {minRating !== null && ` — ${minRating}★`}
            {weakestIsOfficial && ' (your coach)'}
          </span>
        </button>
      )}

      <div className="divide-y divide-[#DCD7C6]">
        {items.map((item) => (
          <StepRow
            key={item.step_id}
            item={item}
            moments={moments[item.step_id]}
            highlight={asSequence && item.step_id === weakestStepId && state !== 'owned'}
            picking={picking}
            onOpen={() => {
              if (picking && canTrain) {
                setPicking(false);
                onTrain!({ sequenceId: blockId!, mode: 'step_focus', focusStepId: item.step_id });
              } else {
                onOpenStep(item.step_id);
              }
            }}
          />
        ))}
      </div>
    </details>
  );
}

function StepRow({
  item,
  moments,
  onOpen,
  highlight = false,
  picking = false,
}: {
  item: SequenceItem;
  /** Los momentos de la línea que cubre esta lección. */
  moments?: Moment[];
  onOpen: () => void;
  /** El paso que frena la secuencia: se marca para que no haya que buscarlo. */
  highlight?: boolean;
  /** Modo elegir foco: tocar arranca el entreno con este paso. */
  picking?: boolean;
}) {
  const hasDrill = !!item.drill;
  const hasMission = !!item.mission;
  const hasSubtitle = hasDrill || hasMission;

  return (
    <button
      onClick={onOpen}
      className="w-full px-4 py-3 hover:bg-[#EDF3F5] transition-colors text-left"
      style={highlight ? { background: 'rgba(255,209,102,.28)', boxShadow: 'inset 3px 0 0 #FFD166' } : picking ? { boxShadow: 'inset 3px 0 0 #FFD16688' } : undefined}
      aria-label={picking ? `Focus on ${item.step_title}` : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#55666E]" style={F_M}>{item.step_id}</span>
          </div>
          <div className="font-medium text-sm mt-0.5 truncate">
            {item.step_title}
          </div>
          <MomentChips list={moments} />
          {hasSubtitle && (
            <div className="flex items-center gap-2 text-[12px] text-[#55666E] mt-0.5">
              {hasDrill && (
                <span className="inline-flex items-center gap-1">
                  <Dumbbell size={12} strokeWidth={1.75} />
                  Drill
                </span>
              )}
              {hasMission && (
                <span className="inline-flex items-center gap-1">
                  <Waves size={12} strokeWidth={1.75} />
                  Mission
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
          {item.coach_rating != null ? (
            // M4: Coach official rating overrides self-rating visually (gold)
            <>
              <StarRating value={item.coach_rating} size="sm" readOnly variant="official" />
              <div className="text-[12px] text-[var(--tss-cyan,#00D2FF)] font-bold uppercase tracking-wider">
                Official {item.coach_rating}/5
              </div>
              {item.rating !== null && item.rating !== item.coach_rating && (
                <div className="text-[12px] text-[#55666E]">self: {item.rating}/5</div>
              )}
            </>
          ) : (
            <>
              {/* La estrella que CUENTA (auditoría 2026-09-15): una autoevaluación sin ola
                  vale hasta 3★ para el camino; si mapeó 4★, se ve el 3★ efectivo y por qué. */}
              <StarRating value={effectiveStars(item)} size="sm" readOnly />
              {item.rating !== null && (
                <div className="text-[12px] text-[#55666E] text-right">
                  {effectiveStars(item)}/5
                  {item.self_source === 'assessed' && (item.rating > (effectiveStars(item) ?? 0)
                    ? <span className="block">mapped {item.rating}/5 · counts as 3★ until you surf it</span>
                    : ' · self-assessed')}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}
