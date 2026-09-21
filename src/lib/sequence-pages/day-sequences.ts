// ═══ Las secuencias de AGUA de un día, desde sus bloques (2026-09-21) ═══
// Una sola regla, sin React, para el servidor (bitácora del alumno) y el
// cliente (cierre del coach): se saltan THREE-CIRCLES y los bloques solo de
// tierra; la secuencia sale de sequence_id o, en plantillas viejas, de los
// pasos; si el coach marcó "se trabajó otra cosa", esa es la que se califica.

import { SEQUENCE_PAGES } from '@/lib/sequence-pages';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import { resolveSequenceForSteps } from '@/lib/sequence-pages/resolve';

export type WaterBlockLike = {
  order_index: number;
  sequence_id?: string | null;
  worked_sequence_id?: string | null;
  step_id?: string | null;
  step_ids?: string[] | null;
  focus_step_id?: string | null;
  land_drill_id?: string | null;
  land_drill_custom?: string | null;
  water_drill_id?: string | null;
  water_drill_custom?: string | null;
  coach_sequence_rating?: number | null;
};

export type WaterSequence = {
  cfg: SequencePageConfig;
  plannedCfg: SequencePageConfig;
  order: number;
  focusStepId: string | null;
  star: number | null;
};

export function waterSequencesOfBlocks(blocks: WaterBlockLike[], belt: string | null): WaterSequence[] {
  const out: WaterSequence[] = [];
  const sorted = [...(blocks ?? [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  for (const b of sorted) {
    const landOnly = !!(b.land_drill_id || b.land_drill_custom) && !b.water_drill_id && !b.water_drill_custom && b.order_index !== 0;
    if (landOnly) continue;
    if (b.sequence_id === 'THREE-CIRCLES') continue;
    const plannedCfg = (b.sequence_id && SEQUENCE_PAGES[b.sequence_id]) || resolveSequenceForSteps({ stepIds: b.step_ids ?? null, stepId: b.step_id ?? null }, belt);
    if (!plannedCfg) continue;
    const workedCfg = (b.worked_sequence_id && SEQUENCE_PAGES[b.worked_sequence_id]) || null;
    const cfg = workedCfg ?? plannedCfg;
    const seen = out.find((x) => x.plannedCfg.id === plannedCfg.id);
    if (seen) {
      if (seen.star === null && b.coach_sequence_rating) seen.star = b.coach_sequence_rating;
      if (!seen.focusStepId && b.focus_step_id && seen.cfg.id === seen.plannedCfg.id) seen.focusStepId = b.focus_step_id;
      continue;
    }
    out.push({ cfg, plannedCfg, order: b.order_index, focusStepId: workedCfg ? null : (b.focus_step_id ?? null), star: b.coach_sequence_rating ?? null });
  }
  return out;
}

/** "#10 Snap Frontside" · las de entrada y los círculos ya traen su nombre. */
export const seqShortLabel = (c: SequencePageConfig) => (c.eyebrow ? c.title : `#${c.number} ${c.title}`);
