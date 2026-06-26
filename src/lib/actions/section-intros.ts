'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

export interface SectionIntro { section_key: string; title: string | null; video_url: string | null }

// Public read (used by the token-based student portal) — content, no PII.
export async function getSectionIntros(): Promise<Record<string, SectionIntro>> {
  const admin = createAdminClient();
  const { data } = await admin.from('course_section_intros').select('*');
  const map: Record<string, SectionIntro> = {};
  for (const r of data ?? []) map[(r as any).section_key] = r as SectionIntro;
  return map;
}

export async function listSectionIntros(): Promise<SectionIntro[]> {
  const map = await getSectionIntros();
  return Object.values(map);
}

export async function setSectionIntro(section_key: string, video_url: string, title?: string): Promise<void> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin && me?.role !== 'admin') throw new Error('Only an admin can set section intro videos.');
  const admin = createAdminClient();
  const { error } = await admin
    .from('course_section_intros')
    .upsert({ section_key, video_url: video_url.trim() || null, title: title?.trim() || null, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
  if (error) throw new Error(error.message);
  revalidatePath('/section-intros');
}
