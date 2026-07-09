'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

// Academy space booking (Fase 1). Any coach in the academy can view + book;
// coordinator/admin can manage spaces + cancel anyone's booking. Double-booking
// is impossible — the DB has an exclusion constraint on (space, time-range).

const ES_OFFSET = '-06:00'; // El Salvador, no DST.

export interface AcademySpace {
  id: string;
  name: string;
  space_type: string | null;
  color: string | null;
  sort_order: number;
}

export interface SpaceBooking {
  id: string;
  space_id: string;
  coach_id: string | null;
  coach_name: string | null;
  title: string | null;
  starts_at: string;
  ends_at: string;
}

export async function listSpaces(): Promise<AcademySpace[]> {
  const me = await getCurrentCoach();
  if (!me) return [];
  const admin = createAdminClient();
  let q = admin.from('academy_spaces').select('id, name, space_type, color, sort_order').eq('active', true).order('sort_order');
  if (me.academy_id) q = q.eq('academy_id', me.academy_id);
  const { data } = await q;
  return (data ?? []) as AcademySpace[];
}

// All bookings that touch the given local day (YYYY-MM-DD), across all spaces.
export async function listBookingsForDay(dateStr: string): Promise<SpaceBooking[]> {
  const me = await getCurrentCoach();
  if (!me?.academy_id) return [];
  const admin = createAdminClient();
  const dayStart = `${dateStr}T00:00:00${ES_OFFSET}`;
  const dayEnd = `${dateStr}T23:59:59${ES_OFFSET}`;
  const { data } = await admin
    .from('space_bookings')
    .select('id, space_id, coach_id, title, starts_at, ends_at, coaches:coach_id(display_name)')
    .eq('academy_id', me.academy_id)
    .eq('status', 'booked')
    .lte('starts_at', dayEnd)
    .gte('ends_at', dayStart)
    .order('starts_at');
  return (data ?? []).map((r: any) => ({
    id: r.id, space_id: r.space_id, coach_id: r.coach_id,
    coach_name: (Array.isArray(r.coaches) ? r.coaches[0] : r.coaches)?.display_name ?? null,
    title: r.title, starts_at: r.starts_at, ends_at: r.ends_at,
  }));
}

export async function createBooking(input: {
  spaceId: string;
  date: string;       // YYYY-MM-DD (local)
  startTime: string;  // HH:MM (local)
  endTime: string;    // HH:MM (local)
  title?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me?.academy_id) return { ok: false, error: 'No academy in context.' };
  if (!input.startTime || !input.endTime) return { ok: false, error: 'Pick a start and end time.' };
  const starts_at = `${input.date}T${input.startTime}:00${ES_OFFSET}`;
  const ends_at = `${input.date}T${input.endTime}:00${ES_OFFSET}`;
  if (ends_at <= starts_at) return { ok: false, error: 'The end time must be after the start time.' };

  const admin = createAdminClient();
  const { error } = await admin.from('space_bookings').insert({
    space_id: input.spaceId,
    academy_id: me.academy_id,
    coach_id: me.id,
    title: input.title?.trim() || null,
    starts_at,
    ends_at,
  });
  if (error) {
    // 23P01 = exclusion violation (the slot overlaps an existing booking).
    if (error.code === '23P01' || /no_overlap|exclusion/i.test(error.message)) {
      return { ok: false, error: 'That space is already booked for part of this time. Pick another slot.' };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath('/spaces');
  return { ok: true };
}

export async function cancelBooking(id: string): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me) return { ok: false, error: 'Not signed in.' };
  const admin = createAdminClient();
  const { data: booking } = await admin.from('space_bookings').select('coach_id').eq('id', id).maybeSingle();
  if (!booking) return { ok: false, error: 'Booking not found.' };
  const canManage = await isCoordinatorOrAbove(me.role);
  if (booking.coach_id !== me.id && !canManage) {
    return { ok: false, error: 'You can only cancel your own bookings.' };
  }
  const { error } = await admin.from('space_bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/spaces');
  return { ok: true };
}

