'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { BELT_HIERARCHY, type BeltLevel } from '@/lib/constants/belts';

// ═══════════════════════════════════════
// GET STUDENT LEVEL ACCESS
// ═══════════════════════════════════════

export async function getStudentLevelAccess(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_level_access')
    .select('*')
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ═══════════════════════════════════════
// GRANT LEVEL ACCESS
// ═══════════════════════════════════════

export async function grantLevelAccess(input: {
  student_id: string;
  level_key: string;
  access_type?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  // Get current coach id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  const { error } = await supabase
    .from('student_level_access')
    .upsert({
      student_id: input.student_id,
      access_type: input.access_type ?? 'level',
      level_key: input.level_key,
      source: 'admin_grant',
      granted_by: coach?.id ?? null,
      notes: input.notes ?? null,
      active: true,
    }, {
      onConflict: 'student_id,access_type,level_key',
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/students/${input.student_id}`);
  return { success: true };
}

// ═══════════════════════════════════════
// REVOKE LEVEL ACCESS
// ═══════════════════════════════════════

export async function revokeLevelAccess(input: {
  student_id: string;
  level_key: string;
  access_type?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('student_level_access')
    .update({ active: false })
    .eq('student_id', input.student_id)
    .eq('level_key', input.level_key)
    .eq('access_type', input.access_type ?? 'level');

  if (error) throw new Error(error.message);

  revalidatePath(`/students/${input.student_id}`);
  return { success: true };
}
