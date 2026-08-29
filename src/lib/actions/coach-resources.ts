'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

export interface CoachResource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  kind: string;
  /** Posición en el curso ordenado. null = sin ordenar (va al final). */
  sort_order?: number | null;
}

/** El orden del CURSO: sort_order primero (null al final), después título. */
function byCourseOrder<T extends { sort_order?: number | null; title: string }>(rows: T[]): T[] {
  return rows.slice().sort((a, b) => {
    const sa = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const sb = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (sa !== sb) return sa - sb;
    return (a.title ?? '').localeCompare(b.title ?? '');
  });
}

async function assertAdmin() {
  const me = await getCurrentCoach().catch(() => null);
  const platform = await isRealPlatformAdmin().catch(() => false);
  if (!platform && (me as any)?.role !== 'admin') {
    throw new Error('Only an admin can manage presentations.');
  }
}

// Coach portal (token-based): the presentations granted to THIS coach.
export async function getMyCoachResources(portalToken: string): Promise<CoachResource[]> {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (!coach) return [];

  const { data } = await admin
    .from('coach_resource_grants')
    .select('coach_resources!inner(id, title, description, file_url, storage_path, kind, active, sort_order)')
    .eq('coach_id', coach.id);

  const rows = byCourseOrder(
    (data ?? [])
      .map((r: any) => r.coach_resources)
      .filter((r: any) => r && r.active),
  );

  // La URL que ve el cliente es SIEMPRE la del propio app. La signed URL del
  // bucket ya no se emite acá: la mintea /api/materials en el servidor, después
  // de revalidar el grant, y nunca llega al navegador. Ver el route handler.
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    file_url: `/api/materials/${portalToken}/${r.id}`,
    kind: r.kind,
    sort_order: r.sort_order ?? null,
  }));
}

// Admin: upload a new presentation (PDF) into the private bucket + register it.
export async function createCoachResource(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  if (!file || !title) return { ok: false, error: 'A PDF file and a title are required.' };
  if (file.type && file.type !== 'application/pdf') return { ok: false, error: 'Please upload a PDF.' };

  const admin = createAdminClient();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'deck';
  const path = `${slug}-${Date.now()}.pdf`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await admin.storage
    .from('coach-presentations')
    .upload(path, bytes, { contentType: 'application/pdf', upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  const audience = ((formData.get('audience') as string | null) || 'both') as 'coaches' | 'students' | 'both';
  const { error } = await admin
    .from('coach_resources')
    .insert({ title, description, file_url: '', storage_path: path, kind: 'pdf', audience });
  if (error) {
    // Pre-migration fallback: audience column not there yet.
    const { error: e2 } = await admin
      .from('coach_resources')
      .insert({ title, description, file_url: '', storage_path: path, kind: 'pdf' });
    if (e2) return { ok: false, error: e2.message };
  }

  revalidatePath('/presentations');
  return { ok: true };
}

// Admin: delete a presentation (bucket file + row + its grants cascade).
export async function deleteCoachResource(id: string): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const { data: r } = await admin.from('coach_resources').select('storage_path').eq('id', id).maybeSingle();
  if (r?.storage_path) {
    await admin.storage.from('coach-presentations').remove([r.storage_path]).catch(() => {});
  }
  const { error } = await admin.from('coach_resources').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/presentations');
  return { ok: true };
}

// Admin: every published presentation.
export async function listCoachResources(): Promise<CoachResource[]> {
  await assertAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from('coach_resources')
    .select('id, title, description, file_url, kind')
    .eq('active', true)
    .order('created_at');
  return (data ?? []) as CoachResource[];
}

// ─────────────────────────────────────────────────────────────
// Presentations for STUDENTS (same decks, granted per student).
// All reads are guarded so the app keeps working even before the
// student_resource_grants table exists (returns empty instead of throwing).
// ─────────────────────────────────────────────────────────────

// Student portal (token-based): the presentations granted to THIS student.
export async function getMyStudentResources(portalToken: string): Promise<CoachResource[]> {
  try {
    const admin = createAdminClient();
    const { data: student } = await admin
      .from('students')
      .select('id')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (!student) return [];

    let { data, error } = await admin
      .from('student_resource_grants')
      .select('coach_resources!inner(id, title, description, file_url, storage_path, kind, audience, active, sort_order)')
      .eq('student_id', student.id);
    if (error) {
      const retry = await admin
        .from('student_resource_grants')
        .select('coach_resources!inner(id, title, description, file_url, storage_path, kind, active)')
        .eq('student_id', student.id);
      if (retry.error) return [];
      data = retry.data as any;
    }

    // CURSO ORDENADO (backlog acordado): el alumno las recorre en el orden
    // que Marcelo definió en la biblioteca, no en el orden de subida.
    const rows = byCourseOrder(
      (data ?? [])
        .map((r: any) => r.coach_resources)
        .filter((r: any) => r && r.active && r.audience !== 'coaches'),
    );

    // Igual que en el lado coach: la URL es del app, no del bucket.
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      file_url: `/api/materials/${portalToken}/${r.id}`,
      kind: r.kind,
      sort_order: r.sort_order ?? null,
    }));
  } catch {
    return [];
  }
}

