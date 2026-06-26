'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

export type DrillType = 'drill' | 'mission';
export type DrillBelt = 'white' | 'yellow' | 'blue' | 'purple' | 'brown' | 'black';

export interface DrillRow {
  id: string;
  step_id: string | null;
  title: string;
  type: DrillType;
  time_estimate: number | null;
  reps_recommended: number | null;
  key_words: string | null;
  description_md: string | null;
  success_criteria: string | null;
  belt: string;
  block_number: number | null;
  block_name: string | null;
  display_order: number | null;
  active: boolean;
  student_visible: boolean;
}

// Admin (or platform admin) only — this edits global content.
async function requireAdmin() {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin && me?.role !== 'admin') {
    throw new Error('Only an admin can manage the drill & mission library.');
  }
}

const BELT_SECTIONS: Record<string, string[]> = {
  white: ['pre_course_fundamentals', 'pre_course_values', 'wb_onboarding', 'white_belt'],
  yellow: ['yb_onboarding', 'yellow_belt'],
  blue: ['bb_onboarding', 'blue_belt'],
};

// Steps available for the step_id dropdown, for a given belt.
export async function getStepOptions(belt: string): Promise<{ id: string; title: string }[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const sections = BELT_SECTIONS[belt] ?? [];
  if (!sections.length) return [];
  const { data } = await admin
    .from('lessons')
    .select('id, title, display_order')
    .in('course_section', sections)
    .eq('active', true)
    .order('display_order');
  return (data ?? []).map((l: any) => ({ id: l.id, title: l.title }));
}

export async function listDrills(opts: { belt?: string; type?: string; q?: string; includeRetired?: boolean } = {}): Promise<DrillRow[]> {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin.from('drills_missions').select('*');
  if (!opts.includeRetired) query = query.eq('active', true);
  if (opts.belt) query = query.eq('belt', opts.belt);
  if (opts.type) query = query.eq('type', opts.type);
  query = query.order('belt').order('block_number', { nullsFirst: true }).order('display_order');
  const { data } = await query;
  let rows = (data ?? []) as DrillRow[];
  if (opts.q) {
    const q = opts.q.toLowerCase();
    rows = rows.filter((r) =>
      r.title?.toLowerCase().includes(q) ||
      r.step_id?.toLowerCase().includes(q) ||
      r.key_words?.toLowerCase().includes(q),
    );
  }
  return rows;
}

interface DrillInput {
  title: string;
  type: DrillType;
  belt: string;
  step_id?: string | null;
  time_estimate?: number | null;
  reps_recommended?: number | null;
  key_words?: string | null;
  description_md?: string | null;
  success_criteria?: string | null;
  block_number?: number | null;
  block_name?: string | null;
  display_order?: number | null;
  student_visible?: boolean;
}

function clean(input: DrillInput) {
  return {
    title: input.title.trim(),
    type: input.type,
    belt: input.belt,
    step_id: input.step_id?.trim() || null,
    time_estimate: input.time_estimate ?? null,
    reps_recommended: input.reps_recommended ?? null,
    key_words: input.key_words?.trim() || null,
    description_md: input.description_md?.trim() || null,
    success_criteria: input.success_criteria?.trim() || null,
    block_number: input.block_number ?? null,
    block_name: input.block_name?.trim() || null,
    display_order: input.display_order ?? null,
    student_visible: input.student_visible ?? true,
  };
}

const BELT_CODE: Record<string, string> = {
  white: 'WB', yellow: 'YB', blue: 'BB', purple: 'PB', brown: 'BR', black: 'BK',
};

// id is a human-readable TEXT key with no DB default (e.g. DRL-BB-040 /
// MIS-WB-012). Generate the next free one for this type + belt.
async function nextDrillId(admin: ReturnType<typeof createAdminClient>, type: DrillType, belt: string): Promise<string> {
  const prefix = type === 'drill' ? 'DRL' : 'MIS';
  const code = BELT_CODE[belt] || belt.slice(0, 2).toUpperCase();
  const base = `${prefix}-${code}-`;
  const { data } = await admin.from('drills_missions').select('id').ilike('id', `${base}%`);
  const taken = new Set((data ?? []).map((r: any) => r.id as string));
  let max = 0;
  for (const id of taken) {
    const m = id.slice(base.length).match(/^(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  let n = max + 1;
  let id = `${base}${String(n).padStart(3, '0')}`;
  while (taken.has(id)) { n += 1; id = `${base}${String(n).padStart(3, '0')}`; }
  return id;
}

export async function createDrill(input: DrillInput): Promise<DrillRow> {
  await requireAdmin();
  if (!input.title?.trim()) throw new Error('Title is required.');
  if (!input.belt) throw new Error('Belt is required.');
  if (input.type !== 'drill' && input.type !== 'mission') throw new Error('Type must be drill or mission.');
  const admin = createAdminClient();
  const id = await nextDrillId(admin, input.type, input.belt);
  const { data, error } = await admin.from('drills_missions').insert({ id, ...clean(input), active: true }).select('*').single();
  if (error) throw new Error(error.message);
  revalidatePath('/drill-library');
  return data as DrillRow;
}

export async function updateDrill(id: string, input: DrillInput): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('drills_missions').update(clean(input)).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/drill-library');
}

// Retire = soft delete (active=false). Reversible, breaks nothing.
export async function retireDrill(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('drills_missions').update({ active: false }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/drill-library');
}

export async function restoreDrill(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('drills_missions').update({ active: true }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/drill-library');
}
