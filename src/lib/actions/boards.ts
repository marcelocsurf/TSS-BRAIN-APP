'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

export type BoardStatus = 'available' | 'in_use' | 'in_repair' | 'retired';

export interface Board {
  id: string;
  academy_id: string;
  code: string;
  board_type: string | null;
  shape: string | null;
  length_feet: number | null;
  length_inches: number | null;
  volume_liters: string | null;
  status: BoardStatus;
  notes: string | null;
}

// Only the platform admin or the academy's own coordinator/admin can manage
// the inventory.
async function assertCanManage(academyId: string) {
  const me = await getCurrentCoach();
  const isOwnLead =
    (me?.role === 'coordinator' || me?.role === 'admin') && me?.academy_id === academyId;
  if (!me?.is_platform_admin && !isOwnLead) {
    throw new Error('Solo el admin o el coordinador de la academia puede gestionar el inventario.');
  }
}

export async function listBoards(academyId: string): Promise<Board[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('boards')
    .select('*')
    .eq('academy_id', academyId)
    .order('code');
  return (data ?? []) as Board[];
}

// Suggest a readable, unique code: e.g. SOFT-7.2-03 / HARD-6-01.
async function suggestCode(
  admin: ReturnType<typeof createAdminClient>,
  academyId: string,
  boardType: string | null,
  feet: number | null,
  inches: number | null,
): Promise<string> {
  const typeAbbr = (boardType || 'BOARD').toUpperCase().slice(0, 4);
  const size = feet != null ? `${feet}${inches ? '.' + inches : ''}` : 'NA';
  const base = `${typeAbbr}-${size}`;
  const { data } = await admin
    .from('boards')
    .select('code')
    .eq('academy_id', academyId)
    .ilike('code', `${base}-%`);
  const seq = (data?.length ?? 0) + 1;
  let code = `${base}-${String(seq).padStart(2, '0')}`;
  // Guard against collisions if codes were deleted/reused.
  const taken = new Set((data ?? []).map((b: any) => b.code));
  let n = seq;
  while (taken.has(code)) {
    n += 1;
    code = `${base}-${String(n).padStart(2, '0')}`;
  }
  return code;
}

export async function createBoard(input: {
  academy_id: string;
  board_type: string | null;
  shape: string | null;
  length_feet: number | null;
  length_inches: number | null;
  volume_liters: string | null;
  notes: string | null;
  code?: string | null; // optional manual override; otherwise auto-suggested
}): Promise<Board> {
  await assertCanManage(input.academy_id);
  const admin = createAdminClient();

  const code =
    input.code?.trim() ||
    (await suggestCode(admin, input.academy_id, input.board_type, input.length_feet, input.length_inches));

  const { data, error } = await admin
    .from('boards')
    .insert({
      academy_id: input.academy_id,
      code,
      board_type: input.board_type,
      shape: input.shape,
      length_feet: input.length_feet,
      length_inches: input.length_inches,
      volume_liters: input.volume_liters?.trim() || null,
      notes: input.notes?.trim() || null,
      status: 'available',
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/academies/${input.academy_id}`);
  return data as Board;
}

export async function updateBoard(
  id: string,
  patch: Partial<Pick<Board, 'code' | 'board_type' | 'shape' | 'length_feet' | 'length_inches' | 'volume_liters' | 'status' | 'notes'>>,
): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin.from('boards').select('academy_id').eq('id', id).single();
  if (!existing) throw new Error('Board not found.');
  await assertCanManage(existing.academy_id);

  const { error } = await admin
    .from('boards')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/academies/${existing.academy_id}`);
}

export async function deleteBoard(id: string): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin.from('boards').select('academy_id').eq('id', id).single();
  if (!existing) return;
  await assertCanManage(existing.academy_id);
  await admin.from('boards').delete().eq('id', id);
  revalidatePath(`/academies/${existing.academy_id}`);
}
