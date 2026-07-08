'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { createNotification } from '@/lib/actions/notifications';
import { sendAssignmentEmail, sendAssignmentResponseEmail } from '@/lib/actions/email';
import { revalidatePath } from 'next/cache';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app';

export type ServiceStaffRole = 'assistant' | 'photographer' | 'filmmaker' | 'other';

export interface ServiceStaffRow {
  id: string;
  role: string;
  status: 'invited' | 'accepted' | 'declined';
  name: string;
  email: string | null;
  is_coach: boolean;
  coach_id: string | null;
  staff_member_id: string | null;
  responded_at: string | null;
  response_note: string | null;
}

export async function listServiceStaff(campInstanceId: string): Promise<ServiceStaffRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('service_staff')
    .select('id, role, status, coach_id, staff_member_id, responded_at, response_note, coaches:coach_id(display_name, email), staff_members:staff_member_id(name, email)')
    .eq('camp_instance_id', campInstanceId)
    .order('created_at');
  return (data ?? []).map((r: any) => {
    const co = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
    const sm = Array.isArray(r.staff_members) ? r.staff_members[0] : r.staff_members;
    return {
      id: r.id,
      role: r.role,
      status: r.status,
      name: co?.display_name ?? sm?.name ?? 'Staff',
      email: co?.email ?? sm?.email ?? null,
      is_coach: !!r.coach_id,
      coach_id: r.coach_id ?? null,
      staff_member_id: r.staff_member_id ?? null,
      responded_at: r.responded_at ?? null,
      response_note: r.response_note ?? null,
    };
  });
}

// Coaches/assistants assignable as staff (same academy unless platform admin).
export async function listAssignableCoaches(): Promise<{ id: string; name: string; role: string }[]> {
  const me = await getCurrentCoach();
  if (!me) return [];
  const admin = createAdminClient();
  let q = admin.from('coaches').select('id, display_name, role, academy_id').eq('active_status', true);
  if (!me.is_platform_admin && me.academy_id) q = q.eq('academy_id', me.academy_id);
  const { data } = await q.order('display_name');
  return (data ?? []).map((c: any) => ({ id: c.id, name: c.display_name, role: c.role }));
}

export async function listStaffMembers(): Promise<{ id: string; name: string; role: string | null; email: string | null }[]> {
  const me = await getCurrentCoach();
  if (!me) return [];
  const admin = createAdminClient();
  let q = admin.from('staff_members').select('id, name, role, email, academy_id');
  if (!me.is_platform_admin && me.academy_id) q = q.eq('academy_id', me.academy_id);
  const { data } = await q.order('name');
  return (data ?? []).map((s: any) => ({ id: s.id, name: s.name, role: s.role, email: s.email }));
}

