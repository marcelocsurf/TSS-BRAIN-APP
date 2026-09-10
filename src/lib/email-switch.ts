// ═══ Interruptor por correo (Marcelo 2026-09-10) ═══
// Cada send*() pregunta acá antes de mandar. La tabla email_settings es la
// fuente; se cachea 30 s para no pegarle a la base en cada envío. Si la
// tabla no responde, se asume ENCENDIDO (nunca se pierde un correo por un
// fallo del interruptor) salvo para los kinds nuevos, que nacen apagados.
import { createAdminClient } from '@/lib/supabase/admin';

export type EmailKind =
  | 'portal_link' | 'intake_link' | 'booking_confirmation' | 'session_report' | 'coach_survey'
  | 'membership_expiry' | 'book_delivery' | 'welcome_enrolled' | 'day_feedback' | 'student_day_reminder'
  | 'quiz_lead' | 'assignment' | 'assignment_response' | 'service_reminder' | 'closure_reminder'
  | 'task_overdue' | 'coach_invite' | 'coach_welcome' | 'password_reset';

const NEW_KINDS: EmailKind[] = ['welcome_enrolled', 'day_feedback', 'student_day_reminder'];
let cache: { at: number; map: Map<string, boolean> } | null = null;

export async function emailEnabled(kind: EmailKind): Promise<boolean> {
  try {
    if (!cache || Date.now() - cache.at > 30_000) {
      const admin = createAdminClient();
      const { data } = await admin.from('email_settings').select('kind, enabled');
      cache = { at: Date.now(), map: new Map((data ?? []).map((r: any) => [r.kind, !!r.enabled])) };
    }
    const v = cache.map.get(kind);
    if (v === undefined) return !NEW_KINDS.includes(kind);
    return v;
  } catch {
    return !NEW_KINDS.includes(kind);
  }
}

export function resetEmailSwitchCache() { cache = null; }
