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
// If academyId is provided AND a per-academy override exists, it takes
// priority over the global course_prices row.
export async function getCoursePriceCents(
  courseKey: string,
  academyId?: string | null,
): Promise<{ price_cents: number; currency: string } | null> {
  const admin = createAdminClient();

  if (academyId) {
    const { data: override } = await admin
      .from('academy_course_prices')
      .select('price_cents, currency')
      .eq('academy_id', academyId)
      .eq('course_key', courseKey)
      .maybeSingle();
    if (override) {
      return { price_cents: override.price_cents, currency: override.currency };
    }
  }

  const { data } = await admin
    .from('course_prices')
    .select('price_cents, currency')
    .eq('course_key', courseKey)
    .maybeSingle();
  if (!data) return null;
  return { price_cents: data.price_cents, currency: data.currency };
}

export type AcademyCoursePrice = {
  academy_id: string;
  course_key: string;
  price_cents: number;
  currency: string;
  updated_at: string;
};

export async function listAcademyCoursePrices(): Promise<AcademyCoursePrice[]> {
  const real = await isRealPlatformAdmin();
  if (!real) throw new Error('Not authorized.');
  const admin = createAdminClient();
  const { data } = await admin
    .from('academy_course_prices')
    .select('academy_id, course_key, price_cents, currency, updated_at');
  return (data ?? []) as AcademyCoursePrice[];
}

export async function upsertAcademyCoursePrice(
  academyId: string,
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
    .from('academy_course_prices')
    .upsert({
      academy_id: academyId,
      course_key: courseKey,
      price_cents: priceCents,
      currency,
      updated_at: new Date().toISOString(),
      updated_by: me?.id ?? null,
    });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/pricing');
}

export async function deleteAcademyCoursePrice(
  academyId: string,
  courseKey: string,
): Promise<void> {
  const real = await isRealPlatformAdmin();
  if (!real) throw new Error('Not authorized.');
  const admin = createAdminClient();
  await admin
    .from('academy_course_prices')
    .delete()
    .eq('academy_id', academyId)
    .eq('course_key', courseKey);
  revalidatePath('/admin/pricing');
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
