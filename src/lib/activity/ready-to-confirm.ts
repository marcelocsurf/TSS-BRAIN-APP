import 'server-only';

import type { createAdminClient } from '@/lib/supabase/admin';
import { SEQUENCE_PASS_STARS } from '@/lib/constants/learning-blocks';
import { ASSESSED_CAP } from '@/lib/stars';
import { SEQUENCE_PAGES } from '@/lib/sequence-pages';

// ─── "LISTO PARA QUE TU COACH LO CONFIRME" · una sola regla ───
//
// Marcelo (2026-09-25): el alumno se va del camp y sigue entrenando solo.
// La estrella del coach manda (nadie se asciende solo), pero la sugerencia
// no puede quedarse trabada en un paso que el alumno ya trabajó y se pone
// en 4★ o más: ese paso pasa a "listo para confirmar" y la sugerencia sigue
// al próximo. Del lado del coach, esos pasos son lo primero que evalúa
// cuando lo vuelve a ver.
//
// Un paso está listo cuando: el coach lo dejó bajo la barra (coach_rating
// < 4), el alumno se pone 4★ o más, y registró al menos UNA sesión sobre
// él (o un run completo de su secuencia) DESPUÉS de la nota del coach.
// Sin permisos adentro: quien llama ya validó los suyos.

export interface ReadyStep {
  step_id: string;
  step_title: string;
  sequence_id: string | null;
  sequence_label: string | null;
  self_stars: number;
  coach_stars: number;
  coach_rated_at: string | null;
  sessions_since: number;
  last_session_at: string | null;
}

/** La nota propia que vale: una AUTOEVALUACIÓN sin ola nunca pasa de 3★
 *  (stars.ts ASSESSED_CAP) — solo la ejecutada puede llegar a 4★. */
export function selfStarsThatCount(selfStars: number | null | undefined, selfSource?: string | null): number | null {
  if (selfStars == null) return null;
  return selfSource === 'assessed' ? Math.min(selfStars, ASSESSED_CAP) : selfStars;
}

export function isReadyToConfirm(
  selfStars: number | null | undefined,
  coachStars: number | null | undefined,
  sessionsSince: number,
  selfSource?: string | null,
): boolean {
  const self = selfStarsThatCount(selfStars, selfSource);
  return coachStars != null && coachStars < SEQUENCE_PASS_STARS
    && self != null && self >= SEQUENCE_PASS_STARS
    && sessionsSince > 0;
}

/** Todas las secuencias que contienen el paso (FP1 vive en #8–#13): un run
 *  completo de cualquiera de ellas es una sesión sobre el paso. */
export function sequencesOfStep(stepId: string, homeSequenceId?: string | null): string[] {
  const ids = new Set<string>();
  if (homeSequenceId) ids.add(homeSequenceId);
  for (const cfg of Object.values(SEQUENCE_PAGES)) if (cfg.stepIds.includes(stepId)) ids.add(cfg.id);
  return Array.from(ids);
}

/** Sesiones propias (cerradas) por paso DESPUÉS de la fecha dada: un foco en
 *  ese paso, un run completo de su secuencia, o un run que lo marcó. */
export async function sessionsSinceByStep(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  steps: { step_id: string; sequence_ids: string[]; since: string | null }[],
): Promise<Map<string, { count: number; last: string | null }>> {
  const out = new Map<string, { count: number; last: string | null }>();
  if (steps.length === 0) return out;
  const earliest = steps.map((s) => s.since).filter(Boolean).sort()[0] ?? null;
  let q = admin
    .from('self_training_sessions')
    .select('created_at, training_mode, linked_step_id, linked_sequence_id, step_marks')
    .eq('student_id', studentId)
    .eq('status', 'done')
    .order('created_at', { ascending: true })
    .limit(500);
  if (earliest) q = q.gt('created_at', earliest);
  const { data: rows } = await q;
  for (const st of steps) {
    let count = 0; let last: string | null = null;
    for (const r of (rows ?? []) as any[]) {
      if (st.since && !(r.created_at > st.since)) continue;
      const hit = r.linked_step_id === st.step_id
        || (r.training_mode === 'sequence_run' && !!r.linked_sequence_id && st.sequence_ids.includes(r.linked_sequence_id))
        || ((r.step_marks ?? []) as any[]).some((m) => m?.step_id === st.step_id);
      if (hit) { count += 1; last = r.created_at; }
    }
    out.set(st.step_id, { count, last });
  }
  return out;
}

/** Los pasos listos para confirmar de un alumno, con nombres. Para la ficha
 *  del coach y el planner. */
export async function readyToConfirmForStudent(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
): Promise<ReadyStep[]> {
  const { data: ratings } = await admin
    .from('student_step_ratings')
    .select('step_id, current_rating, coach_rating, coach_rated_at, self_source')
    .eq('student_id', studentId)
    .not('coach_rating', 'is', null)
    .lt('coach_rating', SEQUENCE_PASS_STARS)
    .gte('current_rating', SEQUENCE_PASS_STARS);
  const cands = ((ratings ?? []) as any[]).filter((c) => (selfStarsThatCount(c.current_rating, c.self_source) ?? 0) >= SEQUENCE_PASS_STARS);
  if (cands.length === 0) return [];
  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, wb_sequence_id, wb_sequence_name, wb_sequence_order')
    .in('id', cands.map((c) => c.step_id));
  const byId = new Map((lessons ?? []).map((l: any) => [l.id, l]));
  const since = await sessionsSinceByStep(admin, studentId, cands.map((c) => ({
    step_id: c.step_id,
    sequence_ids: sequencesOfStep(c.step_id, byId.get(c.step_id)?.wb_sequence_id ?? null),
    since: c.coach_rated_at ?? null,
  })));
  const out: ReadyStep[] = [];
  for (const c of cands) {
    const s = since.get(c.step_id) ?? { count: 0, last: null };
    if (!isReadyToConfirm(c.current_rating, c.coach_rating, s.count, c.self_source)) continue;
    const l = byId.get(c.step_id);
    out.push({
      step_id: c.step_id,
      step_title: l?.title ?? c.step_id,
      sequence_id: l?.wb_sequence_id ?? null,
      sequence_label: l?.wb_sequence_name ? `${l.wb_sequence_order != null ? `#${l.wb_sequence_order} ` : ''}${l.wb_sequence_name}` : null,
      self_stars: c.current_rating,
      coach_stars: c.coach_rating,
      coach_rated_at: c.coach_rated_at ?? null,
      sessions_since: s.count,
      last_session_at: s.last,
    });
  }
  // Los más trabajados primero: son los que el coach más necesita ver.
  out.sort((a, b) => b.sessions_since - a.sessions_since);
  return out;
}
