'use server';

// CRUD + apply for Week Templates. A Week Template is a recipe that
// stamps a fixed pattern of camp_instances onto any week with a click.
// Academy-scoped — each academy authors and owns its own week templates.

import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from './auth';
import { revalidatePath } from 'next/cache';

export interface WeekTemplateSlotInput {
  weekday: number; // 0=Mon..6=Sun
  service_template_id: string;
  scheduled_time?: string | null;
  default_head_coach_id?: string | null;
  display_order?: number;
}

export interface WeekTemplateRow {
  id: string;
  academy_id: string;
  name: string;
  description: string | null;
  active_status: boolean;
  slots: Array<{
    id: string;
    weekday: number;
    service_template_id: string;
    scheduled_time: string | null;
    default_head_coach_id: string | null;
    display_order: number;
    camp_templates: {
      template_name: string;
      level_name: string | null;
      service_kind: string | null;
      card_color: string | null;
    } | null;
    coaches: { display_name: string } | null;
  }>;
}

async function meAcademy(): Promise<{ academy_id: string; isAdmin: boolean }> {
  const me = await getCurrentCoach();
  if (!me) throw new Error('Not authenticated');
  if (!me.academy_id && !me.is_platform_admin) throw new Error('No academy in scope');
  return { academy_id: me.academy_id ?? '', isAdmin: !!me.is_platform_admin };
}

export async function listWeekTemplates(): Promise<WeekTemplateRow[]> {
  const supabase = await createClient();
  const { academy_id, isAdmin } = await meAcademy();

  let query = supabase
    .from('week_templates')
    .select(
      'id, academy_id, name, description, active_status, week_template_slots(id, weekday, service_template_id, scheduled_time, default_head_coach_id, display_order, camp_templates(template_name, level_name, service_kind, card_color, duration_days), coaches:default_head_coach_id(display_name))',
    )
    .eq('active_status', true)
    .order('name');

  if (!isAdmin) query = query.eq('academy_id', academy_id);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    id: r.id,
    academy_id: r.academy_id,
    name: r.name,
    description: r.description,
    active_status: r.active_status,
    slots: (r.week_template_slots ?? []).sort(
      (a: any, b: any) => a.weekday - b.weekday || a.display_order - b.display_order,
    ),
  }));
}

export async function getWeekTemplate(id: string): Promise<WeekTemplateRow | null> {
  const list = await listWeekTemplates();
  return list.find((w) => w.id === id) ?? null;
}

export async function createWeekTemplate(input: {
  name: string;
  description?: string | null;
  slots: WeekTemplateSlotInput[];
}): Promise<{ id: string }> {
  const supabase = await createClient();
  const { academy_id } = await meAcademy();
  if (!input.name?.trim()) throw new Error('Name is required');

  const { data: tpl, error: tplErr } = await supabase
    .from('week_templates')
    .insert({
      academy_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
    })
    .select('id')
    .single();

  if (tplErr || !tpl) throw new Error(tplErr?.message ?? 'Insert failed');

  if (input.slots.length > 0) {
    const rows = input.slots.map((s, i) => ({
      week_template_id: tpl.id,
      weekday: s.weekday,
      service_template_id: s.service_template_id,
      scheduled_time: s.scheduled_time ?? null,
      default_head_coach_id: s.default_head_coach_id ?? null,
      display_order: s.display_order ?? i,
    }));
    const { error: slotErr } = await supabase
      .from('week_template_slots')
      .insert(rows);
    if (slotErr) throw new Error(slotErr.message);
  }

  revalidatePath('/camps/week-templates');
  return { id: tpl.id };
}

export async function updateWeekTemplate(
  id: string,
  input: {
    name: string;
    description?: string | null;
    slots: WeekTemplateSlotInput[];
  },
) {
  const supabase = await createClient();
  if (!input.name?.trim()) throw new Error('Name is required');

  const { error: upErr } = await supabase
    .from('week_templates')
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (upErr) throw new Error(upErr.message);

  // Easiest correct path: wipe + re-insert all slots.
  await supabase.from('week_template_slots').delete().eq('week_template_id', id);

  if (input.slots.length > 0) {
    const rows = input.slots.map((s, i) => ({
      week_template_id: id,
      weekday: s.weekday,
      service_template_id: s.service_template_id,
      scheduled_time: s.scheduled_time ?? null,
      default_head_coach_id: s.default_head_coach_id ?? null,
      display_order: s.display_order ?? i,
    }));
    const { error: slotErr } = await supabase
      .from('week_template_slots')
      .insert(rows);
    if (slotErr) throw new Error(slotErr.message);
  }

  revalidatePath('/camps/week-templates');
  revalidatePath(`/camps/week-templates/${id}`);
}

export async function deleteWeekTemplate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('week_templates')
    .update({ active_status: false })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/camps/week-templates');
}

// Apply: stamp this week template's slots as camp_instances starting on
// the given Monday. Returns the count of instances created. Uses the
// existing createCampInstance() so course-grant + session-day creation
// logic is preserved.
export async function applyWeekTemplate(
  weekTemplateId: string,
  mondayDate: string,
): Promise<{ created: number }> {
  const { createCampInstance } = await import('./camps');
  const wt = await getWeekTemplate(weekTemplateId);
  if (!wt) throw new Error('Week template not found');

  const me = await getCurrentCoach();
  if (!me) throw new Error('Not authenticated');

  // Compute date for each slot's weekday offset from the Monday.
  function addDays(s: string, n: number): string {
    const [y, m, d] = s.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + n);
    return date.toISOString().slice(0, 10);
  }

  let created = 0;
  for (const slot of wt.slots) {
    const start = addDays(mondayDate, slot.weekday);
    // Multi-day camps must span their full duration. createCampInstance
    // does NOT recompute end_date — it persists what we pass — so compute
    // it here from the service template's duration_days (same as the
    // manual /camps/new path).
    const duration = (slot as any).camp_templates?.duration_days || 1;
    const end = addDays(start, duration - 1);
    try {
      await createCampInstance({
        template_id: slot.service_template_id,
        camp_name: `${wt.name} · ${slot.camp_templates?.template_name ?? 'Service'}`,
        head_coach_id: slot.default_head_coach_id || me.id,
        coach_id: me.id,
        start_date: start,
        end_date: end,
        modality: 'group',
        student_ids: [],
        scheduled_time: slot.scheduled_time ?? undefined,
      } as any);
      created++;
    } catch (err: any) {
      console.error('applyWeekTemplate slot failed:', slot, err.message);
    }
  }

  revalidatePath('/camps');
  return { created };
}
