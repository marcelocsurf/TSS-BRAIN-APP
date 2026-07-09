'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

// Venue Scout — a coach's tactical analysis of a surf spot (competition or free
// session). Ported from the standalone tool. Fase 1: create / list / open /
// delete, scoped to the coach who owns it. Additive; touches no existing tables.

export interface VenueScoutRow {
  id: string;
  academy_id: string | null;
  coach_id: string | null;
  student_id: string | null;
  student_name?: string | null;
  spot_name: string | null;
  scout_date: string | null;
  mode: string;
  config_json: any;
  map_json: any;
  waves_json: any;
  closing_json: any;
  shared_with_student: boolean;
  created_at: string;
  updated_at: string;
}

export async function listMyScouts(): Promise<VenueScoutRow[]> {
  const me = await getCurrentCoach();
  if (!me) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('venue_scouts')
    .select('id, academy_id, coach_id, student_id, spot_name, scout_date, mode, shared_with_student, created_at, updated_at, students:student_id(first_name, last_name)')
    .eq('coach_id', me.id)
    .order('updated_at', { ascending: false });
  return (data ?? []).map((r: any) => ({
    ...r,
    student_name: (() => {
      const s = Array.isArray(r.students) ? r.students[0] : r.students;
      return s ? `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() : null;
    })(),
    config_json: {}, map_json: {}, waves_json: [], closing_json: {},
  })) as VenueScoutRow[];
}

export async function createScout(input: {
  spot_name?: string;
  scout_date?: string;
  mode?: 'comp' | 'free';
  student_id?: string | null;
  config_json?: any;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const me = await getCurrentCoach();
  if (!me) return { ok: false, error: 'Not signed in.' };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('venue_scouts')
    .insert({
      academy_id: me.academy_id ?? null,
      coach_id: me.id,
      student_id: input.student_id || null,
      spot_name: input.spot_name?.trim() || null,
      scout_date: input.scout_date || null,
      mode: input.mode === 'free' ? 'free' : 'comp',
      config_json: input.config_json ?? {},
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/venue-scout');
  return { ok: true, id: data!.id };
}

// Full row (owner only) — used by the editor.
export async function getScout(id: string): Promise<VenueScoutRow | null> {
  const me = await getCurrentCoach();
  if (!me) return null;
  const admin = createAdminClient();
  const { data } = await admin.from('venue_scouts').select('*').eq('id', id).maybeSingle();
  if (!data || data.coach_id !== me.id) return null;
  return data as VenueScoutRow;
}

// Persist the working state (owner only). Called by the editor's debounced save.
export async function saveScout(id: string, patch: {
  spot_name?: string | null;
  scout_date?: string | null;
  mode?: string;
  student_id?: string | null;
  config_json?: any;
  map_json?: any;
  waves_json?: any;
  closing_json?: any;
  shared_with_student?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me) return { ok: false, error: 'Not signed in.' };
  const admin = createAdminClient();
  const { data: owner } = await admin.from('venue_scouts').select('coach_id').eq('id', id).maybeSingle();
  if (!owner || owner.coach_id !== me.id) return { ok: false, error: 'Not your scout.' };
  const { error } = await admin.from('venue_scouts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteScout(id: string): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me) return { ok: false, error: 'Not signed in.' };
  const admin = createAdminClient();
  const { error } = await admin.from('venue_scouts').delete().eq('id', id).eq('coach_id', me.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/venue-scout');
  return { ok: true };
}
