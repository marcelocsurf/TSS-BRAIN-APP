// ═══ Progreso por LADO (frontside / backside) — Marcelo 2026-09-10 ═══
//
// Una sola función pura para las dos puertas (Home → Your next moves, y
// Let's Play → Where you are / Both sides), así las dos dicen lo mismo.
// La secuencia sigue valiendo lo que vale su paso más flojo; acá solo se
// lee ese valor por lado y se compara.
import { SEQUENCE_SIDE, SIDE_PAIRS, SIDE_WORD, sequencePrefix, type SequenceSide } from '@/lib/constants/learning-blocks';

export type SideSeqInput = {
  id: string;
  order: number;
  name: string;
  state: 'owned' | 'working' | 'partial' | 'unrated';
  /** Estrellas del paso más flojo (coach manda). */
  minRating: number | null;
  /** Tu última nota de la cadena en Let's Play. */
  selfSequenceRating: number | null;
  /** Solo secuencias de dos lados: la última nota por lado. */
  sideRatings?: { fs: number | null; bs: number | null } | null;
};

export type SidePair = {
  move: string;
  /** true = es UNA secuencia surfeada de los dos lados (Yellow #7). */
  both: boolean;
  fs: { id: string; label: string; value: number | null } | null;
  bs: { id: string; label: string; value: number | null } | null;
  gap: number | null;
};

export type SideBalance = {
  fs: number | null;
  bs: number | null;
  gap: number | null;
  pairs: SidePair[];
  /** El consejo, si un lado quedó atrás: el lado flojo es el próximo movimiento. */
  advice: { text: string; sequenceId: string; side: 'fs' | 'bs' } | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const labelOf = (s: SideSeqInput) => {
  const p = sequencePrefix(s.id, s.order);
  return p?.startsWith('#') ? `${p} ${s.name}` : s.name;
};

/** El valor de una secuencia de UN lado: el paso más flojo; si no hay pasos
 *  calificados, tu último run. */
export function sideValue(s: SideSeqInput, side: 'fs' | 'bs'): number | null {
  const kind: SequenceSide | undefined = SEQUENCE_SIDE[s.id];
  if (kind === 'both') return s.sideRatings?.[side] ?? null;
  if (kind !== side) return null;
  return s.minRating ?? s.selfSequenceRating ?? null;
}

export function sideBalance(seqs: SideSeqInput[]): SideBalance {
  const byId = new Map(seqs.map((s) => [s.id, s]));
  const pairs: SidePair[] = [];
  const fsVals: number[] = [];
  const bsVals: number[] = [];

  for (const p of SIDE_PAIRS) {
    const a = byId.get(p.fs);
    const b = byId.get(p.bs);
    if (!a && !b) continue;
    const fv = a ? sideValue(a, 'fs') : null;
    const bv = b ? sideValue(b, 'bs') : null;
    if (fv != null) fsVals.push(fv);
    if (bv != null) bsVals.push(bv);
    pairs.push({
      move: p.move,
      both: false,
      fs: a ? { id: a.id, label: labelOf(a), value: fv } : null,
      bs: b ? { id: b.id, label: labelOf(b), value: bv } : null,
      gap: fv != null && bv != null ? Math.abs(fv - bv) : null,
    });
  }
  for (const s of seqs) {
    if (SEQUENCE_SIDE[s.id] !== 'both') continue;
    const fv = sideValue(s, 'fs');
    const bv = sideValue(s, 'bs');
    if (fv != null) fsVals.push(fv);
    if (bv != null) bsVals.push(bv);
    pairs.push({
      move: s.name,
      both: true,
      fs: { id: s.id, label: labelOf(s), value: fv },
      bs: { id: s.id, label: labelOf(s), value: bv },
      gap: fv != null && bv != null ? Math.abs(fv - bv) : null,
    });
  }

  const avg = (v: number[]) => (v.length ? round1(v.reduce((x, y) => x + y, 0) / v.length) : null);
  const fs = avg(fsVals);
  const bs = avg(bsVals);
  const gap = fs != null && bs != null ? round1(Math.abs(fs - bs)) : null;

  // El consejo: el par con la brecha más grande (≥ 1★) donde el lado flojo
  // todavía no llegó a la barra. Si no hay brecha, no hay consejo: el orden
  // del método (Your next moves) manda.
  let advice: SideBalance['advice'] = null;
  let best = 0;
  for (const p of pairs) {
    if (p.gap == null || p.gap < 1 || !p.fs || !p.bs) continue;
    const weakSide: 'fs' | 'bs' = (p.fs.value ?? 0) < (p.bs.value ?? 0) ? 'fs' : 'bs';
    const weak = weakSide === 'fs' ? p.fs : p.bs;
    const strong = weakSide === 'fs' ? p.bs : p.fs;
    if ((weak.value ?? 0) >= 4 || p.gap <= best) continue;
    best = p.gap;
    const stars = p.gap === 1 ? '1★' : `${p.gap}★`;
    advice = {
      side: weakSide,
      sequenceId: weak.id,
      text: p.both
        ? `Train ${SIDE_WORD[weakSide].toLowerCase()} first: ${weak.label} is ${stars} behind on that side.`
        : `Train ${SIDE_WORD[weakSide].toLowerCase()} first: ${weak.label} is ${stars} behind ${strong.label}.`,
    };
  }

  return { fs, bs, gap, pairs, advice };
}