export async function createStaffMember(input: {
  name: string; email: string | null; phone: string | null; role: string;
}): Promise<{ id: string }> {
  const me = await getCurrentCoach();
  if (!me) throw new Error('Not authenticated.');
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('staff_members')
    .insert({
      academy_id: me.academy_id ?? null,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      role: input.role,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

// Assign a coach OR a staff_member to a service with a role; notify them.
export async function assignServiceStaff(input: {
  campInstanceId: string;
  role: ServiceStaffRole;
  coachId?: string | null;
  staffMemberId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me) return { ok: false, error: 'Not authenticated.' };
  if (!input.coachId && !input.staffMemberId) return { ok: false, error: 'Pick a person.' };

  const admin = createAdminClient();

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, end_date, scheduled_time, camp_templates:template_id(duration_days)')
    .eq('id', input.campInstanceId)
    .single();
  if (!camp) return { ok: false, error: 'Service not found.' };

  const { data: row, error } = await admin
    .from('service_staff')
    .insert({
      camp_instance_id: input.campInstanceId,
      role: input.role,
      coach_id: input.coachId ?? null,
      staff_member_id: input.staffMemberId ?? null,
      invited_by: me.id,
    })
    .select('id, response_token')
    .single();
  if (error) return { ok: false, error: error.message };

  const { formatServiceWhen } = await import('@/lib/utils/format-date');
  const tpl = Array.isArray((camp as any).camp_templates) ? (camp as any).camp_templates[0] : (camp as any).camp_templates;
  const dateRange = formatServiceWhen({
    startDate: camp.start_date,
    endDate: camp.end_date,
    scheduledTime: (camp as any).scheduled_time,
    durationDays: tpl?.duration_days,
  });
  const respondUrl = `${APP_URL}/respond/${row.response_token}`;

  // Notify the assignee.
  try {
    if (input.coachId) {
      const { data: co } = await admin.from('coaches').select('display_name, email, portal_token').eq('id', input.coachId).single();
      await createNotification({
        recipientCoachId: input.coachId,
        type: 'staff_assignment',
        title: `New ${input.role}: ${camp.camp_name}`,
        body: `${dateRange} — accept or decline.`,
        link: respondUrl,
      });
      if (co?.email) {
        await sendAssignmentEmail({
          toEmail: co.email,
          coachFirstName: (co.display_name || 'Coach').split(' ')[0],
          serviceName: `${camp.camp_name} · ${input.role}`,
          dateRange,
          portalUrl: respondUrl,
        });
      }
    } else if (input.staffMemberId) {
      const { data: sm } = await admin.from('staff_members').select('name, email').eq('id', input.staffMemberId).single();
      if (sm?.email) {
        await sendAssignmentEmail({
          toEmail: sm.email,
          coachFirstName: (sm.name || 'Staff').split(' ')[0],
          serviceName: `${camp.camp_name} · ${input.role}`,
          dateRange,
          portalUrl: respondUrl,
        });
      }
    }
  } catch (e) {
    console.error('[assignServiceStaff] notify failed', e);
  }

  revalidatePath(`/camps/${input.campInstanceId}`);
  return { ok: true };
}

export async function removeServiceStaff(id: string): Promise<void> {
  const admin = createAdminClient();
  const { data: row } = await admin.from('service_staff').select('camp_instance_id').eq('id', id).single();
  await admin.from('service_staff').delete().eq('id', id);
  if (row) revalidatePath(`/camps/${row.camp_instance_id}`);
}

// ── Token-based accept/reject (works for coach + non-coach staff) ──

export async function getServiceStaffByToken(token: string): Promise<{
  id: string; role: string; status: string; name: string; camp_name: string; date_range: string;
} | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('service_staff')
    .select('id, role, status, coaches:coach_id(display_name), staff_members:staff_member_id(name), camp_instances:camp_instance_id(camp_name, start_date, end_date)')
    .eq('response_token', token)
    .maybeSingle();
  if (!data) return null;
  const co = Array.isArray((data as any).coaches) ? (data as any).coaches[0] : (data as any).coaches;
  const sm = Array.isArray((data as any).staff_members) ? (data as any).staff_members[0] : (data as any).staff_members;
  const camp = Array.isArray((data as any).camp_instances) ? (data as any).camp_instances[0] : (data as any).camp_instances;
  const dr = camp ? (camp.start_date === camp.end_date ? String(camp.start_date) : `${camp.start_date} → ${camp.end_date}`) : '';
  return {
    id: (data as any).id,
    role: (data as any).role,
    status: (data as any).status,
    name: co?.display_name ?? sm?.name ?? 'Staff',
    camp_name: camp?.camp_name ?? 'Service',
    date_range: dr,
  };
}

export async function respondToServiceStaffByToken(
  token: string,
  decision: 'accepted' | 'declined',
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('service_staff')
    .select('id, camp_instance_id, role, invited_by, coach_id, staff_member_id, coaches:coach_id(display_name), staff_members:staff_member_id(name), camp_instances:camp_instance_id(camp_name)')
    .eq('response_token', token)
    .maybeSingle();
  if (!row) return { ok: false, error: 'Invalid or expired link.' };

  await admin
    .from('service_staff')
    .update({ status: decision, responded_at: new Date().toISOString(), response_note: note?.trim() || null })
    .eq('id', (row as any).id);

  // Notify the coordinator who invited.
  try {
    const co = Array.isArray((row as any).coaches) ? (row as any).coaches[0] : (row as any).coaches;
    const sm = Array.isArray((row as any).staff_members) ? (row as any).staff_members[0] : (row as any).staff_members;
    const camp = Array.isArray((row as any).camp_instances) ? (row as any).camp_instances[0] : (row as any).camp_instances;
    const who = co?.display_name ?? sm?.name ?? 'Staff';
    const accepted = decision === 'accepted';
    if ((row as any).invited_by) {
      await createNotification({
        recipientCoachId: (row as any).invited_by,
        type: 'staff_assignment_response',
        title: `${who} ${accepted ? 'accepted' : 'declined'}: ${camp?.camp_name ?? 'service'}`,
        body: note?.trim() || ((row as any).role + (accepted ? ' confirmed.' : ' declined.')),
        link: `/camps/${(row as any).camp_instance_id}`,
      });
      const { data: inviter } = await admin.from('coaches').select('display_name, email').eq('id', (row as any).invited_by).single();
      if (inviter?.email) {
        await sendAssignmentResponseEmail({
          toEmail: inviter.email,
          coordinatorFirstName: (inviter.display_name || 'Coordinator').split(' ')[0],
          coachName: who,
          serviceName: camp?.camp_name ?? 'Service',
          accepted,
          note: note?.trim() || null,
        });
      }
    }
  } catch (e) {
    console.error('[respondToServiceStaffByToken] notify failed', e);
  }

  revalidatePath(`/camps/${(row as any).camp_instance_id}`);
  return { ok: true };
}

// Camp instance ids where this coach is an ACCEPTED assistant (read-only access).
export async function getAcceptedAssistantCampIds(coachId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('service_staff')
    .select('camp_instance_id')
    .eq('coach_id', coachId)
    .eq('role', 'assistant')
    .eq('status', 'accepted');
  return Array.from(new Set((data ?? []).map((r: any) => r.camp_instance_id)));
}
