'use server';

// ═══ COMUNIDAD: The Lineup ═══
//
// Plan cerrado con Marcelo (2026-08-14), construido 2026-08-29.
//
// CANAL, no foro: él postea para muchos. Sin comentarios, sin posts de
// miembros. Una sola reacción (la ola) — variedad de emojis se lee como
// red social a medio hacer; un canal con una reacción se lee limpio.
//
// Dos superficies: HOME = buzón (lo no leído, se vacía solo) · THE LINEUP =
// el archivo permanente, cuarta y última pestaña del portal.
//
// La excepción deliberada del vencido (decisión #5): al que se le venció la
// membresía NO se lo saca — sigue viendo los TÍTULOS sin poder abrirlos.
// Sacarlo hace que te olvide; mostrarle lo que se pierde es el recordatorio
// de renovación sin escribir un email.
//
// Invariante #2: {ok:false,error}, nunca throw. Invariante #3: el token ES
// el auth del portal; el gate de staff es coordinador o admin.

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type CommunityKind = 'note' | 'video' | 'live' | 'seminar';

export interface CommunityPostRow {
  id: string;
  kind: CommunityKind;
  title: string;
  body_md: string | null;
  video_url: string | null;
  event_at: string | null;
  event_link: string | null;
  recording_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  reactions: number;
}

// ── Staff: coordinador o admin ──────────────────────────────────

async function assertStaff(): Promise<{ me: any } | { error: string }> {
  const { getCurrentCoach, isCoordinatorOrAbove } = await import('@/lib/actions/auth');
  const me = await getCurrentCoach().catch(() => null);
  if (!me || !(await isCoordinatorOrAbove((me as any).role))) {
    return { error: 'Solo coordinador o admin.' };
  }
  return { me };
}

export async function listCommunityPosts(): Promise<
  { ok: true; posts: CommunityPostRow[] } | { ok: false; error: string }
> {
  const gate = await assertStaff();
  if ('error' in gate) return { ok: false, error: gate.error };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('community_posts')
    .select('id, kind, title, body_md, video_url, event_at, event_link, recording_url, published, published_at, created_at, community_reactions(count)')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  const posts = (data ?? []).map((p: any) => ({
    ...p,
    reactions: p.community_reactions?.[0]?.count ?? 0,
    community_reactions: undefined,
  }));
  return { ok: true, posts: posts as CommunityPostRow[] };
}

