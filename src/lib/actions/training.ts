'use server';

// ═══ Capacitación de coaches · sesiones de prueba (Marcelo 2026-09-18) ═══
// Tres escenarios por coach (camp de 6 días, clase de surf, clase de skate)
// creados en la academia real, marcados is_test: mismo flujo natural del app
// (plan, dar la clase, cerrar, evaluación final) pero sin correos, encuestas,
// cintas ni nómina. Al terminar, "Borrar pruebas" limpia todo de un golpe.

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { createCampInstance } from '@/lib/actions/camps';

const SCENARIOS = [
  { key: 'camp', template_id: 'SVC-CAMP-WB-V2', label: 'Surf Camp · 6 días', days: 6, time: '08:00', modality: 'group' as const },
  { key: 'lesson', template_id: 'SVC-SL2', label: 'Clase de surf', days: 1, time: '14:00 - 15:30', modality: 'group' as const },
  { key: 'skate', template_id: 'SVC-SKATE-1', label: 'Clase de skate', days: 1, time: '16:00 - 17:00', modality: 'group' as const },
];

const STUDENTS_PER_COACH = 3;

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function slug(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12);
}

async function gate() {
  const me = await getCurrentCoach();
  if (!me || !['admin', 'coordinator'].includes(me.role) || !me.academy_id) return null;
  return me;
}

export async function listTrainingCoaches(): Promise<{ id: string; display_name: string; max_belt_permission: string | null }[]> {
  const me = await gate();
  if (!me) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('coaches')
    .select('id, display_name, max_belt_permission, role')
    .eq('academy_id', me.academy_id)
    .in('role', ['coach', 'coordinator', 'head_coach'])
    .order('display_name');
  return (data ?? []).map((c: any) => ({ id: c.id, display_name: String(c.display_name ?? '').trim(), max_belt_permission: c.max_belt_permission ?? null }));
}

