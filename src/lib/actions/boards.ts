'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

export type BoardStatus = 'available' | 'in_use' | 'in_repair' | 'retired' | 'rented';

export type RentalStatus = 'active' | 'returned' | 'overdue' | 'cancelled';

export interface Rental {
  id: string;
  academy_id: string;
  board_id: string;
  renter_name: string;
  renter_phone: string | null;
  renter_email: string | null;
  id_doc_path: string | null;
  id_doc_type: string | null;
  start_date: string;
  expected_return_date: string | null;
  returned_at: string | null;
  price_total: number | null;
  deposit: number | null;
  currency: string | null;
  status: RentalStatus;
  notes: string | null;
  created_at: string;
  // Joined board summary for display.
  board_code?: string | null;
}

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

// ─────────────────────────────────────────────────────────────
// Rentals — renting inventory boards to walk-ins (non-students)
// ─────────────────────────────────────────────────────────────

// List rentals for an academy. Active ones first, then most-recent returned.
export async function listRentals(academyId: string): Promise<Rental[]> {
  await assertCanManage(academyId);
  const admin = createAdminClient();
  const { data } = await admin
    .from('board_rentals')
    .select('*, boards(code)')
    .eq('academy_id', academyId)
    .order('status', { ascending: true })
    .order('start_date', { ascending: false })
    .limit(200);
  return (data ?? []).map((r: any) => ({
    ...r,
    board_code: r.boards?.code ?? null,
  })) as Rental[];
}

export async function createRental(input: {
  academy_id: string;
  board_id: string;
  renter_name: string;
  renter_phone?: string | null;
  renter_email?: string | null;
  id_doc_path?: string | null;     // already uploaded to the private bucket by the client
  id_doc_type?: string | null;
  start_date?: string | null;
  expected_return_date?: string | null;
  price_total?: number | null;
  deposit?: number | null;
  currency?: string | null;
  notes?: string | null;
}): Promise<Rental> {
  await assertCanManage(input.academy_id);
  const admin = createAdminClient();
  const me = await getCurrentCoach();

  // Board must belong to this academy and not already be rented out.
  const { data: board } = await admin
    .from('boards')
    .select('id, academy_id, status')
    .eq('id', input.board_id)
    .single();
  if (!board || board.academy_id !== input.academy_id) throw new Error('Board not found in this academy.');
  if (board.status === 'rented') throw new Error('That board is already rented out.');
  if (board.status === 'in_use') throw new Error('That board is assigned to a class right now.');
  if (board.status === 'in_repair') throw new Error('That board is in repair.');
  if (board.status === 'retired') throw new Error('That board is retired.');

  const { data, error } = await admin
    .from('board_rentals')
    .insert({
      academy_id: input.academy_id,
      board_id: input.board_id,
      renter_name: input.renter_name.trim(),
      renter_phone: input.renter_phone?.trim() || null,
      renter_email: input.renter_email?.trim() || null,
      id_doc_path: input.id_doc_path || null,
      id_doc_type: input.id_doc_type || null,
      start_date: input.start_date || new Date().toISOString().slice(0, 10),
      expected_return_date: input.expected_return_date || null,
      price_total: input.price_total ?? null,
      deposit: input.deposit ?? null,
      currency: input.currency || 'USD',
      notes: input.notes?.trim() || null,
      created_by: me?.id ?? null,
      status: 'active',
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  // Flip the board to rented so it disappears from the available pool.
  await admin.from('boards').update({ status: 'rented', updated_at: new Date().toISOString() }).eq('id', input.board_id);
  revalidatePath('/dashboard');
  return data as Rental;
}

// Delete the renter's ID photo from the private bucket (best-effort).
async function purgeRentalIdDoc(admin: ReturnType<typeof createAdminClient>, path: string | null | undefined) {
  if (!path) return;
  try { await admin.storage.from('rental-ids').remove([path]); } catch { /* non-blocking */ }
}

// Mark a rental returned, free up the board, and delete the ID photo.
export async function returnRental(rentalId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('board_rentals')
    .select('id, academy_id, board_id, status, id_doc_path')
    .eq('id', rentalId)
    .single();
  if (!rental) throw new Error('Rental not found.');
  await assertCanManage(rental.academy_id);

  // Privacy: the moment the board comes back, the ID photo is purged.
  await purgeRentalIdDoc(admin, rental.id_doc_path);

  await admin
    .from('board_rentals')
    .update({ status: 'returned', returned_at: new Date().toISOString(), id_doc_path: null, updated_at: new Date().toISOString() })
    .eq('id', rentalId);
  await admin
    .from('boards')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', rental.board_id);
  revalidatePath('/dashboard');
}

export async function cancelRental(rentalId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('board_rentals')
    .select('id, academy_id, board_id, status, id_doc_path')
    .eq('id', rentalId)
    .single();
  if (!rental) return;
  await assertCanManage(rental.academy_id);
  await purgeRentalIdDoc(admin, rental.id_doc_path);
  await admin
    .from('board_rentals')
    .update({ status: 'cancelled', id_doc_path: null, updated_at: new Date().toISOString() })
    .eq('id', rentalId);
  // Only free the board if it was held by this rental.
  await admin
    .from('boards')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', rental.board_id)
    .eq('status', 'rented');
  revalidatePath('/dashboard');
}

// Short-lived signed URL for viewing a renter's ID document (private bucket).
export async function getRentalIdUrl(rentalId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('board_rentals')
    .select('academy_id, id_doc_path')
    .eq('id', rentalId)
    .single();
  if (!rental?.id_doc_path) return null;
  await assertCanManage(rental.academy_id);
  const { data } = await admin.storage.from('rental-ids').createSignedUrl(rental.id_doc_path, 300);
  return data?.signedUrl ?? null;
}
