'use server';
// ═══ La MISMA evaluación final, desde la ficha (Marcelo 2026-09-10) ═══
// "Que sea un botón para aplicar la mismísima evaluación que se le aplica al
// final del camp: nivel, si es autónomo o no, etc." Misma pantalla
// (FinalCampEvaluation) y los mismos efectos que closeCampFinal por alumno:
// estrellas oficiales, acta, next focus, nivel de océano y cinta (con la
// certificación del coach y la regla del agua). Sin camp, sin encuesta.
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { BELT_RANK, canCoachBelt, type BeltLevel } from '@/lib/constants/belts';
import { waterRuleBlocker } from '@/lib/constants/graduation';
import { revalidatePath } from 'next/cache';

export async function closeStandaloneEvaluation(
  studentId: string,
  ratings: Array<{ student_id: string; step_id: string; rating: number }>,
  results: Array<{ student_id: string; approved: boolean; readiness_summary?: string; ocean_level?: string; student_visible_note: string; coach_private_note?: string; next_focus?: string }>,
  promotions: Array<{ student_id: string; belt_level: string }>,
): Promise<{ ok: boolean; error?: string; waterPending?: string[] }> {
  const coach = await getCurrentCoach();
  if (!coach) return { ok: false, error: 'Coach not found.' };
  const admin = createAdminClient();
  const result = results.find((r) => r.student_id === studentId);
  if (!result) return { ok: false, error: 'Nothing to save.' };
  if ((result.next_focus ?? '').trim().length < 5) return { ok: false, error: 'Write the next focus — the student sees it.' };
  const waterPending: string[] = [];
  const now = new Date().toISOString();

  // 1. Estrellas oficiales
  const own = ratings.filter((r) => r.student_id === studentId);
  if (own.length) {
    const { error } = await admin.from('student_step_ratings').upsert(
      own.map((r) => ({ student_id: studentId, step_id: r.step_id, coach_rating: r.rating, coach_rated_at: now, coach_rated_by: (coach as any).id, last_updated: now })),
      { onConflict: 'student_id,step_id' },
    );
    if (error) return { ok: false, error: error.message };
  }
  const meetsBar = own.length === 0 || own.every((r) => r.rating >= 4);

  // 2. Acta
  const promo = promotions.find((p) => p.student_id === studentId) ?? null;
  const { error: actaErr } = await admin.from('standalone_evaluations').insert({
    student_id: studentId,
    coach_id: (coach as any).id,
    approved: result.approved && meetsBar,
    readiness_summary: result.readiness_summary || null,
    ocean_level_recommendation: result.ocean_level || null,
    student_visible_note: result.student_visible_note || null,
    coach_private_note: result.coach_private_note || null,
    areas_to_improve: result.next_focus?.trim() || null,
    target_belt: promo?.belt_level ?? null,
    promoted: false,
  });
  if (actaErr) return { ok: false, error: actaErr.message };

  // 3. Next focus → lo ve el alumno y el próximo coach
  await admin.from('students').update({ next_recommended_focus: result.next_focus!.trim() }).eq('id', studentId);

  // 4. Nivel de océano (autonomía) — mismo camino que el cierre del camp
  const { data: stu } = await admin.from('students').select('first_name, belt_level, ocean_level, ocean_level_provisional').eq('id', studentId).single();
  if (result.ocean_level) {
    if (stu?.ocean_level === result.ocean_level) {
      if (stu?.ocean_level_provisional !== false) await admin.from('students').update({ ocean_level_provisional: false }).eq('id', studentId);
    } else {
      await admin.from('ocean_level_evaluations').insert({ student_id: studentId, evaluated_by: (coach as any).id, previous_level: stu?.ocean_level ?? null, new_level: result.ocean_level, method: 'evaluation', notes: 'Level evaluation (standalone)' });
      await admin.from('students').update({ ocean_level: result.ocean_level, ocean_level_provisional: false }).eq('id', studentId);
    }
  }

  // 5. Cinta — solo hacia arriba, con la certificación del coach y la regla del agua
  if (promo && promo.belt_level in BELT_RANK) {
    const newBelt = promo.belt_level as BeltLevel;
    const currentRank = stu?.belt_level ? BELT_RANK[stu.belt_level as BeltLevel] ?? 0 : 0;
    if (BELT_RANK[newBelt] > currentRank) {
      const { data: fresh } = await admin.from('students').select('ocean_level, ocean_level_provisional').eq('id', studentId).single();
      const waterBlock = waterRuleBlocker(newBelt, fresh?.ocean_level, fresh?.ocean_level_provisional);
      const cap = (((coach as any).max_belt_permission as BeltLevel) || 'black_belt');
      const authorized = ((coach as any).role === 'admin' || canCoachBelt(cap, newBelt)) && !waterBlock;
      if (waterBlock) waterPending.push(stu?.first_name ?? 'The student');
      if (authorized) {
        await admin.from('students').update({ belt_level: newBelt, belt_provisional: false, belt_promoted_at: now, belt_promoted_from: stu?.belt_level ?? null }).eq('id', studentId);
        await admin.from('standalone_evaluations').update({ promoted: true }).eq('student_id', studentId).eq('coach_id', (coach as any).id).gte('created_at', now.slice(0, 19));
      }
    }
  }
  revalidatePath(`/students/${studentId}`);
  return { ok: true, waterPending };
}