// Admin: which presentation ids a given student currently has.
export async function listStudentResourceGrants(studentId: string): Promise<string[]> {
  await assertAdmin();
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('student_resource_grants')
      .select('resource_id')
      .eq('student_id', studentId);
    if (error) return [];
    return (data ?? []).map((r: any) => r.resource_id);
  } catch {
    return [];
  }
}

// Audience guard (M143): who a resource may be granted to. Soft — if the
// column doesn't exist yet, everything is allowed.
async function resourceAudience(resourceId: string): Promise<string> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('coach_resources').select('audience').eq('id', resourceId).maybeSingle();
    if (error) return 'both';
    return (data as any)?.audience ?? 'both';
  } catch { return 'both'; }
}

// Admin: grant or revoke one presentation for one student.
export async function setStudentResourceGrant(
  studentId: string,
  resourceId: string,
  granted: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  if (granted) {
    if ((await resourceAudience(resourceId)) === 'coaches') {
      return { ok: false, error: 'This resource is for coaches only.' };
    }
    const { error } = await admin
      .from('student_resource_grants')
      .upsert({ student_id: studentId, resource_id: resourceId }, { onConflict: 'student_id,resource_id' });
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from('student_resource_grants')
      .delete()
      .eq('student_id', studentId)
      .eq('resource_id', resourceId);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/students/${studentId}`);
  return { ok: true };
}

// Admin: which presentation ids a given coach currently has.
export async function listCoachGrants(coachId: string): Promise<string[]> {
  await assertAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from('coach_resource_grants')
    .select('resource_id')
    .eq('coach_id', coachId);
  return (data ?? []).map((r: any) => r.resource_id);
}

// Admin: grant or revoke one presentation for one coach.
export async function setCoachResourceGrant(
  coachId: string,
  resourceId: string,
  granted: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  if (granted) {
    if ((await resourceAudience(resourceId)) === 'students') {
      return { ok: false, error: 'This resource is for students only.' };
    }
    const { error } = await admin
      .from('coach_resource_grants')
      .upsert({ coach_id: coachId, resource_id: resourceId }, { onConflict: 'coach_id,resource_id' });
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from('coach_resource_grants')
      .delete()
      .eq('coach_id', coachId)
      .eq('resource_id', resourceId);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/coaches/${coachId}`);
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN LIBRARY (M142) — one place to see every resource, add videos and
// links alongside PDFs, and grant access to any coach or student.
// ═══════════════════════════════════════════════════════════════════

export interface LibraryItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  storage_path: string | null;
  kind: string; // pdf | video | link
  audience: string; // coaches | students | both
  active: boolean;
  created_at: string;
  coachIds: string[];
  studentIds: string[];
  /** Posición en el curso ordenado (null = sin ordenar, va al final). */
  sort_order: number | null;
  /** Short-lived signed URL for stored files (else external file_url). */
  open_url: string | null;
}

export interface LibraryOverview {
  items: LibraryItem[];
  coaches: { id: string; name: string }[];
  students: { id: string; name: string }[];
}