// ── Coordinator: manage the spaces themselves ──
export async function createSpace(input: { name: string; space_type?: string; color?: string }): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me || !(await isCoordinatorOrAbove(me.role))) return { ok: false, error: 'Only a coordinator or admin can add spaces.' };
  if (!input.name?.trim()) return { ok: false, error: 'A name is required.' };
  const admin = createAdminClient();
  const { data: max } = await admin.from('academy_spaces').select('sort_order').eq('academy_id', me.academy_id).order('sort_order', { ascending: false }).limit(1);
  const nextOrder = max && max.length > 0 ? (max[0].sort_order ?? 0) + 1 : 1;
  const { error } = await admin.from('academy_spaces').insert({
    academy_id: me.academy_id,
    name: input.name.trim(),
    space_type: input.space_type?.trim() || null,
    color: input.color || '#5A6B78',
    sort_order: nextOrder,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/spaces');
  return { ok: true };
}

export async function deactivateSpace(id: string): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach();
  if (!me || !(await isCoordinatorOrAbove(me.role))) return { ok: false, error: 'Only a coordinator or admin can remove spaces.' };
  const admin = createAdminClient();
  const { error } = await admin.from('academy_spaces').update({ active: false }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/spaces');
  return { ok: true };
}

// ── Token-based variants for the coach portal (no session) ──
async function coachByToken(token: string): Promise<{ id: string; academy_id: string | null } | null> {
  const admin = createAdminClient();
  const { data } = await admin.from('coaches').select('id, academy_id').eq('portal_token', token).maybeSingle();
  return data ?? null;
}

export async function listSpacesByToken(token: string): Promise<AcademySpace[]> {
  const coach = await coachByToken(token);
  if (!coach?.academy_id) return [];
  const admin = createAdminClient();
  const { data } = await admin.from('academy_spaces').select('id, name, space_type, color, sort_order').eq('academy_id', coach.academy_id).eq('active', true).order('sort_order');
  return (data ?? []) as AcademySpace[];
}

export async function listBookingsForDayByToken(token: string, dateStr: string): Promise<SpaceBooking[]> {
  const coach = await coachByToken(token);
  if (!coach?.academy_id) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('space_bookings')
    .select('id, space_id, coach_id, title, starts_at, ends_at, coaches:coach_id(display_name)')
    .eq('academy_id', coach.academy_id)
    .eq('status', 'booked')
    .lte('starts_at', `${dateStr}T23:59:59${ES_OFFSET}`)
    .gte('ends_at', `${dateStr}T00:00:00${ES_OFFSET}`)
    .order('starts_at');
  return (data ?? []).map((r: any) => ({
    id: r.id, space_id: r.space_id, coach_id: r.coach_id,
    coach_name: (Array.isArray(r.coaches) ? r.coaches[0] : r.coaches)?.display_name ?? null,
    title: r.title, starts_at: r.starts_at, ends_at: r.ends_at,
  }));
}

export async function createBookingByToken(token: string, input: {
  spaceId: string; date: string; startTime: string; endTime: string; title?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const coach = await coachByToken(token);
  if (!coach?.academy_id) return { ok: false, error: 'No academy in context.' };
  if (!input.startTime || !input.endTime) return { ok: false, error: 'Pick a start and end time.' };
  const starts_at = `${input.date}T${input.startTime}:00${ES_OFFSET}`;
  const ends_at = `${input.date}T${input.endTime}:00${ES_OFFSET}`;
  if (ends_at <= starts_at) return { ok: false, error: 'The end time must be after the start time.' };
  const admin = createAdminClient();
  const { error } = await admin.from('space_bookings').insert({
    space_id: input.spaceId, academy_id: coach.academy_id, coach_id: coach.id,
    title: input.title?.trim() || null, starts_at, ends_at,
  });
  if (error) {
    if (error.code === '23P01' || /no_overlap|exclusion/i.test(error.message)) {
      return { ok: false, error: 'That space is already booked for part of this time. Pick another slot.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function cancelBookingByToken(token: string, id: string): Promise<{ ok: boolean; error?: string }> {
  const coach = await coachByToken(token);
  if (!coach) return { ok: false, error: 'Coach not found.' };
  const admin = createAdminClient();
  const { data: booking } = await admin.from('space_bookings').select('coach_id').eq('id', id).maybeSingle();
  if (!booking) return { ok: false, error: 'Booking not found.' };
  if (booking.coach_id !== coach.id) return { ok: false, error: 'You can only cancel your own bookings.' };
  const { error } = await admin.from('space_bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
