'use server';

import { createClient } from '@/lib/supabase/server';
import type { CoachRole } from '@/lib/constants/brand';

export interface CurrentCoach {
  id: string;
  display_name: string;
  role: CoachRole;
}

export async function getCurrentCoach(): Promise<CurrentCoach | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('coaches')
    .select('id, display_name, role')
    .eq('auth_user_id', user.id)
    .single();

  if (!data) return null;
  return data as CurrentCoach;
}

// Quick permission checks (async required by 'use server' directive)
export async function isAdmin(role: CoachRole): Promise<boolean> {
  return role === 'admin';
}

export async function isCoordinatorOrAbove(role: CoachRole): Promise<boolean> {
  return role === 'admin' || role === 'coordinator';
}

export async function isCoachOrAbove(role: CoachRole): Promise<boolean> {
  return role === 'admin' || role === 'coordinator' || role === 'coach';
}
