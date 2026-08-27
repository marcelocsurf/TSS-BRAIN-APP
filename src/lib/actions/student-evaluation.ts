'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Cerrar una evaluación hecha FUERA de un camp, desde la ficha del alumno.
 *
 * Es la misma evaluación de la cinta; cerrar un camp es solo uno de los
 * momentos en que se corre. El acta se guarda en camp_final_evaluations con
 * camp_instance_id null (migración 00172), así aparece en el historial del
 * alumno junto a las de los camps.
 *
 * El "qué trabajar después" es OBLIGATORIO, igual que al cerrar un camp: es
 * lo que el alumno ve y con lo que el próximo coach planea.
 */
export async function closeStudentEvaluation(input: {
  studentId: string;
  coachId: string;
  nextFocus: string;
  studentVisibleNote?: string;
  coachPrivateNote?: string;
  readinessSummary?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const focus = (input.nextFocus ?? '').trim();
  if (focus.length < 5) {
    return {
      ok: false,
      error:
        'Falta "qué trabajar después". Es obligatorio: el alumno lo ve y el próximo coach planea con eso.',
    };
  }

  const admin = createAdminClient();

  const { error } = await admin.from('camp_final_evaluations').insert({
    camp_instance_id: null,
    student_id: input.studentId,
    coach_id: input.coachId,
    areas_to_improve: focus,
    student_visible_note: input.studentVisibleNote?.trim() || null,
    coach_private_note: input.coachPrivateNote?.trim() || null,
    readiness_summary: input.readinessSummary?.trim() || null,
    finalized_at: new Date().toISOString(),
  });
  // La columna puede seguir siendo NOT NULL (migración 00172 sin aplicar):
  // se devuelve el error, no se lanza (invariante #2).
  if (error) return { ok: false, error: error.message };

  // El foco también viaja al portal del alumno, como al cerrar un camp.
  await admin
    .from('students')
    .update({ next_recommended_focus: focus })
    .eq('id', input.studentId);

  revalidatePath(`/students/${input.studentId}`);
  return { ok: true };
}