// Everything the Library page needs in one call. Roster is scoped to the
// acting academy (platform admin act-as included); platform admin with no
// academy context sees everyone.
export async function getLibraryOverview(): Promise<LibraryOverview> {
  await assertAdmin();
  const admin = createAdminClient();
  const me = await getCurrentCoach().catch(() => null);
  const academyId = (me as any)?.academy_id ?? null;

  // audience column is new (00137) — retry without it pre-migration.
  let resources: any[] | null = null;
  const first = await admin
    .from('coach_resources')
    .select('id, title, description, file_url, storage_path, kind, audience, active, created_at, sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  resources = first.data as any[] | null;
  if (first.error) {
    const retry = await admin
      .from('coach_resources')
      .select('id, title, description, file_url, storage_path, kind, active, created_at')
      .order('created_at', { ascending: false });
    resources = retry.data as any[] | null;
  }
  const [{ data: cGrants }, { data: sGrants }] = await Promise.all([
    admin.from('coach_resource_grants').select('coach_id, resource_id'),
    admin.from('student_resource_grants').select('student_id, resource_id'),
  ]);

  let coachQ = admin.from('coaches').select('id, display_name').eq('active_status', true).order('display_name');
  if (academyId) coachQ = coachQ.eq('academy_id', academyId);
  let studentQ = admin.from('students').select('id, first_name, last_name').eq('status', 'active').order('first_name');
  if (academyId) studentQ = studentQ.eq('academy_id', academyId);
  const [{ data: coaches }, { data: students }] = await Promise.all([coachQ, studentQ]);

  const cByRes = new Map<string, string[]>();
  for (const g of cGrants ?? []) {
    const arr = cByRes.get(g.resource_id) ?? [];
    arr.push(g.coach_id);
    cByRes.set(g.resource_id, arr);
  }
  const sByRes = new Map<string, string[]>();
  for (const g of sGrants ?? []) {
    const arr = sByRes.get(g.resource_id) ?? [];
    arr.push(g.student_id);
    sByRes.set(g.resource_id, arr);
  }

  const items: LibraryItem[] = [];
  for (const r of resources ?? []) {
    let openUrl: string | null = r.file_url || null;
    if (r.storage_path) {
      const { data: signed } = await admin.storage
        .from('coach-presentations')
        .createSignedUrl(r.storage_path, 60 * 60);
      if (signed?.signedUrl) openUrl = signed.signedUrl;
    }
    items.push({
      ...r,
      audience: (r as any).audience ?? 'both',
      coachIds: cByRes.get(r.id) ?? [],
      studentIds: sByRes.get(r.id) ?? [],
      sort_order: (r as any).sort_order ?? null,
      open_url: openUrl,
    });
  }

  return {
    items,
    coaches: (coaches ?? []).map((c: any) => ({ id: c.id, name: c.display_name })),
    students: (students ?? []).map((s: any) => ({ id: s.id, name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() })),
  };
}

// Add a VIDEO or LINK item (external URL — no upload).
export async function createLinkResource(input: {
  title: string;
  description?: string | null;
  kind: 'video' | 'link';
  url: string;
  audience?: 'coaches' | 'students' | 'both';
}): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const title = input.title?.trim();
  const url = input.url?.trim();
  if (!title || !url) return { ok: false, error: 'Title and URL are required.' };
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: 'The URL must start with http(s)://.' };
  const admin = createAdminClient();
  const { error } = await admin
    .from('coach_resources')
    .insert({ title, description: input.description?.trim() || null, file_url: url, storage_path: null, kind: input.kind, audience: input.audience ?? 'both' });
  if (error) {
    // Pre-migration fallback: audience column not there yet.
    const { error: e2 } = await admin
      .from('coach_resources')
      .insert({ title, description: input.description?.trim() || null, file_url: url, storage_path: null, kind: input.kind });
    if (e2) return { ok: false, error: e2.message };
  }
  revalidatePath('/library');
  return { ok: true };
}

