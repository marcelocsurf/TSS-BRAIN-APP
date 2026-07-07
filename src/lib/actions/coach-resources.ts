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
    .select('coach_resources!inner(id, title, description, file_url, kind, active)')
    .eq('coach_id', coach.id);

  return (data ?? [])
    .map((r: any) => r.coach_resources)
    .filter((r: any) => r && r.active)
    .map((r: any) => ({ id: r.id, title: r.title, description: r.description, file_url: r.file_url, kind: r.kind }));
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
