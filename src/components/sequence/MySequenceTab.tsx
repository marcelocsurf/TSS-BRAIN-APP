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
import { THREE_CIRCLES_SEQUENCE_ID, gameContext } from '@/lib/sequence-pages/three-circles';
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
  /** Lección "Venue Analysis" (ONB-06) leída; null = no se sabe. */
  venueDone?: boolean | null;
}

export function MySequenceTab({ portalToken, belt = 'white', onPracticeDrill, onTrainSequence, initialStepId, ownedBelts = [], venueDone = null }: Props) {
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
      {/* Un solo título (fase 5, 2026-09-25): antes el eyebrow y el h1 decían
          "Let's Play" dos veces y debajo iba una cuenta de validaciones que
          repetía lo que ya muestran el mapa y el Home. */}
      <div className="px-2 pt-2 pb-3 text-white" style={{ borderBottom: '1px solid rgba(247,249,250,.10)' }}>
        <span className="text-[10.5px]" style={{ ...F_M, letterSpacing: '0.18em', color: CYAN }}>{beltWord} Belt</span>
        <h1 className="mt-1 text-[26px]" style={{ ...F_D, fontWeight: 900, lineHeight: 1.06, color: PAPER }}>Let&apos;s Play</h1>
      </div>

      {/* HOW IT WORKS — arriba y en tres frases (auditoría 2026-09-15: llegaba
          después del mapa y con jerga). Misma regla de siempre, dicha simple. */}
      <div className="rounded-lg px-4 py-3" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
        <p className="text-[12px]" style={{ ...F_M, letterSpacing: '0.08em', color: '#55666E' }}>How it works</p>
        <p className="text-[15px] font-semibold mt-1 leading-snug" style={{ color: '#10263B' }}>
          {onTrainSequence ? 'Pick a sequence, save your plan, surf, come back and give it a star.' : 'Pick the sequence you are working on, run a step\u2019s mission, rate yourself honestly.'}
        </p>
        <p className="text-[13px] mt-1 leading-snug" style={{ color: '#10263B' }}>A sequence is yours at 4★ on every step — your coach confirms it in the water. Drills are rehearsal, no need to log them.</p>
      </div>

      {/* YOUR PATH (Marcelo 2026-09-17): el orden de Yellow y Blue en la ola.
          1 Venue analysis (teoría) → 2 llegar a la ola (entradas) → 3 Tres
          Círculos (juegos) → 4 las secuencias. Marca dónde estás; no bloquea. */}
      {(beltKey === 'yellow' || beltKey === 'blue') && (() => {
        const entries = beltKey === 'blue'
          ? data.sequences.filter((sq) => SEQUENCE_ROLE[sq.id] === 'entry')
          : data.sequences.filter((sq) => sq.belt === 'white' && sq.order <= 3);
        const entriesOwned = entries.filter((sq) => sq.state === 'owned').length;
        const circlesDone = circles.filter((g) => (g.lastStars ?? 0) >= 4).length;
        const stages: { n: number; title: string; status: string; done: boolean; href?: string | null; hint: string }[] = [
          { n: 1, title: 'Venue analysis', status: venueDone == null ? 'theory' : venueDone ? 'read' : 'not read yet', done: venueDone === true, href: `/portal/${portalToken}?tab=course`, hint: 'Read the spot before you paddle out. It is in your Pre-Course.' },
          { n: 2, title: 'Getting to the wave', status: entries.length ? `${entriesOwned} of ${entries.length} yours` : '—', done: entries.length > 0 && entriesOwned === entries.length, href: null, hint: 'Paddle out, catch, angle. The sequences below the games.' },
          { n: 3, title: 'The Three Circles', status: circles.length ? `${circlesDone} of ${circles.length} games at 4★` : '—', done: circles.length > 0 && circlesDone === circles.length, href: null, hint: 'Play the six games below.' },
          { n: 4, title: `${beltWord} sequences`, status: levelSeqs.length ? `${owned} of ${levelSeqs.length} yours` : '—', done: levelSeqs.length > 0 && owned === levelSeqs.length, href: null, hint: 'One sequence at a time, both sides.' },
        ];
        const here = stages.find((st) => !st.done) ?? null;
        return (
          <div className="rounded-lg p-4" style={{ background: '#061C2B', border: '1px solid rgba(0,210,255,.35)' }}>
            <p className="text-[12px]" style={{ ...F_M, letterSpacing: '0.08em', color: '#00D2FF' }}>Your path · {beltWord} Belt</p>
            <p className="text-[23px] mt-1" style={{ ...F_D, fontWeight: 900, color: '#F7F9FA' }}>{here ? `You are here: ${here.title}` : 'The whole path is yours'}</p>
            <div className="mt-3 space-y-1.5">
              {stages.map((st) => {
                const isHere = here?.n === st.n;
                const inner = (
                  <div className="flex items-center gap-3 rounded-[5px] px-3 py-2" style={{ background: isHere ? '#F7F9FA' : 'rgba(247,249,250,.06)', border: `1px solid ${isHere ? '#F7F9FA' : 'rgba(247,249,250,.14)'}` }}>
                    <span className="shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center text-[13px] font-black" style={{ background: st.done ? '#0A7C5D' : isHere ? '#00D2FF' : 'rgba(247,249,250,.12)', color: st.done || isHere ? '#061C2B' : '#F7F9FA' }}>{st.done ? '✓' : st.n}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold leading-tight" style={{ color: isHere ? '#10263B' : '#F7F9FA' }}>{st.title}{isHere ? <span className="ml-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00A8CC' }}>you are here</span> : null}</p>
                      <p className="text-[11px]" style={{ color: isHere ? '#55666E' : 'rgba(247,249,250,.7)' }}>{st.status}{isHere ? ` · ${st.hint}` : ''}</p>
                    </div>
                  </div>
                );
                return st.href ? <a key={st.n} href={st.href} className="block no-underline">{inner}</a> : <div key={st.n}>{inner}</div>;
              })}
            </div>
          </div>
        );
      })()}

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
            <p className="text-[13px] mt-1 leading-snug" style={{ color: '#10263B' }}>Board · Body · Wave. Play each game in the water, then give it a star.</p>
            <div className="mt-3 space-y-1.5">
              {circles.map((g, i) => (
                <div key={g.id} className="flex items-center gap-2.5 rounded-[5px] px-3 py-2" style={{ background: PAPER, border: '1px solid #DCD7C6' }}>
                  <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[12px] font-black" style={{ background: (g.lastStars ?? 0) >= 4 ? '#00A8CC' : INK, color: '#F7F9FA' }}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px]" style={{ ...F_M, letterSpacing: '0.08em', color: '#00A8CC' }}>{gameContext(g.id)?.label ?? 'The Three Circles'}</p>
                    <p className="text-[14px] font-bold leading-tight truncate" style={{ color: '#10263B' }}>{g.title}</p>
                    <p className="text-[11px]" style={{ color: '#55666E' }}>{g.plays === 0 ? 'Not played yet' : `Last: ${g.lastStars ?? '—'}★ · played ${g.plays}×`}</p>
                  </div>
                  {(onTrainSequence || onPracticeDrill) && (
                    <button type="button" onClick={() => { if (onTrainSequence) onTrainSequence({ sequenceId: THREE_CIRCLES_SEQUENCE_ID, mode: 'step_focus', focusStepId: g.id }); else onPracticeDrill?.(g.id); }} className="shrink-0 h-9 px-3 rounded-[5px] text-[12px] font-black uppercase" style={{ background: CYAN, color: INK, fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>
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
          {/* UNA tarjeta por movimiento (Marcelo 2026-09-17: los chips y "Both
              sides" decían lo mismo dos veces). Un movimiento de dos lados va
              en una fila con FS y BS; las de un solo lado o de entrada, en su
              propia fila. Cada celda abre su secuencia. */}
          <div className="mt-2.5 space-y-1.5">
            {(() => {
              const pairedIds = new Set<string>();
              for (const pr of sides.pairs) { if (pr.fs) pairedIds.add(pr.fs.id); if (pr.bs) pairedIds.add(pr.bs.id); }
              type Cell = { id: string; label: string; value: number | null; owned: boolean };
              const rows: { key: string; title: string; sub: string | null; cells: Cell[]; gap: number | null }[] = [];
              for (const sq of levelSeqs) {
                if (pairedIds.has(sq.id)) continue;
                const pre = sequencePrefix(sq.id, sq.order);
                rows.push({ key: sq.id, title: `${pre?.startsWith('#') ? `${pre} ` : ''}${sq.name}`, sub: null, gap: null,
                  cells: [{ id: sq.id, label: sq.side === 'fs' || sq.side === 'bs' ? SIDE_SHORT[sq.side] : '', value: sq.minRating, owned: sq.state === 'owned' }] });
              }
              for (const pr of sides.pairs) {
                const ownedOf = (id: string | undefined) => !!id && levelSeqs.find((x) => x.id === id)?.state === 'owned';
                const cells: Cell[] = [];
                if (pr.fs) cells.push({ id: pr.fs.id, label: `FS${pr.both ? '' : ` · ${pr.fs.label.split(' ')[0]}`}`, value: pr.fs.value, owned: pr.both ? (pr.fs.value ?? 0) >= 4 : ownedOf(pr.fs.id) });
                if (pr.bs) cells.push({ id: pr.bs.id, label: `BS${pr.both ? '' : ` · ${pr.bs.label.split(' ')[0]}`}`, value: pr.bs.value, owned: pr.both ? (pr.bs.value ?? 0) >= 4 : ownedOf(pr.bs.id) });
                rows.push({ key: `pair:${pr.move}`, title: pr.move, sub: pr.both ? 'one sequence · both sides' : 'two sequences · one per side', cells, gap: pr.gap });
              }
              // Orden del curso: por el número de la primera secuencia de la fila.
              const orderOf = (r: (typeof rows)[number]) => Math.min(...r.cells.map((c) => levelSeqs.find((x) => x.id === c.id)?.order ?? 99));
              rows.sort((a, b) => orderOf(a) - orderOf(b));
              return rows.map((r) => (
                <div key={r.key} className="rounded-[5px] px-3 py-2 flex items-center gap-3" style={{ background: '#F7F9FA', border: '1px solid #DCD7C6' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold leading-tight" style={{ color: '#10263B' }}>{r.title}</p>
                    {r.sub && <p className="text-[11px]" style={{ color: '#55666E' }}>{r.sub}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {r.cells.map((c) => {
                      const href = pageHrefOf(c.id);
                      const inner = (
                        <>
                          {c.label && <span className="block text-[10px]" style={{ ...F_M, letterSpacing: '0.08em', color: c.owned ? '#F7F9FA' : '#55666E' }}>{c.label}</span>}
                          <span className="block text-[14px] font-black leading-tight" style={{ color: c.owned ? '#F7F9FA' : '#10263B' }}>{c.owned ? '✓' : c.value == null ? 'not yet' : `${c.value}★`}</span>
                        </>
                      );
                      const style = { background: c.owned ? '#0A7C5D' : '#fff', border: `1px solid ${c.owned ? '#0A7C5D' : '#DCD7C6'}`, minWidth: 64 };
                      return href
                        ? <a key={c.id} href={href} className="block rounded-[5px] px-2.5 py-1.5 text-center no-underline" style={style}>{inner}</a>
                        : <span key={c.id} className="block rounded-[5px] px-2.5 py-1.5 text-center" style={style}>{inner}</span>;
                    })}
                    {r.gap != null && r.gap >= 1 && <span className="text-[11px] font-semibold" style={{ color: '#10263B' }}>gap {r.gap}</span>}
                  </div>
                </div>
              ));
            })()}
          </div>
          {/* Por lado: una línea es tuya cuando es tuya de los dos lados. */}
          {(sides.fs != null || sides.bs != null) && (
            <div className="mt-3 pt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1" style={{ borderTop: '1px solid rgba(6,28,43,.12)' }}>
              {/* Las notas por lado viven en "Both sides" (auditoría 2026-09-15: salían tres veces). Acá solo el consejo. */}
              {sides.advice ? <span className="basis-full text-[13px] leading-snug font-semibold" style={{ color: '#10263B' }}>{sides.advice.text}</span> : <span className="text-[12px]" style={{ color: '#55666E' }}>A move is complete when both sides are yours.</span>}
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
              weakestCoachRatedAt={seq.weakestCoachRatedAt ?? null}
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
                weakestCoachRatedAt={seq.weakestCoachRatedAt ?? null}
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
  weakestCoachRatedAt = null,
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
  weakestCoachRatedAt?: string | null;
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
  // Por dónde empezar (fase 5): el paso que frenó tu último run manda; si no,
  // el primero bajo la barra. Un solo paso en el banner, en "Start with" y en
  // la fila resaltada — antes el banner y la fila de arriba nombraban dos.
  const startId = heldBackStepId ?? (state !== 'owned' ? weakestStepId : null);
  const startTitle = heldBackStepId ? heldBackTitle : weakestTitle;
  const startItem = startId ? items.find((i) => i.step_id === startId) ?? null : null;
  const startStars = startItem ? effectiveStars(startItem) : null;
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
          <span className="font-semibold" style={{ color: INK }}>Open the sequence page <span className="font-normal text-[#55666E]">· Think it · Feel it · Do it · Review</span></span>
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
                const sid = startId;
                const title = startTitle;
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
      {asSequence && startId && startTitle && state !== 'owned' && !picking && (
        <button
          type="button"
          // Misma acción que "Work on one step → Start with X" (fase 5): antes
          // el banner abría el paso suelto y el botón arrancaba el entreno.
          onClick={() => { if (canTrain) onTrain!({ sequenceId: blockId!, mode: 'step_focus', focusStepId: startId }); else onOpenStep(startId); }}
          className="w-full text-left px-4 py-2.5 border-b border-[#DCD7C6]"
          style={{ background: 'rgba(255,209,102,.28)' }}
        >
          <span className="text-[12px]" style={{ ...F_M, color: '#10263B' }}>
            Start here
          </span>
          <span className="block text-[12.5px] text-[#10263B] leading-snug">
            {/* Sin número: la fila de abajo ya muestra las estrellas de ESE paso
                (antes el banner ponía el mínimo de la secuencia, que podía ser
                de otro paso). */}
            <b>{startTitle}</b>{heldBackStepId ? ' held your last run back' : startStars == null ? ' — not rated yet' : ' is holding this sequence back'}
            {/* La estrella oficial manda sobre la tuya: se dice quién y cuándo
                (Marcelo 2026-09-25: "las estrellas no se movían"). */}
            {!heldBackStepId && weakestIsOfficial && ` · your coach's star${weakestCoachRatedAt ? `, ${new Date(weakestCoachRatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' })}` : ''} · only they can move it`}
          </span>
        </button>
      )}

      <div className="divide-y divide-[#DCD7C6]">
        {items.map((item) => (
          <StepRow
            key={item.step_id}
            item={item}
            moments={moments[item.step_id]}
            highlight={asSequence && item.step_id === startId && state !== 'owned'}
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
