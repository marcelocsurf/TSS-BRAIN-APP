'use client';

// ═══ Idioma del método en el editor de plantillas (Marcelo 2026-09-19) ═══
// Cada bloque puede decir QUÉ SECUENCIA se trabaja y si es la línea completa
// o un paso (foco), con los momentos de ese paso como detalle opcional. Y
// cada día (o bloque de teoría) puede llevar temas: Tres Círculos, Infinite
// Circle, lecciones del Pre-Course, temas de Blue. Es lo que después lee el
// plan del coach y el "Next class" del alumno: la base ya lo guardaba
// (00209), solo faltaba poder elegirlo acá.

import { SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';
import { sequenceElements } from '@/lib/sequence-pages/circles-seq';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import { momentsByStep } from '@/lib/sequence-pages/moments';
import { PLAN_TOPICS, topicsForBelt } from '@/lib/sequence-pages/topics';
import { THREE_CIRCLES_SEQUENCE_ID, THREE_CIRCLES_GAME_IDS, THREE_CIRCLES_GAME_TITLES, gameContext } from '@/lib/sequence-pages/three-circles';
import { SIDE_PAIR_IDS, isSidePair, sidePairLabel } from '@/lib/sequence-pages/side-pairs';
import type { TemplateBlockInput } from '@/lib/actions/camps';
import type { TemplateCatalog } from '@/lib/actions/template-catalog';

const BELT_ORDER = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];
const LEVEL_TO_BELT: Record<string, string> = {
  Beginner: 'white_belt', Novice: 'yellow_belt', Foundation: 'blue_belt', Emerging: 'purple_belt', 'Pre-Elite': 'brown_belt', Elite: 'black_belt',
};

/** Cinta de la plantilla: el curso que incluye, o la que sale del nivel. */
export function templateBelt(includesCourseKey: string | null | undefined, levelName: string | null | undefined): string | null {
  if (includesCourseKey) return includesCourseKey;
  if (levelName && LEVEL_TO_BELT[levelName]) return LEVEL_TO_BELT[levelName];
  return null;
}

const seqTag = (c: SequencePageConfig) => (c.eyebrow ? `${c.eyebrow.split(' · ')[0]} · ${c.title}` : `#${c.number} · ${c.title}`);
const beltWord = (b: string) => b.replace('_belt', '');

/** Secuencias de la cinta de la plantilla y de las de abajo (como el catálogo de pasos). */
function sequencesFor(belt: string | null): SequencePageConfig[] {
  const max = belt ? BELT_ORDER.indexOf(belt) : BELT_ORDER.length - 1;
  return Object.values(SEQUENCE_PAGES)
    .filter((c) => BELT_ORDER.indexOf(c.belt) <= Math.max(max, 0))
    .sort((a, b) => BELT_ORDER.indexOf(a.belt) - BELT_ORDER.indexOf(b.belt) || (a.kind === 'entry' ? -1 : 0) - (b.kind === 'entry' ? -1 : 0) || a.number - b.number);
}

const SEL = 'w-full px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]';
const LBL = 'block text-[10px] uppercase tracking-wider text-[#55666E] mb-1';
const LBL_STYLE = { fontFamily: 'var(--font-mono)' } as const;