export async function listTrainingScenarios(): Promise<Array<{ id: string; camp_name: string; start_date: string; end_date: string; status: string; coach: string | null; students: number; closed_days: number; total_days: number }>> {
  const me = await gate();
  if (!me) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, end_date, status, head_coach:head_coach_id(display_name), camp_participants(id, enrollment_status), camp_sessions(id, session_status)')
    .eq('academy_id', me.academy_id)
    .eq('is_test', true)
    .order('start_date')
    .order('camp_name');
  return (data ?? []).map((c: any) => {
    const hc = Array.isArray(c.head_coach) ? c.head_coach[0] : c.head_coach;
    const sess = c.camp_sessions ?? [];
    return {
      id: c.id, camp_name: c.camp_name, start_date: c.start_date, end_date: c.end_date, status: c.status,
      coach: hc?.display_name ?? null,
      students: (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length,
      closed_days: sess.filter((s: any) => s.session_status === 'completed').length,
      total_days: sess.length,
    };
  });
}

export async function createTrainingScenarios(input: { coachIds: string[]; startDate: string }): Promise<{ ok: boolean; error?: string; created?: number }> {
  const me = await gate();
  if (!me) return { ok: false, error: 'Solo coordinador o admin.' };
  if (!input.coachIds.length) return { ok: false, error: 'Elegí al menos un coach.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate)) return { ok: false, error: 'Fecha inválida.' };
  const admin = createAdminClient();

  const { data: coaches } = await admin.from('coaches').select('id, display_name').in('id', input.coachIds).eq('academy_id', me.academy_id);
  if (!coaches?.length) return { ok: false, error: 'Coaches no encontrados en tu academia.' };

  let created = 0;
  for (const coach of coaches as any[]) {
    const first = String(coach.display_name ?? 'Coach').trim().split(/\s+/)[0];
    const tag = slug(first) || 'coach';

    // Alumnos de prueba de ESTE coach (is_test): se crean una vez y se
    // reutilizan en los tres escenarios.
    const emails = Array.from({ length: STUDENTS_PER_COACH }, (_, i) => `marcelocsurf+prueba-${tag}${i + 1}@gmail.com`);
    const { data: existing } = await admin.from('students').select('id, email').in('email', emails);
    const byEmail = new Map((existing ?? []).map((s: any) => [s.email, s.id]));
    const studentIds: string[] = [];
    for (let i = 0; i < STUDENTS_PER_COACH; i++) {
      const email = emails[i];
      if (byEmail.has(email)) { studentIds.push(byEmail.get(email)!); continue; }
      const { data: st, error } = await admin.from('students').insert({
        first_name: 'Prueba',
        last_name: `${first} ${i + 1}`,
        email,
        belt_level: 'white_belt',
        academy_id: me.academy_id,
        is_test: true,
        emergency_contact_name: 'Prueba',
        emergency_contact_phone: '0000-0000',
        waiver_signed: true,
      }).select('id').single();
      if (error || !st) return { ok: false, error: `No se pudo crear alumno de prueba: ${error?.message ?? '?'}`, created };
      studentIds.push(st.id);
    }

    for (const sc of SCENARIOS) {
      const start = input.startDate;
      const end = addDays(start, sc.days - 1);
      const name = `PRUEBA · ${sc.label} · ${first}`;
      // ¿Ya existe este escenario para este coach en esa fecha? No duplicar.
      const { data: dup } = await admin.from('camp_instances').select('id').eq('academy_id', me.academy_id).eq('is_test', true).eq('camp_name', name).eq('start_date', start).limit(1);
      if (dup?.length) continue;
      let instance: any;
      try {
        instance = await createCampInstance({
          template_id: sc.template_id,
          camp_name: name,
          coach_id: coach.id,
          head_coach_id: coach.id,
          start_date: start,
          end_date: end,
          modality: sc.modality,
          student_ids: studentIds,
          scheduled_time: sc.time,
        });
      } catch (e: any) {
        return { ok: false, error: `${name}: ${e?.message ?? 'no se pudo crear'}`, created };
      }
      if (instance?.id) {
        await admin.from('camp_instances').update({ is_test: true, head_coach_status: 'accepted' }).eq('id', instance.id);
        created++;
      }
    }
  }
  revalidatePath('/camps');
  revalidatePath('/camps/training');
  return { ok: true, created };
}

export async function deleteTrainingScenarios(campIds?: string[]): Promise<{ ok: boolean; error?: string; deleted?: number }> {
  const me = await gate();
  if (!me) return { ok: false, error: 'Solo coordinador o admin.' };
  const admin = createAdminClient();
  let q = admin.from('camp_instances').select('id').eq('academy_id', me.academy_id).eq('is_test', true);
  if (campIds?.length) q = q.in('id', campIds);
  const { data: camps } = await q;
  const ids = (camps ?? []).map((c: any) => c.id);
  if (!ids.length) return { ok: true, deleted: 0 };

  // Lo que NO cae en cascada: resultados de sesión y encuestas de experiencia.
  const { data: sess } = await admin.from('camp_sessions').select('id').in('camp_instance_id', ids);
  const sessIds = (sess ?? []).map((s: any) => s.id);
  if (sessIds.length) {
    const { data: res } = await admin.from('student_session_results').select('id').in('camp_session_id', sessIds);
    const resIds = (res ?? []).map((r: any) => r.id);
    if (resIds.length) {
      await admin.from('survey_responses').delete().in('session_result_id', resIds);
      await admin.from('student_session_results').delete().in('id', resIds);
    }
  }
  await admin.from('camp_experience_surveys').delete().in('camp_instance_id', ids);
  await admin.from('belt_promotion_recommendations').delete().in('camp_instance_id', ids);
  const { error } = await admin.from('camp_instances').delete().in('id', ids);
  if (error) return { ok: false, error: error.message };

  // Alumnos de prueba que quedaron sin ningún servicio: fuera también.
  const { data: testStudents } = await admin.from('students').select('id').eq('is_test', true).like('email', 'marcelocsurf+prueba-%');
  for (const st of testStudents ?? []) {
    const { count } = await admin.from('camp_participants').select('id', { count: 'exact', head: true }).eq('student_id', st.id);
    if (!count) await admin.from('students').delete().eq('id', st.id);
  }
  revalidatePath('/camps');
  revalidatePath('/camps/training');
  return { ok: true, deleted: ids.length };
}
