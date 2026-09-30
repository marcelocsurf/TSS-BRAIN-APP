// ═══ /coach-portal/[token]/teach/[seqId] — ahora solo lleva a LA página ═══
// Teach it (Marcelo 2026-09-24: "las herramientas van HACIA la secuencia") vive
// desde el 2026-09-30 dentro de la página de la secuencia del coach: la barra
// (Present · Videos), "Coach · say it", "Coach · run it" (drills, misiones y
// juegos) y la hoja de cada paso (Say it · Show it · Run it · Watch for). Esta
// ruta se queda porque hay links guardados (WhatsApp, planes): mantiene los
// mismos chequeos de acceso y lleva a la página con el paso que traía.
import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { sequencePageFor } from '@/lib/sequence-pages';
import { coachTeachRank } from '@/lib/coach/teach-rank';
import { sequencePageRank } from '@/lib/coach/course-access';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CoachTeachPage({ params, searchParams }: {
  params: Promise<{ token: string; seqId: string }>;
  searchParams?: Promise<{ focus?: string; from?: string }>;
}) {
  const { token, seqId } = await params;
  const sp = searchParams ? await searchParams : {};
  const cfg = sequencePageFor(seqId);
  if (!cfg || !UUID_RE.test(token)) notFound();

  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, course_access_granted, course_access_scope, max_belt_permission')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();
  // Hasta su cinta (+ la de sus camps), 2026-09-29.
  if (sequencePageRank(cfg) > await coachTeachRank(admin, coach as any)) notFound();

  const q = new URLSearchParams();
  if (sp.focus) { q.set('tab', 'review'); q.set('focus', sp.focus); }
  if (sp.from) q.set('from', sp.from);
  redirect(`/coach-portal/${token}/seq/${cfg.id}${q.toString() ? `?${q.toString()}` : ''}`);
}
