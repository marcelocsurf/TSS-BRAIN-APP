'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

export type BoardStatus = 'available' | 'in_use' | 'in_repair' | 'retired';

export interface Board {
  id: string;
  academy_id: string;
  code: string;
  brand: string | null;
  model: string | null;
  board_type: string | null;
  shape: string | null;
  length_feet: number | null;
  length_inches: number | null;
  volume_liters: string | null;
  status: BoardStatus;
  notes: string | null;
  // Usage stats (computed in listBoards) — board lifespan.
  uses?: number;
  first_used?: string | null;
  last_used?: string | null;
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
  const boards = (data ?? []) as Board[];
  if (boards.length === 0) return boards;

  // Attach usage stats (total uses + first/last) per board.
  const { data: usages } = await admin
    .from('board_usages')
    .select('board_id, session_date, created_at')
    .in('board_id', boards.map((b) => b.id));
  const byBoard = new Map<string, { count: number; dates: string[] }>();
  for (const u of usages ?? []) {
    const e = byBoard.get((u as any).board_id) ?? { count: 0, dates: [] };
    e.count += 1;
    const d = (u as any).session_date ?? ((u as any).created_at ? String((u as any).created_at).slice(0, 10) : null);
    if (d) e.dates.push(d);
    byBoard.set((u as any).board_id, e);
  }
  for (const b of boards) {
    const e = byBoard.get(b.id);
    b.uses = e?.count ?? 0;
    const sorted = (e?.dates ?? []).sort();
    b.first_used = sorted[0] ?? null;
    b.last_used = sorted[sorted.length - 1] ?? null;
  }
  return boards;
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
  brand?: string | null;
  model?: string | null;
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
      brand: input.brand?.trim() || null,
      model: input.model?.trim() || null,
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
  patch: Partial<Pick<Board, 'code' | 'brand' | 'model' | 'board_type' | 'shape' | 'length_feet' | 'length_inches' | 'volume_liters' | 'status' | 'notes'>>,
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
