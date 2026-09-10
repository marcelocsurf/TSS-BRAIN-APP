'use server';
// ═══ Cambiar la cinta a mano desde la ficha (Marcelo 2026-09-10) ═══
// "Traté desde la bitácora del alumno pero no encontré ningún lugar para
// otorgarle el belt." Solo coordinador o admin. Es un override: no pasa por
// la regla del agua ni por la certificación del coach — es la decisión de la
// academia, y queda registrada como nota interna.
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

const BELTS = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];

export async function adminSetStudentBelt(studentId: string, belt: string, reason?: string | null): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me || !['admin', 'coordinator'].includes(String((me as any).role))) return { ok: false, error: 'Solo coordinación o admin.' };
  if (!BELTS.includes(belt)) return { ok: false, error: 'Cinta inválida.' };
  const admin = createAdminClient();
  const { data: before } = await admin.from('students').select('belt_level, coach_notes_general').eq('id', studentId).maybeSingle();
  if (!before) return { ok: false, error: 'Alumno no encontrado.' };
  if (before.belt_level === belt) return { ok: true };
  const stamp = `[${new Date().toISOString().slice(0, 10)}] Cinta: ${before.belt_level} → ${belt} (${(me as any).display_name ?? 'staff'})${reason?.trim() ? ` — ${reason.trim().slice(0, 200)}` : ''}`;
  const { error } = await admin.from('students').update({
    belt_level: belt,
    belt_provisional: false,
    coach_notes_general: [before.coach_notes_general, stamp].filter(Boolean).join('\n'),
  }).eq('id', studentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/students/${studentId}`);
  return { ok: true };
}
