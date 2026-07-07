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
    .select('coach_resources!inner(id, title, description, file_url, storage_path, kind, active)')
    .eq('coach_id', coach.id);

  const rows = (data ?? [])
    .map((r: any) => r.coach_resources)
    .filter((r: any) => r && r.active);

  // Bucket files are private — mint a short-lived signed URL per resource so
  // only granted coaches can open them. Legacy public file_url is a fallback.
  const out: CoachResource[] = [];
  for (const r of rows) {
    let url = r.file_url as string | null;
    if (r.storage_path) {
      const { data: signed } = await admin.storage
        .from('coach-presentations')
        .createSignedUrl(r.storage_path, 60 * 60);
      if (signed?.signedUrl) url = signed.signedUrl;
    }
    if (url) out.push({ id: r.id, title: r.title, description: r.description, file_url: url, kind: r.kind });
  }
  return out;
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

  const { error } = await admin
    .from('coach_resources')
    .insert({ title, description, file_url: '', storage_path: path, kind: 'pdf' });
  if (error) return { ok: false, error: error.message };

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
