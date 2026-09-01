// ═══ VENTA DEL LIBRO ONE WAVE — acceso automático al portal ═══
//
// OJO: este módulo NO es 'use server' a propósito — grantBookAccess otorga
// contenido pago y solo puede invocarse desde el servidor (el webhook de
// Wompi y la acción gateada del admin en book-admin.ts). Exponerla como
// server action pública dejaría que cualquiera se auto-otorgue el libro.
//
// Circuito (decisión Marcelo 2026-09-01): el comprador del libro ES un
// alumno más. Wompi cobra → su webhook pega en /api/book-purchase → acá se
// crea/encuentra al alumno por EMAIL, se le otorga el recurso One Wave
// (student_resource_grants — el mismo sistema de materiales del portal) y
// se le manda su link de portal por email. El libro "vive" en su Home, y
// el siguiente paso natural (quiz → curso → membresía) ya está ahí.
//
// Dedup por EMAIL solo (a diferencia del quiz, que exige email+nombre): en
// una compra el email del recibo ES la identidad del comprador.

import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';
import { sendBookDeliveryEmail } from './email';

/** coach_resources: "One Wave" (edición final, audience both). */
export const ONE_WAVE_RESOURCE_ID = 'f50677a2-72b1-4abd-9335-fe0c99c80333';

export async function grantBookAccess(input: {
  email: string;
  name?: string | null;
  phone?: string | null;
  /** De dónde vino (para el registro): 'wompi' | 'manual'. */
  source?: string;
}): Promise<{ ok: boolean; error?: string; portal_url?: string }> {
  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) return { ok: false, error: 'Valid email required.' };

  const admin = createAdminClient();

  // Nombre: "Nombre Apellido" del checkout → partimos con cuidado.
  const rawName = (input.name ?? '').trim().replace(/\s+/g, ' ');
  const firstName = rawName ? rawName.split(' ')[0] : 'Surfer';
  const lastName = rawName.split(' ').slice(1).join(' ');

  // Buscar por email (case-insensitive, activo más reciente primero).
  const { data: candidates } = await admin
    .from('students')
    .select('id, portal_token, first_name, status')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(5);
  let student = (candidates ?? []).find((s: any) => s.status === 'active') ?? (candidates ?? [])[0] ?? null;

  if (!student) {
    const { data: created, error } = await admin
      .from('students')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: input.phone?.trim() || null,
        portal_token: randomUUID(),
        lifecycle_status: 'lead',
        student_type: 'member',
        course_access_white: false,
        course_access_yellow: false,
        course_access_blue: false,
        current_sequence_number: 1,
        current_step_order: 1,
        status: 'active',
        waiver_signed: false,
      })
      .select('id, portal_token, first_name, status')
      .single();
    if (error) return { ok: false, error: error.message };
    student = created;
  }

  // Grant idempotente: comprar dos veces no duplica ni rompe.
  const { data: existing } = await admin
    .from('student_resource_grants')
    .select('id')
    .eq('student_id', student.id)
    .eq('resource_id', ONE_WAVE_RESOURCE_ID)
    .limit(1);
  if (!existing || existing.length === 0) {
    const { error: gErr } = await admin
      .from('student_resource_grants')
      .insert({ student_id: student.id, resource_id: ONE_WAVE_RESOURCE_ID });
    if (gErr) return { ok: false, error: gErr.message };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
  const portalUrl = `${base}/portal/${student.portal_token}`;

  // Email de entrega — nunca bloquea el grant.
  try {
    await sendBookDeliveryEmail({
      email,
      firstName: student.first_name || firstName,
      portalUrl,
    });
  } catch (e) {
    console.error('[grantBookAccess] delivery email failed', e);
  }

  console.log(`[book-purchase] granted · ${email} · source=${input.source ?? '?'}`);
  return { ok: true, portal_url: portalUrl };
}
