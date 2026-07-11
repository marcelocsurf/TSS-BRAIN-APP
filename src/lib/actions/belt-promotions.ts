'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { BELT_RANK, type BeltLevel } from '@/lib/constants/belts';
import { revalidatePath } from 'next/cache';

export interface PendingPromotion {
  id: string;
  student_id: string;
  student_name: string;
  from_belt: string | null;
  recommended_belt: string;
  recommended_by_name: string | null;
  coach_max_belt: string | null;
  camp_instance_id: string | null;
  created_at: string;
}

// List pending belt-promotion recommendations the current viewer may act on.
// Admins/coordinators see all; a coach sees the ones for camps they head.
// Guarded so a missing table returns [] instead of throwing.
export async function listPendingPromotions(): Promise<PendingPromotion[]> {
  const me = await getCurrentCoach().catch(() => null);
  if (!me) return [];
  const admin = createAdminClient();

  try {
    let query = admin
      .from('belt_promotion_recommendations')
      .select('id, student_id, from_belt, recommended_belt, recommended_by_name, coach_max_belt, camp_instance_id, created_at, students!inner(first_name, last_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    const role = (me as any).role;
    if (role !== 'admin' && role !== 'coordinator') {
      // Coaches only see recommendations for camps they head; admins and
      // coordinators see everything (they can confirm when their own
      // certification covers the belt).
      const { data: camps } = await admin
        .from('camp_instances')
        .select('id')
        .eq('head_coach_id', (me as any).id);
      const ids = (camps ?? []).map((c: any) => c.id);
      if (ids.length === 0) return [];
      query = query.in('camp_instance_id', ids);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      student_name: `${r.students?.first_name ?? ''} ${r.students?.last_name ?? ''}`.trim() || 'Student',
      from_belt: r.from_belt,
      recommended_belt: r.recommended_belt,
      recommended_by_name: r.recommended_by_name,
      coach_max_belt: r.coach_max_belt,
      camp_instance_id: r.camp_instance_id,
      created_at: r.created_at,
    }));
  } catch {
    return [];
  }
}

// Confirm or reject a pending recommendation. Authority: admin, or the head
// coach of the camp the recommendation came from. On confirm, the student's
// belt is promoted UP to the recommended belt.
export async function resolvePromotion(
  recommendationId: string,
  confirm: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentCoach().catch(() => null);
  if (!me) return { ok: false, error: 'Not signed in.' };
  const admin = createAdminClient();

  const { data: rec, error: recErr } = await admin
    .from('belt_promotion_recommendations')
    .select('id, student_id, recommended_belt, camp_instance_id, status')
    .eq('id', recommendationId)
    .single();
  if (recErr || !rec) return { ok: false, error: 'Recommendation not found.' };
  if (rec.status !== 'pending') return { ok: false, error: 'Already resolved.' };

  // Authority check (policy 2026-07-11): the person confirming must be able
  // to accredit the recommended belt themselves — admin bypasses; everyone
  // else needs max_belt_permission >= the belt AND a position of authority
  // (coordinator, or head coach of the originating camp).
  let authorized = (me as any).role === 'admin';
  if (!authorized) {
    const cap = ((me as any).max_belt_permission || 'black_belt') as BeltLevel;
    const beltOk =
      rec.recommended_belt in BELT_RANK &&
      (BELT_RANK[cap] ?? 0) >= (BELT_RANK[rec.recommended_belt as BeltLevel] ?? 99);
    let positionOk = (me as any).role === 'coordinator';
    if (!positionOk && rec.camp_instance_id) {
      const { data: camp } = await admin
        .from('camp_instances')
        .select('head_coach_id')
        .eq('id', rec.camp_instance_id)
        .single();
      positionOk = camp?.head_coach_id === (me as any).id;
    }
    authorized = beltOk && positionOk;
    if (!authorized) {
      return {
        ok: false,
        error: beltOk
          ? 'Only an admin, a coordinator, or the camp head coach can confirm this.'
          : 'Your coach certification does not cover this belt — ask someone certified for it to confirm.',
      };
    }
  }

  if (confirm) {
    const newBelt = rec.recommended_belt as BeltLevel;
    if (newBelt in BELT_RANK) {
      const { data: stu } = await admin
        .from('students')
        .select('belt_level')
        .eq('id', rec.student_id)
        .single();
      const currentRank = stu?.belt_level ? BELT_RANK[stu.belt_level as BeltLevel] ?? 0 : 0;
      if (BELT_RANK[newBelt] > currentRank) {
        await admin.from('students').update({ belt_level: newBelt }).eq('id', rec.student_id);
      }
    }
  }

  const { error } = await admin
    .from('belt_promotion_recommendations')
    .update({
      status: confirm ? 'confirmed' : 'rejected',
      resolved_by: (me as any).id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', recommendationId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath(`/students/${rec.student_id}`);
  return { ok: true };
}
