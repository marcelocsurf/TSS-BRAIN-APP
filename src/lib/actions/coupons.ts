'use server';

// Coupon codes for the public class-QR flow (M147). Staff-managed: create,
// rotate (deactivate + create a new one), expiry and use limits.

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';

async function assertStaff() {
  const me = await getCurrentCoach();
  if (!me || !['admin', 'coordinator'].includes(me.role)) throw new Error('Not authorized');
  return me;
}

export interface Coupon {
  id: string;
  code: string;
  percent_off: number;
  active: boolean;
  expires_on: string | null;
  max_uses: number | null;
  uses: number;
  notes: string | null;
}

export async function listCoupons(): Promise<{ coupons: Coupon[]; academySlug: string | null }> {
  const me = await assertStaff();
  const admin = createAdminClient();
  let q = admin.from('class_coupons').select('id, code, percent_off, active, expires_on, max_uses, uses, notes').order('created_at', { ascending: false });
  if (me.academy_id) q = q.eq('academy_id', me.academy_id);
  const { data, error } = await q;
  if (error) return { coupons: [], academySlug: null }; // pre-migration
  let slug: string | null = null;
  if (me.academy_id) {
    const { data: a } = await admin.from('academies').select('slug').eq('id', me.academy_id).single();
    slug = (a as any)?.slug ?? null;
  }
  return { coupons: (data ?? []) as Coupon[], academySlug: slug };
}

export async function saveCoupon(input: { id?: string; code: string; percent_off: number; expires_on?: string | null; max_uses?: number | null; notes?: string | null }): Promise<{ ok: boolean; error?: string }> {
  const me = await assertStaff();
  if (!me.academy_id) return { ok: false, error: 'No academy on your profile.' };
  const admin = createAdminClient();
  const row = {
    academy_id: me.academy_id,
    code: input.code.trim().toUpperCase(),
    percent_off: Math.min(100, Math.max(1, Math.round(input.percent_off))),
    expires_on: input.expires_on || null,
    max_uses: input.max_uses ?? null,
    notes: input.notes?.trim() || null,
  };
  if (!row.code) return { ok: false, error: 'Code is required.' };
  const q = input.id
    ? admin.from('class_coupons').update(row).eq('id', input.id)
    : admin.from('class_coupons').insert(row);
  const { error } = await q;
  if (error) return { ok: false, error: error.message.includes('duplicate') ? 'That code already exists.' : error.message };
  revalidatePath('/costs');
  return { ok: true };
}

export async function toggleCoupon(id: string, active: boolean): Promise<{ ok: boolean; error?: string }> {
  await assertStaff();
  const admin = createAdminClient();
  const { error } = await admin.from('class_coupons').update({ active }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/costs');
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<{ ok: boolean; error?: string }> {
  await assertStaff();
  const admin = createAdminClient();
  const { error } = await admin.from('class_coupons').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/costs');
  return { ok: true };
}
