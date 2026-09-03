'use server';

// ═══ EVALUACIÓN OPCIONAL POR CRITERIO (coach) ═══
// Marcelo (2026-09-02): el coach califica el paso con su estrella, como
// siempre, y SI QUIERE abre "ver detalles" y marca Met / Partial / Not met en
// los criterios que le importen — uno, dos o ninguno. Nada es obligatorio.
//
// Los criterios son los de la MISIÓN del paso (en el agua el coach ve
// ejecución, no simulación) — la misma lista que el alumno marca solo, así las
// dos evaluaciones hablan del mismo detalle. El detalle más flojo se vuelve el
// next focus del alumno ("From your coach") sin escribirlo a mano.
//
// Historial que no se pisa (como water_tests): cada marca queda; vale la última.

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { pickWeakestCriterion, type CriterionEvaluationItem, type CriterionResultValue } from '@/lib/utils/criteria';

type Mark = { criterion_index: number; result: CriterionResultValue };
type Coach = { id: string; academy_id: string | null; platform: boolean; role: string | null; viaToken: boolean };

async function coachFromContext(portalToken?: string | null): Promise<Coach | null> {
  const admin = createAdminClient();
  if (portalToken) {
    // Misma vara que resolveCoachByToken: activo Y con acceso al portal.
    const { data } = await admin
      .from('coaches')
      .select('id, academy_id, role, active_status, is_platform_admin, course_access_granted')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (!data || !(data as any).active_status || !(data as any).course_access_granted) return null;
    return { id: data.id, academy_id: data.academy_id ?? null, platform: !!(data as any).is_platform_admin, role: (data as any).role ?? null, viaToken: true };
  }
  const { getCurrentCoach } = await import('./auth');
  const me = await getCurrentCoach().catch(() => null);
  if (!me) return null;
  return { id: me.id, academy_id: (me as any).academy_id ?? null, platform: !!(me as any).is_platform_admin, role: (me as any).role ?? null, viaToken: false };
}

/** El MISMO gate de la ficha (checkCoachAccessToStudent): admin de
 *  plataforma todo; admin/coordinador su academia; coach solo los alumnos de
 *  su ventana de servicio. Por token de portal se replica con el coach del
 *  token, porque getCurrentCoach ahí no existe. */
async function canTouchStudent(coach: Coach, studentId: string): Promise<boolean> {
  if (coach.platform) return true;
  if (!coach.viaToken) {
    const { checkCoachAccessToStudent } = await import('./students');
    const access = await checkCoachAccessToStudent(studentId).catch(() => null);
    return access === 'allowed';
  }
  if (coach.role === 'admin' || coach.role === 'coordinator') {
    const admin = createAdminClient();
    const { data } = await admin.from('students').select('academy_id').eq('id', studentId).maybeSingle();
    if (!data) return false;
    const sa = (data as any).academy_id as string | null;
    return !(sa && coach.academy_id && sa !== coach.academy_id);
  }
  const { getCoachAccessibleStudentIds } = await import('./auth');
  const ids = await getCoachAccessibleStudentIds(coach.id).catch(() => [] as string[]);
  return ids.includes(studentId);
}

/** La pieza del paso que se evalúa: su MISIÓN visible al alumno (la primera por
 *  orden si hay más de una); si el paso no tiene misión, su drill. Se decide
 *  acá, en el servidor, en las dos puntas — nunca la manda el cliente. */
async function pieceForStep(admin: ReturnType<typeof createAdminClient>, stepId: string) {
  const { data: pieces } = await admin
    .from('drills_missions')
    .select('id, title, type, success_criteria')
    .eq('step_id', stepId)
    .eq('active', true)
    .eq('student_visible', true)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });
  const piece =
    (pieces ?? []).find((p: any) => p.type === 'mission') ??
    (pieces ?? []).find((p: any) => p.type === 'drill') ??
    null;
  const criteria: string[] = Array.isArray(piece?.success_criteria) ? piece!.success_criteria : [];
  return { piece, criteria };
}

/** Última marca del coach por criterio, de ESTA pieza. */
async function latestCoachMarks(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  stepId: string,
  pieceId: string | null
) {
  const marks: Record<number, { result: CriterionResultValue; at: string }> = {};
  let q = admin
    .from('coach_criterion_evals')
    .select('criterion_index, result, evaluated_at')
    .eq('student_id', studentId)
    .eq('step_id', stepId);
  q = pieceId ? q.eq('drill_mission_id', pieceId) : q.is('drill_mission_id', null);
  const { data: prev } = await q.order('evaluated_at', { ascending: false }).limit(60);
  for (const r of prev ?? []) {
    const i = (r as any).criterion_index as number;
    if (!(i in marks)) marks[i] = { result: (r as any).result, at: (r as any).evaluated_at };
  }
  return marks;
}

