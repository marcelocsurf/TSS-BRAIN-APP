// ═══ /coach-portal/[token]/tools/[stepId] — ahora solo lleva a la página del paso ═══
// Era la "STP Library" de Herramientas (drills, misiones y ayudas visuales por
// paso). Desde el 2026-10-01 todo eso vive en Cursos › Teach the course, en la
// página de la secuencia del coach (la hoja del paso, "Coach · run it" con los
// criterios). Esta ruta se queda por los links guardados (planes, WhatsApp):
// mismos chequeos de acceso que /teach, y lleva al paso en su página; un paso
// sin página (Venue Analysis, Warm Up) abre su lección con la capa del coach.
import { parseFrom, encodeFrom, withFrom } from '@/lib/nav/origin';
import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { pageForStep } from '@/lib/sequence-pages/resolve';
import { coachTeachRank } from '@/lib/coach/teach-rank';
import { sequencePageRank } from '@/lib/coach/course-access';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CoachStpToolsPage({ params, searchParams }: { params: Promise<{ token: string; stepId: string }>; searchParams?: Promise<{ from?: string }> }) {
  const { token, stepId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  if (!UUID_RE.test(token) || !/^STP-\d+[A-Z]?$/.test(stepId)) notFound();

  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, course_access_granted, course_access_scope, max_belt_permission')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();

  // La cinta más baja que tiene el paso (como el plan del camp): STP-016 → White #3, no la entrada de Blue.
  const page = pageForStep({ stepId }, null);
  if (page && sequencePageRank(page) <= await coachTeachRank(admin, coach as any)) {
    const q = new URLSearchParams({ tab: 'review' });
    if (page.kind !== 'tool') q.set('focus', stepId);
    // El origen (?from=) sigue de largo: el Back de la página vuelve ahí.
    const from = parseFrom(sp?.from, 'coach');
    if (from) q.set('from', encodeFrom(from));
    redirect(`/coach-portal/${token}/seq/${page.id}?${q.toString()}`);
  }
  redirect(withFrom(`/coach-portal/${token}?tab=courses&lesson=${stepId}`, parseFrom(sp?.from, 'coach')));
}