// Bulk grant: give one resource to every coach or every student in scope.
export async function grantResourceToAll(
  resourceId: string,
  audience: 'coaches' | 'students',
): Promise<{ ok: boolean; count?: number; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const me = await getCurrentCoach().catch(() => null);
  const academyId = (me as any)?.academy_id ?? null;

  const allowed = await resourceAudience(resourceId);
  if (audience === 'students' && allowed === 'coaches') return { ok: false, error: 'This resource is for coaches only.' };
  if (audience === 'coaches' && allowed === 'students') return { ok: false, error: 'This resource is for students only.' };

  if (audience === 'coaches') {
    let q = admin.from('coaches').select('id').eq('active_status', true);
    if (academyId) q = q.eq('academy_id', academyId);
    const { data } = await q;
    const rows = (data ?? []).map((c: any) => ({ coach_id: c.id, resource_id: resourceId }));
    if (rows.length === 0) return { ok: true, count: 0 };
    const { error } = await admin.from('coach_resource_grants').upsert(rows, { onConflict: 'coach_id,resource_id' });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/library');
    return { ok: true, count: rows.length };
  }
  let q = admin.from('students').select('id').eq('status', 'active');
  if (academyId) q = q.eq('academy_id', academyId);
  const { data } = await q;
  const rows = (data ?? []).map((s: any) => ({ student_id: s.id, resource_id: resourceId }));
  if (rows.length === 0) return { ok: true, count: 0 };
  const { error } = await admin.from('student_resource_grants').upsert(rows, { onConflict: 'student_id,resource_id' });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/library');
  return { ok: true, count: rows.length };
}

// Archive / restore without deleting (keeps grants + history).
/** Fija la posición de una pieza en el curso ordenado. null = sin ordenar. */
export async function setResourceSortOrder(id: string, sortOrder: number | null): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const admin = createAdminClient();
    const val = sortOrder == null || !Number.isFinite(sortOrder) ? null : Math.max(1, Math.round(sortOrder));
    const { error } = await admin.from('coach_resources').update({ sort_order: val }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/library');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'No se pudo guardar el orden.' };
  }
}

export async function setResourceActive(id: string, active: boolean): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('coach_resources').update({ active }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/library');
  return { ok: true };
}

// ── Seller 2B: link a deck to service templates as their "selling process" ──

export interface DeckTemplate {
  id: string;
  template_name: string;
  service_kind: string | null;
  sales_deck_resource_id: string | null;
  video_url: string | null;
}

// Admin: active service templates with their current sales deck (if any).
export async function listTemplatesForDecks(): Promise<DeckTemplate[]> {
  await assertAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from('camp_templates')
    .select('id, template_name, service_kind, sales_deck_resource_id, video_url')
    .eq('active_status', true)
    .order('template_name');
  return (data ?? []) as DeckTemplate[];
}

// Admin: point a template at a deck (or clear it with null).
export async function setTemplateSalesDeck(templateId: string, resourceId: string | null): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from('camp_templates')
    .update({ sales_deck_resource_id: resourceId })
    .eq('id', templateId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/presentations');
  return { ok: true };
}

// ── Subida DIRECTA al storage (#15) — sin el límite de 4.5MB de Vercel ──
// Paso 1: URL firmada. Paso 2 (browser sube). Paso 3: registrar la fila.
export async function createPresentationUploadUrl(filename: string): Promise<{ ok: boolean; error?: string; path?: string; token?: string }> {
  await assertAdmin();
  const slug = filename.toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'deck';
  const path = `${slug}-${Date.now()}.pdf`;
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from('coach-presentations').createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not start upload.' };
  return { ok: true, path: data.path, token: data.token };
}

export async function registerCoachResource(input: { storagePath: string; title: string; description?: string | null }): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  if (!input.title?.trim()) return { ok: false, error: 'A title is required.' };
  const admin = createAdminClient();
  const { error } = await admin.from('coach_resources').insert({
    title: input.title.trim(), description: input.description?.trim() || null,
    file_url: '', storage_path: input.storagePath, kind: 'pdf', audience: 'both',
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/presentations');
  return { ok: true };
}

// #video — link promocional por plantilla (QR público + portal del vendedor).
export async function setTemplateVideoUrl(templateId: string, url: string | null): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const clean = url?.trim() || null;
  if (clean && !/^https?:\/\//i.test(clean)) return { ok: false, error: 'Pegá un link completo (https://…).' };
  const admin = createAdminClient();
  const { error } = await admin.from('camp_templates').update({ video_url: clean }).eq('id', templateId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/presentations');
  return { ok: true };
}