export async function getStepCriterionContext(input: {
  studentId: string;
  stepId: string;
  portalToken?: string | null;
}): Promise<{
  ok: true;
  pieceId: string | null;
  pieceTitle: string | null;
  criteria: string[];
  coachMarks: Record<number, { result: CriterionResultValue; at: string }>;
  studentMarks: Record<number, { result: CriterionResultValue; at: string }>;
} | { ok: false; error: string }> {
  const coach = await coachFromContext(input.portalToken);
  if (!coach) return { ok: false, error: 'Not authenticated.' };
  if (!(await canTouchStudent(coach, input.studentId))) return { ok: false, error: 'Not authorized for this student.' };
  const admin = createAdminClient();

  const { piece, criteria } = await pieceForStep(admin, input.stepId);
  const coachMarks = await latestCoachMarks(admin, input.studentId, input.stepId, piece?.id ?? null);

  // Lo último que el alumno marcó solo en ESA misma pieza: los índices solo
  // significan lo mismo dentro de la misma tarjeta.
  const studentMarks: Record<number, { result: CriterionResultValue; at: string }> = {};
  if (piece) {
    const { data: last } = await admin
      .from('self_training_sessions')
      .select('created_at, criteria_evaluation')
      .eq('student_id', input.studentId)
      .eq('linked_drill_mission_id', piece.id)
      .not('criteria_evaluation', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    for (const c of ((last?.criteria_evaluation ?? []) as CriterionEvaluationItem[])) {
      if (c && Number.isInteger(c.criterion_index) && c.criterion_index < criteria.length) {
        studentMarks[c.criterion_index] = { result: c.result, at: last!.created_at };
      }
    }
  }

  return { ok: true, pieceId: piece?.id ?? null, pieceTitle: piece?.title ?? null, criteria, coachMarks, studentMarks };
}

export async function saveCoachCriterionEvals(input: {
  studentId: string;
  stepId: string;
  /** Solo informativo: la pieza se vuelve a resolver en el servidor. */
  pieceId?: string | null;
  marks: Mark[];
  portalToken?: string | null;
  campInstanceId?: string | null;
}): Promise<{ ok: true; nextFocus: string | null } | { ok: false; error: string }> {
  const coach = await coachFromContext(input.portalToken);
  if (!coach) return { ok: false, error: 'Not authenticated.' };
  if (!(await canTouchStudent(coach, input.studentId))) return { ok: false, error: 'Not authorized for this student.' };
  if (!Array.isArray(input.marks) || input.marks.length === 0 || input.marks.length > 20) {
    return { ok: false, error: 'Nothing to save.' };
  }
  const admin = createAdminClient();

  // El texto y la pieza salen de la tarjeta, nunca del cliente.
  const { piece, criteria: list } = await pieceForStep(admin, input.stepId);
  if (!piece || list.length === 0) return { ok: false, error: 'This step has no criteria to evaluate.' };

  // El camp solo se guarda si existe; un id inventado no se cuelga de nada.
  let campInstanceId: string | null = null;
  if (input.campInstanceId) {
    const { data: camp } = await admin.from('camp_instances').select('id').eq('id', input.campInstanceId).maybeSingle();
    campInstanceId = camp?.id ?? null;
  }

  const rows: any[] = [];
  const seen = new Set<number>();
  for (const m of input.marks) {
    if (!Number.isInteger(m.criterion_index) || m.criterion_index < 0 || m.criterion_index >= list.length) continue;
    if (!['met', 'partial', 'not_met'].includes(m.result) || seen.has(m.criterion_index)) continue;
    seen.add(m.criterion_index);
    rows.push({
      student_id: input.studentId,
      step_id: input.stepId,
      drill_mission_id: piece.id,
      criterion_index: m.criterion_index,
      criterion_text: list[m.criterion_index],
      result: m.result,
      coach_id: coach.id,
      camp_instance_id: campInstanceId,
    });
  }
  if (rows.length === 0) return { ok: false, error: 'No valid criteria to save.' };
  const { error } = await admin.from('coach_criterion_evals').insert(rows);
  if (error) return { ok: false, error: error.message };

  // El eslabón más flojo (el PRIMERO que no se logró) sobre la foto COMPLETA:
  // lo que ya había marcado antes más lo de ahora. Marcar hoy solo el 3 como
  // met no borra que el 1 sigue en not_met desde la semana pasada.
  const merged = await latestCoachMarks(admin, input.studentId, input.stepId, piece.id);
  for (const r of rows) merged[r.criterion_index] = { result: r.result, at: new Date().toISOString() };
  const weak = pickWeakestCriterion(
    Object.entries(merged)
      .map(([i, m]) => ({ criterion_index: Number(i), criterion_text: list[Number(i)] ?? '', result: m.result }))
      .filter((c) => c.criterion_text)
      .sort((a, b) => a.criterion_index - b.criterion_index)
  );

  let nextFocus: string | null = null;
  if (weak && weak.result !== 'met') {
    nextFocus = weak.criterion_text;
    await admin.from('students').update({ next_recommended_focus: nextFocus }).eq('id', input.studentId);
  } else {
    // Todo logrado: se limpia SOLO si el foco vigente era un criterio de esta
    // tarjeta. Un foco escrito a mano por otro coach no se toca.
    const { data: st } = await admin.from('students').select('next_recommended_focus').eq('id', input.studentId).maybeSingle();
    const current = (st as any)?.next_recommended_focus as string | null | undefined;
    if (current && list.includes(current)) {
      await admin.from('students').update({ next_recommended_focus: null }).eq('id', input.studentId);
    }
  }

  revalidatePath(`/students/${input.studentId}`);
  return { ok: true, nextFocus };
}
