'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { resetEmailSwitchCache } from '@/lib/email-switch';

export type EmailSettingRow = { kind: string; enabled: boolean; label: string; audience: 'student' | 'coach' | 'staff' | 'lead'; updated_at: string };

export async function listEmailSettings(): Promise<EmailSettingRow[]> {
  if (!(await isRealPlatformAdmin())) return [];
  const admin = createAdminClient();
  const { data } = await admin.from('email_settings').select('*').order('audience').order('kind');
  return (data ?? []) as EmailSettingRow[];
}

export async function setEmailEnabled(kind: string, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  if (!(await isRealPlatformAdmin())) return { ok: false, error: 'Solo admin.' };
  const admin = createAdminClient();
  const { error } = await admin.from('email_settings').update({ enabled, updated_at: new Date().toISOString() }).eq('kind', kind);
  if (error) return { ok: false, error: error.message };
  resetEmailSwitchCache();
  return { ok: true };
}