export function SequenceFields({
  block,
  catalog,
  belt,
  onChange,
}: {
  block: TemplateBlockInput;
  catalog: TemplateCatalog | null;
  belt: string | null;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  const seqs = sequencesFor(belt);
  const seqId = block.sequence_id ?? '';
  const isPair = isSidePair(seqId);
  const cfg = seqId && seqId !== THREE_CIRCLES_SEQUENCE_ID && !isPair ? SEQUENCE_PAGES[seqId] ?? null : null;
  // "Tu lado" solo tiene sentido con las secuencias de Blue (pares FS/BS).
  const showPairs = !belt || BELT_ORDER.indexOf(belt) >= BELT_ORDER.indexOf('blue_belt');
  const titleOf = (id: string) => elementTitle(cfg, id, catalog?.stps.find((s) => s.id === id)?.title ?? null) ?? id;
  // Sub-elementos de un círculo de un paso (Board · Wave): se planean como pasos.
  const steps = cfg ? sequenceElements(cfg, (id) => catalog?.stps.find((s) => s.id === id)?.title ?? null) : [];
  const lessonOf = (id: string) => cfg?.elements?.find((e) => e.id === id)?.stepId ?? id;
  const focus = block.focus_step_id ?? '';
  const moments = cfg && focus ? (momentsByStep(cfg.id, steps)[focus] ?? []) : [];
  const chosenMoments = block.focus_moments ?? [];

  const pickSequence = (id: string) => {
    if (!id) { onChange({ sequence_id: null, focus_step_id: null, focus_moments: null }); return; }
    if (id === THREE_CIRCLES_SEQUENCE_ID) { onChange({ sequence_id: id, focus_step_id: null, focus_moments: null, step_id: null, step_ids: null }); return; }
    if (isSidePair(id)) { onChange({ sequence_id: id, focus_step_id: null, focus_moments: null, step_id: null, step_ids: null, mission_id: null }); return; }
    const c = SEQUENCE_PAGES[id];
    // Línea completa por defecto: todos los pasos de la secuencia, sin paso único.
    onChange({ sequence_id: id, focus_step_id: null, focus_moments: null, step_ids: c ? c.stepIds : null, step_id: null, ...(c?.kind === 'circle' ? { mission_id: null } : {}) });
  };
  const pickFocus = (id: string) => {
    if (!id) { onChange({ focus_step_id: null, focus_moments: null, step_id: null, step_ids: cfg ? cfg.stepIds : block.step_ids ?? null, ...(cfg?.kind === 'circle' ? { mission_id: null } : {}) }); return; }
    // Círculo: el elemento trae su juego (Do it) — no se elige aparte.
    const lesson = lessonOf(id);
    const game = cfg?.kind === 'circle' ? cfg.games?.[lesson] ?? null : undefined;
    onChange({ focus_step_id: id, focus_moments: null, step_id: lesson, step_ids: cfg ? cfg.stepIds : block.step_ids ?? null, ...(game !== undefined ? { mission_id: game } : {}) });
  };
  const toggleMoment = (key: string) => {
    const next = chosenMoments.includes(key) ? chosenMoments.filter((k) => k !== key) : [...chosenMoments, key];
    onChange({ focus_moments: next.length ? next : null });
  };

  return (
    <div className="space-y-2 border-l-2 pl-3" style={{ borderColor: '#00D2FF' }}>
      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...LBL_STYLE, color: '#00A8CC' }}>Sequence of the method</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className={LBL} style={LBL_STYLE}>Sequence</label>
          <select value={seqId} onChange={(e) => pickSequence(e.target.value)} className={SEL}>
            <option value="">— none · this block is not a sequence —</option>
            {seqs.map((c) => <option key={c.id} value={c.id}>{seqTag(c)} · {beltWord(c.belt)}</option>)}
            <option value={THREE_CIRCLES_SEQUENCE_ID}>The Three Circles · games</option>
            {showPairs && SIDE_PAIR_IDS.map((pid) => <option key={pid} value={pid}>{sidePairLabel(pid)}</option>)}
          </select>
        </div>
        {cfg && (
          <div>
            <label className={LBL} style={LBL_STYLE}>Focus</label>
            <select value={focus} onChange={(e) => pickFocus(e.target.value)} className={SEL}>
              <option value="">{cfg.kind === 'circle' ? 'Whole circle · all its elements' : 'Whole sequence · start to finish'}</option>
              {steps.map((s, i) => <option key={s.id} value={s.id}>{i + 1} · {s.title}</option>)}
            </select>
          </div>
        )}
      </div>
      {isPair && (
        <p className="text-[11px] text-[#55666E]">Decided per student when the camp is created: Regular → frontside, Goofy → backside (no stance in the profile → frontside). The whole line; the coach sets the focus per student in the plan.</p>
      )}
      {cfg && cfg.kind === 'circle' && (
        <p className="text-[11px] text-[#55666E]">{focus ? `Element chosen · the game comes with it: ${THREE_CIRCLES_GAME_TITLES[cfg.games?.[focus] ?? ''] ?? '—'}.` : 'Pick the element (Focus) to work today; its game comes with it. Whole circle = all its games across the day.'}</p>
      )}
      {cfg && cfg.kind !== 'circle' && !focus && (
        <p className="text-[11px] text-[#55666E]">The student and the coach see “{seqTag(cfg)} · the whole line”. Pick a focus only when the day works one step of it.</p>
      )}
      {/* Tres Círculos: el bloque ES un juego (Marcelo 2026-09-19). Uno por
          bloque, en el orden que quiera el día: pies → postura + oblicuos →
          pocket. El coach ya tiene el Think·Feel·Do·Review en el curso. */}
      {seqId === THREE_CIRCLES_SEQUENCE_ID && (
        <div>
          <label className={LBL} style={LBL_STYLE}>Game · one per block</label>
          <select value={block.mission_id ?? ''} onChange={(e) => onChange({ mission_id: e.target.value || null, mission_custom: null, step_id: null, step_ids: null })} className={SEL}>
            <option value="">— pick the game —</option>
            {THREE_CIRCLES_GAME_IDS.map((gid) => {
              const ctx = gameContext(gid);
              return <option key={gid} value={gid}>{ctx ? `${ctx.label} — ` : ''}{THREE_CIRCLES_GAME_TITLES[gid] ?? gid}</option>;
            })}
          </select>
          <p className="text-[11px] text-[#55666E] mt-1">The student sees the game in “Next class” with “Play it” and “Study it”. Add another block for the next game of the day.</p>
        </div>
      )}
      {moments.length > 0 && (
        <div>
          <label className={LBL} style={LBL_STYLE}>Moments of that step · optional</label>
          <div className="flex flex-wrap gap-1.5">
            {moments.map((m) => {
              const on = chosenMoments.includes(m.key);
              return (
                <button key={m.key} type="button" aria-pressed={on} onClick={() => toggleMoment(m.key)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  style={on ? { background: '#061C2B', borderColor: '#061C2B', color: '#F7F9FA' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
                  {m.short}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Secuencia principal del día (cabecera del plan que lee el coach). Opcional: los bloques ya dicen lo suyo. */
export function DaySequenceSelect({ value, belt, onChange }: { value: string | null | undefined; belt: string | null; onChange: (v: string | null) => void }) {
  const seqs = sequencesFor(belt);
  return (
    <div>
      <label className={LBL} style={LBL_STYLE}>Main sequence of the day · optional (the blocks below say the rest)</label>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} className={SEL}>
        <option value="">— from the blocks —</option>
        {seqs.map((c) => <option key={c.id} value={c.id}>{seqTag(c)} · {beltWord(c.belt)}</option>)}
      </select>
    </div>
  );
}

/** Temas de teoría (Tres Círculos, Infinite Circle, Pre-Course, Blue…) para un día o un bloque de teoría. */
export function TopicChips({ value, belt, onChange, label = 'Theory topics · what the student studies that day' }: {
  value: string[] | null | undefined;
  belt: string | null;
  onChange: (next: string[] | null) => void;
  label?: string;
}) {
  const chosen = value ?? [];
  const pool = belt ? topicsForBelt(belt) : PLAN_TOPICS;
  const toggle = (id: string) => {
    const next = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    onChange(next.length ? next : null);
  };
  return (
    <div>
      <label className={LBL} style={LBL_STYLE}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {pool.map((t) => {
          const on = chosen.includes(t.id);
          return (
            <button key={t.id} type="button" aria-pressed={on} onClick={() => toggle(t.id)}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
              style={on ? { background: '#00D2FF', borderColor: '#00D2FF', color: '#061C2B' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
              {t.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
