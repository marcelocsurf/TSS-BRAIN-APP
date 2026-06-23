'use server';

// Public lead-magnet action — creates a Lead from the surf-level quiz with no
// login. The belt is stored PROVISIONAL (a coach confirms later). Used by the
// public /quiz page.

import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';
import { sendQuizLeadEmail } from './email';

// Friendly slug aliases → real academy slugs (so marketing links can use a
// clean slug even if the stored slug has a typo).
const SLUG_ALIASES: Record<string, string> = {
  'puro-surf': 'el-zonte-la-libetad',
};

export async function createLeadFromQuiz(input: {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  academy_slug?: string | null;
  belt: string;            // resolved from the quiz level
  score: number;
  skillmap: { name: string; pct: number }[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.first_name?.trim()) return { ok: false, error: 'Name is required.' };
  if (!input.email?.trim() && !input.phone?.trim()) {
    return { ok: false, error: 'Email or phone is required.' };
  }

  const admin = createAdminClient();

  // Resolve academy by slug (optional). Otherwise lead is unassigned (TSS Direct).
  let academyId: string | null = null;
  let academyName: string | null = null;
  if (input.academy_slug) {
    const slug = SLUG_ALIASES[input.academy_slug] ?? input.academy_slug;
    const { data: aca } = await admin
      .from('academies')
      .select('id, name')
      .eq('slug', slug)
      .maybeSingle();
    academyId = aca?.id ?? null;
    academyName = aca?.name ?? null;
  }

  // Light duplicate guard: if a lead with this email/phone already exists,
  // update its quiz result instead of creating a second record.
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;
  let existingId: string | null = null;
  if (email || phone) {
    let q = admin.from('students').select('id, email, phone').eq('status', 'active').limit(50);
    if (academyId) q = q.eq('academy_id', academyId);
    const { data } = await q;
    for (const s of data ?? []) {
      if (email && s.email && s.email.trim().toLowerCase() === email) { existingId = s.id; break; }
      if (phone && s.phone && s.phone.trim() === phone) { existingId = s.id; break; }
    }
  }

  const now = new Date().toISOString();
  const quizFields = {
    belt_level: input.belt,
    belt_provisional: true,
    level_quiz_score: input.score,
    level_quiz_skillmap: input.skillmap,
    level_quiz_completed_at: now,
    // Mark the ocean quiz done too (provisional) so the intake reliably SKIPS
    // the level quiz — the student won't re-take what they did on the public
    // quiz. The coach confirms the ocean level later.
    ocean_level: 'beginner',
    ocean_level_provisional: true,
    ocean_quiz_completed_at: now,
  };

  if (existingId) {
    const { error } = await admin.from('students').update(quizFields).eq('id', existingId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from('students').insert({
      first_name: input.first_name.trim(),
      last_name: input.last_name?.trim() || '',
      email,
      phone,
      academy_id: academyId,
      portal_token: randomUUID(),
      lifecycle_status: 'lead',
      student_type: 'member',
      course_access_white: false,
      course_access_yellow: false,
      course_access_blue: false,
      current_sequence_number: 1,
      current_step_order: 1,
      status: 'active',
      waiver_signed: false,
      ...quizFields,
    });
    if (error) return { ok: false, error: error.message };
  }

  // Notify the academy / TSS of the new (or updated) quiz lead. Never block
  // the lead on an email failure.
  try {
    await sendQuizLeadEmail({
      name: `${input.first_name.trim()} ${input.last_name?.trim() || ''}`.trim(),
      email: email,
      phone: phone,
      belt: input.belt,
      score: input.score,
      academyName,
    });
  } catch (e) {
    console.error('[createLeadFromQuiz] notification email failed', e);
  }

  return { ok: true };
}
