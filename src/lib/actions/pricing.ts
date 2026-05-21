'use server';

// Course pricing — global, fixed per course_key. Only platform admins
// can read/write. Snapshots into course_grants.price_cents at grant time
// so historical grants keep the price they were sold at.

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { isRealPlatformAdmin, getCurrentCoach } from './auth';

export type CoursePrice = {
  course_key: string;
  price_cents: number;
  currency: string;
  updated_at: string;
  updated_by: string | null;
};

export async function listCoursePrices(): Promise<CoursePrice[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('course_prices')
    .select('course_key, price_cents, currency, updated_at, updated_by')
    .order('course_key');
  return (data ?? []) as CoursePrice[];
}

// Returns just the price cents for a single course (used at grant time).
export async function getCoursePriceCents(
  courseKey: string,
): Promise<{ price_cents: number; currency: string } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('course_prices')
    .select('price_cents, currency')
    .eq('course_key', courseKey)
    .maybeSingle();
  if (!data) return null;
  return { price_cents: data.price_cents, currency: data.currency };
}

export async function updateCoursePrice(
  courseKey: string,
  priceCents: number,
  currency: string = 'USD',
): Promise<void> {
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new Error('Price must be a non-negative integer (cents).');
  }
  const real = await isRealPlatformAdmin();
  if (!real) throw new Error('Not authorized.');
  const me = await getCurrentCoach();

  const admin = createAdminClient();
  const { error } = await admin
    .from('course_prices')
    .upsert({
      course_key: courseKey,
      price_cents: priceCents,
      currency,
      updated_at: new Date().toISOString(),
      updated_by: me?.id ?? null,
    });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/pricing');
}
