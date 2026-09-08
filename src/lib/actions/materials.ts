'use server';

// Abrir un material desde el portal del alumno: valida token + grant y
// devuelve la URL con un ticket de 10 minutos (ver src/lib/materials/ticket.ts).
import { createAdminClient } from '@/lib/supabase/admin';
import { signMaterialTicket } from '@/lib/materials/ticket';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function openMaterial(
  token: string,
  resourceId: string,
): Promise<{ ok: true; url: string; title: string } | { ok: false; error: string }> {
  if (!UUID_RE.test(token) || !UUID_RE.test(resourceId)) return { ok: false, error: 'Not available.' };
  const admin = createAdminClient();
  const { data: student } = await admin.from('students').select('id').eq('portal_token', token).maybeSingle();
  if (!student) return { ok: false, error: 'Not available.' };
  const { data: resource } = await admin
    .from('coach_resources')
    .select('id, title, active, audience')
    .eq('id', resourceId)
    .maybeSingle();
  if (!resource || !resource.active || resource.audience === 'coaches') return { ok: false, error: 'Not available.' };
  const { data: grant } = await admin
    .from('student_resource_grants')
    .select('student_id')
    .eq('student_id', student.id)
    .eq('resource_id', resourceId)
    .maybeSingle();
  if (!grant) return { ok: false, error: 'Not available.' };
  const t = signMaterialTicket(student.id, resourceId);
  return { ok: true, url: `/api/materials/${token}/${resourceId}?t=${t}`, title: resource.title || 'Material' };
}