export async function saveCommunityPost(input: {
  id?: string | null;
  kind: CommunityKind;
  title: string;
  body_md?: string | null;
  video_url?: string | null;
  event_at?: string | null;
  event_link?: string | null;
  recording_url?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const gate = await assertStaff();
  if ('error' in gate) return { ok: false, error: gate.error };
  const title = (input.title ?? '').trim();
  if (title.length < 3) return { ok: false, error: 'El título es obligatorio.' };
  if ((input.kind === 'live' || input.kind === 'seminar') && !input.event_at) {
    return { ok: false, error: 'Un live/seminario necesita fecha y hora.' };
  }
  const admin = createAdminClient();
  const row = {
    kind: input.kind,
    title,
    body_md: input.body_md?.trim() || null,
    video_url: input.video_url?.trim() || null,
    event_at: input.event_at || null,
    event_link: input.event_link?.trim() || null,
    recording_url: input.recording_url?.trim() || null,
    academy_id: (gate.me as any).academy_id ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.id) {
    const { error } = await admin.from('community_posts').update(row).eq('id', input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/community');
    return { ok: true, id: input.id };
  }
  const { data, error } = await admin
    .from('community_posts')
    .insert({ ...row, created_by: (gate.me as any).id ?? null })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'No se pudo crear.' };
  revalidatePath('/community');
  return { ok: true, id: data.id };
}

export async function setCommunityPostPublished(
  id: string,
  published: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const gate = await assertStaff();
  if ('error' in gate) return { ok: false, error: gate.error };
  const admin = createAdminClient();
  // La fecha de publicación se fija UNA sola vez: despublicar y volver a
  // publicar no lo sube al tope del archivo.
  const { data: cur } = await admin
    .from('community_posts')
    .select('published_at')
    .eq('id', id)
    .maybeSingle();
  const { error } = await admin
    .from('community_posts')
    .update({
      published,
      ...(published && !cur?.published_at ? { published_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/community');
  return { ok: true };
}

export async function deleteCommunityPost(id: string): Promise<{ ok: boolean; error?: string }> {
  const gate = await assertStaff();
  if ('error' in gate) return { ok: false, error: gate.error };
  const admin = createAdminClient();
  const { error } = await admin.from('community_posts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/community');
  return { ok: true };
}

// ── Portal del alumno (token) ───────────────────────────────────

export interface LineupPost {
  id: string;
  kind: CommunityKind;
  title: string;
  /** null cuando está bloqueado (membresía vencida). */
  body_md: string | null;
  video_url: string | null;
  event_at: string | null;
  event_link: string | null;
  recording_url: string | null;
  published_at: string | null;
  reactions: number;
  reacted: boolean;
  read: boolean;
  /** true = membresía vencida: ve el título, no el contenido. */
  locked: boolean;
}

export interface LineupData {
  posts: LineupPost[];
  unread: number;
  /** false = membresía vencida (la excepción deliberada: ve títulos). */
  memberActive: boolean;
  /** Reloj del SERVIDOR al cargar: el corte "ya pasó / viene" se decide con
   *  este valor en SSR y en el cliente por igual — con new Date() en el
   *  render, un live en el borde cambiaba de sección entre servidor y
   *  navegador y rompía la hidratación. */
  loadedAt: string;
}

async function studentByToken(admin: any, token: string) {
  const { data } = await admin
    .from('students')
    .select('id')
    .eq('portal_token', token)
    .maybeSingle();
  return data as { id: string } | null;
}

/** ¿Membresía vigente? Sin filas de membresía = vigente (legado: los alumnos
 *  de antes del sistema de membresías usan el portal normal). */
async function memberIsActive(admin: any, studentId: string): Promise<boolean> {
  const { data, error } = await admin
    .from('memberships')
    .select('ends_at')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('ends_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return true; // la comunidad nunca bloquea por un error de lectura
  if (!data?.ends_at) return true; // nunca tuvo membresía → legado, vigente
  return new Date(data.ends_at) > new Date();
}

export async function getLineup(
  token: string,
): Promise<{ ok: true; data: LineupData } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: 'Missing token.' };
  const admin = createAdminClient();
  const student = await studentByToken(admin, token);
  if (!student) return { ok: false, error: 'Student not found.' };

  const [{ data: posts, error }, active, { data: myReactions }, { data: myReads }] =
    await Promise.all([
      admin
        .from('community_posts')
        .select('id, kind, title, body_md, video_url, event_at, event_link, recording_url, published_at, community_reactions(count)')
        .eq('published', true)
        .order('published_at', { ascending: false })
        // El archivo crece sin tope; el portal no necesita más que esto por
        // carga. Cuando haya 200+ piezas, paginar.
        .limit(100),
      memberIsActive(admin, student.id),
      admin.from('community_reactions').select('post_id').eq('student_id', student.id),
      admin.from('community_reads').select('post_id').eq('student_id', student.id),
    ]);
  if (error) return { ok: false, error: error.message };

  const reactedSet = new Set((myReactions ?? []).map((r: any) => r.post_id));
  const readSet = new Set((myReads ?? []).map((r: any) => r.post_id));

  const rows: LineupPost[] = (posts ?? []).map((p: any) => {
    const locked = !active;
    return {
      id: p.id,
      kind: p.kind,
      title: p.title,
      // El vencido ve el título y la fecha — el contenido no viaja.
      body_md: locked ? null : p.body_md,
      video_url: locked ? null : p.video_url,
      event_at: p.event_at,
      event_link: locked ? null : p.event_link,
      recording_url: locked ? null : p.recording_url,
      published_at: p.published_at,
      reactions: p.community_reactions?.[0]?.count ?? 0,
      reacted: reactedSet.has(p.id),
      read: readSet.has(p.id),
      locked,
    };
  });

  return {
    ok: true,
    data: {
      posts: rows,
      unread: rows.filter((r) => !r.read).length,
      memberActive: active,
      loadedAt: new Date().toISOString(),
    },
  };
}

/** Marca como leídos los posts que el alumno REALMENTE tuvo en pantalla.
 *  Recibe los ids que su carga trajo: lo publicado DESPUÉS de que abrió el
 *  portal no se marca — un post que nunca vio no puede quedar "leído". */
export async function markLineupRead(
  token: string,
  postIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: 'Missing token.' };
  const ids = (postIds ?? []).filter((x) => typeof x === 'string').slice(0, 200);
  if (!ids.length) return { ok: true };
  const admin = createAdminClient();
  const student = await studentByToken(admin, token);
  if (!student) return { ok: false, error: 'Student not found.' };
  // Solo ids que existen y están publicados — el cliente no dicta filas.
  const { data: posts } = await admin
    .from('community_posts')
    .select('id')
    .eq('published', true)
    .in('id', ids);
  const valid = (posts ?? []).map((p: any) => p.id);
  if (!valid.length) return { ok: true };
  const { error } = await admin.from('community_reads').upsert(
    valid.map((post_id: string) => ({ post_id, student_id: student.id })),
    { onConflict: 'post_id,student_id', ignoreDuplicates: true },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Reaccionar (o quitar la reacción) a un post. Solo con membresía vigente. */
export async function toggleReaction(
  token: string,
  postId: string,
): Promise<{ ok: true; reacted: boolean } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: 'Missing token.' };
  const admin = createAdminClient();
  const student = await studentByToken(admin, token);
  if (!student) return { ok: false, error: 'Student not found.' };
  if (!(await memberIsActive(admin, student.id))) {
    return { ok: false, error: 'Renew your membership to join in.' };
  }
  // Solo a lo PUBLICADO: el id de un post viajó a los portales antes de
  // despublicarse — sin este gate se podía seguir reaccionando a contenido
  // retirado e inflar el contador que ve el staff.
  const { data: target } = await admin
    .from('community_posts')
    .select('id')
    .eq('id', postId)
    .eq('published', true)
    .maybeSingle();
  if (!target) return { ok: false, error: 'This post is no longer available.' };
  const { data: existing } = await admin
    .from('community_reactions')
    .select('post_id')
    .eq('post_id', postId)
    .eq('student_id', student.id)
    .maybeSingle();
  if (existing) {
    const { error } = await admin
      .from('community_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('student_id', student.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, reacted: false };
  }
  const { error } = await admin
    .from('community_reactions')
    .insert({ post_id: postId, student_id: student.id });
  if (error) return { ok: false, error: error.message };
  return { ok: true, reacted: true };
}
