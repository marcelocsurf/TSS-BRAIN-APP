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

// Quick permission checks
export function isAdmin(role: CoachRole): boolean {
  return role === 'admin';
}

export function isCoordinatorOrAbove(role: CoachRole): boolean {
  return role === 'admin' || role === 'coordinator';
}

export function isCoachOrAbove(role: CoachRole): boolean {
  return role === 'admin' || role === 'coordinator' || role === 'coach';
}
