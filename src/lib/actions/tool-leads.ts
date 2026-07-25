'use server';

// Tool leads (M151) — platform-level: visible ONLY to the admin, never to
// academies. Convert-to-academy is a deliberate admin action.

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';

async function assertAdmin() {
  const me = await getCurrentCoach();
  if (!me || me.role !== 'admin') throw new Error('Admin only');
  return me;
}

export async function listToolLeads() {
  await assertAdmin();
  const admin = createAdminClient();
  const [{ data: leads, error }, { data: academies }] = await Promise.all([
    admin.from('tool_leads').select('*').order('last_seen', { ascending: false }),
    admin.from('academies').select('id, name').is('archived_at', null).order('name'),
  ]);
  if (error) return { leads: [], academies: [] }; // pre-migration
  return { leads: leads ?? [], academies: academies ?? [] };
}

export async function convertToolLead(leadId: string, academyId: string): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const { data: lead } = await admin.from('tool_leads').select('*').eq('id', leadId).maybeSingle();
  if (!lead) return { ok: false, error: 'Lead not found' };
  if (lead.converted_at) return { ok: false, error: 'Already converted' };

  const parts = String(lead.name ?? '').trim().split(/\s+/);
  const first = parts[0] || lead.email.split('@')[0];
  const last = parts.slice(1).join(' ');
  const { error: insErr } = await admin.from('students').insert({
    academy_id: academyId,
    first_name: first,
    last_name: last,
    email: lead.email,
    status: 'active',
    lifecycle_status: 'lead',
    how_did_you_hear: lead.tool,
  });
  if (insErr) return { ok: false, error: insErr.message };
  await admin.from('tool_leads').update({ converted_academy_id: academyId, converted_at: new Date().toISOString() }).eq('id', leadId);
  revalidatePath('/admin/tool-leads');
  return { ok: true };
}
