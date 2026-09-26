import 'server-only';

// ═══ Sembrar el plan de un servicio desde su plantilla ═══
// Sacado de createCampInstance (camps.ts) el 2026-09-25 para poder usarlo
// también cuando un camp YA existe y cambia de plantilla (Marcelo: "usemos la
// v3 para el camp Foundation de este lunes"). Misma receta: un service_plans
// por día (con los temas de teoría del día) y un service_plan_blocks por
// (día × alumno × bloque de plantilla), resolviendo los pares PAIR-* por el
// stance del alumno. Sin permisos adentro: quien llama ya validó los suyos.
import type { createAdminClient } from '@/lib/supabase/admin';
import { SEQUENCE_PAGES } from '@/lib/sequence-pages';
import { isSidePair, resolveSidePair } from '@/lib/sequence-pages/side-pairs';

type Db = ReturnType<typeof createAdminClient>;

export interface SeedSession { id: string; template_day_id: string | null }

export async function seedPlansFromTemplate(
  db: Db,
  input: {
    instanceId: string;
    templateDayIds: string[];
    sessions: SeedSession[];
    studentIds: string[];
    /** true = no crear service_plans donde ya exista uno (cambio de plantilla). */
    keepExistingPlans?: boolean;
  },
): Promise<{ plans: number; blocks: number }> {
  const { instanceId, templateDayIds, sessions, studentIds } = input;
  if (sessions.length === 0) return { plans: 0, blocks: 0 };

  const { data: tplBlocks } = await db
    .from('camp_template_blocks')
    .select('id, template_day_id, block_order, step_id, step_ids, drill_id, drill_custom, mission_id, mission_custom, evaluation_focus, mission_time, sequence_id, focus_step_id, focus_moments')
    .in('template_day_id', templateDayIds)
    .order('block_order');

  // Temas de teoría del día (idioma del método, 2026-09-18) → service_plans.topics.
  const topicsByDayId = new Map<string, string[]>();
  {
    const { data: dayTopics } = await db.from('camp_template_days').select('id, topic_ids').in('id', templateDayIds);
    for (const d of dayTopics ?? []) {
      if (Array.isArray((d as any).topic_ids) && (d as any).topic_ids.length) topicsByDayId.set((d as any).id, (d as any).topic_ids);
    }
  }

  // Un service_plans por día del servicio.
  let existingPlan = new Set<string>();
  if (input.keepExistingPlans) {
    const { data: ex } = await db.from('service_plans').select('camp_session_id').in('camp_session_id', sessions.map((s) => s.id));
    existingPlan = new Set((ex ?? []).map((p: any) => p.camp_session_id as string));
  }
  const planRows = sessions
    .filter((cs) => !existingPlan.has(cs.id))
    .map((cs) => ({
      camp_instance_id: instanceId,
      camp_session_id: cs.id,
      completion_state: 'planned' as const,
      topics: cs.template_day_id ? topicsByDayId.get(cs.template_day_id) ?? null : null,
    }));
  if (planRows.length > 0) {
    const { error: planErr } = await db.from('service_plans').insert(planRows);
    if (planErr) throw new Error(`Failed to seed service_plans: ${planErr.message}`);
  }
  if (studentIds.length === 0) return { plans: planRows.length, blocks: 0 };

  // "Tu lado" (2026-09-19): un bloque PAIR-* se resuelve por alumno según su
  // stance — Regular → frontside, Goofy → backside. Sin stance → frontside.
  const stanceById = new Map<string, string | null>();
  {
    const { data: stRows } = await db.from('students').select('id, goofy_or_regular').in('id', studentIds);
    for (const r of stRows ?? []) stanceById.set((r as any).id, (r as any).goofy_or_regular ?? null);
  }
  const resolveSeq = (tb: any, studentId: string): { sequence_id: string | null; step_ids: string[] | null } => {
    const sid = tb.sequence_id as string | null;
    if (isSidePair(sid)) {
      const r = resolveSidePair(sid, stanceById.get(studentId));
      const cfg = SEQUENCE_PAGES[r.sequenceId];
      return { sequence_id: r.sequenceId, step_ids: cfg ? cfg.stepIds : null };
    }
    return { sequence_id: sid ?? null, step_ids: tb.step_ids ?? null };
  };

  // Un service_plan_blocks por (día × alumno × bloque de plantilla).
  const blockRows: any[] = [];
  for (const cs of sessions) {
    const dayBlocks = (tplBlocks ?? []).filter((b: any) => b.template_day_id === cs.template_day_id);
    for (const studentId of studentIds) {
      if (dayBlocks.length === 0) {
        // Un día sin bloques de plantilla igual nace con un bloque vacío: el
        // coach necesita dónde escribir.
        blockRows.push({ camp_instance_id: instanceId, camp_session_id: cs.id, student_id: studentId, order_index: 0 });
      } else {
        dayBlocks.forEach((tb: any, idx: number) => {
          const rs = resolveSeq(tb, studentId);
          blockRows.push({
            camp_instance_id: instanceId,
            camp_session_id: cs.id,
            student_id: studentId,
            order_index: tb.block_order ?? idx,
            step_id: tb.step_id ?? ((rs.sequence_id && !tb.focus_step_id) ? null : (rs.step_ids?.[0] ?? null)),
            step_ids: rs.step_ids,
            land_drill_id: tb.drill_id ?? null,
            land_drill_custom: tb.drill_custom ?? null,
            water_drill_id: tb.mission_id ?? null,
            water_drill_custom: tb.mission_custom ?? null,
            objective_text: tb.evaluation_focus ?? null,
            // Idioma del método (2026-09-18): secuencia + foco de la plantilla.
            sequence_id: rs.sequence_id,
            focus_step_id: isSidePair(tb.sequence_id) ? null : (tb.focus_step_id ?? null),
            focus_moments: isSidePair(tb.sequence_id) ? null : (tb.focus_moments ?? null),
          });
        });
      }
    }
  }
  if (blockRows.length > 0) {
    let { error: blkErr } = await db.from('service_plan_blocks').insert(blockRows);
    if (blkErr && /step_ids/.test(blkErr.message)) {
      // service_plan_blocks.step_ids sin migrar → reintento sin la columna.
      const legacyRows = blockRows.map(({ step_ids: _drop, ...rest }) => rest);
      ({ error: blkErr } = await db.from('service_plan_blocks').insert(legacyRows));
    }
    if (blkErr) throw new Error(`Failed to seed service_plan_blocks: ${blkErr.message}`);
  }
  return { plans: planRows.length, blocks: blockRows.length };
}
