'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

export type BoardStatus = 'available' | 'in_use' | 'in_repair' | 'retired' | 'rented';

export type BoardCondition = 'excellent' | 'good' | 'fair' | 'poor';

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
  // Return condition / damage tracking.
  return_condition: 'good' | 'repair' | 'totaled' | null;
  damage_type: string | null;
  damage_notes: string | null;
  // Signed waiver.
  waiver_signed: boolean;
  waiver_signed_at: string | null;
  signature_path: string | null;
  waiver_text: string | null;
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
  condition: BoardCondition;
  notes: string | null;
  // Usage stats (computed in listBoards) — board lifespan.
  uses?: number;
  first_used?: string | null;
  last_used?: string | null;
}

// Quién puede gestionar el inventario/rentas: (a) sesión de dashboard del
// platform admin o coordinador/admin de la academia, o (b) TOKEN de portal de
// un host/coordinador/admin de la misma academia (el host renta en mostrador).
// Devuelve el actor para created_by.
// Invariante #2: devolver el resultado del guard, nunca lanzar — Next enmascara
// los throw de server actions en producción y el mostrador vería un error genérico.
async function canManage(academyId: string, portalToken?: string | null): Promise<{ ok: boolean; id: string | null; error?: string }> {
  if (portalToken) {
    const admin = createAdminClient();
    const { data: c } = await admin
      .from('coaches')
      .select('id, role, academy_id, active_status, portal_can_manage_boards')
      .eq('portal_token', portalToken)
      .maybeSingle();
    // Coordinación puede otorgar el permiso a un coach/asistente (switch
    // portal_can_manage_boards, 2026-08-22) — mismo patrón que cobertura.
    const ok = c && (c as any).active_status && c.academy_id === academyId &&
      (['host', 'coordinator', 'admin'].includes((c as any).role) || (c as any).portal_can_manage_boards === true);
    if (!ok) return { ok: false, id: null, error: 'No autorizado para gestionar el inventario.' };
    return { ok: true, id: c!.id };
  }
  const me = await getCurrentCoach();
  const isOwnLead =
    (me?.role === 'coordinator' || me?.role === 'admin') && me?.academy_id === academyId;
  if (!me?.is_platform_admin && !isOwnLead) {
    return { ok: false, id: null, error: 'Solo el admin o el coordinador de la academia puede gestionar el inventario.' };
  }
  return { ok: true, id: me?.id ?? null };
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
  condition?: BoardCondition;
  code?: string | null; // optional manual override; otherwise auto-suggested
  portal_token?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const g = await canManage(input.academy_id, input.portal_token);
  if (!g.ok) return { success: false, error: g.error };
  const admin = createAdminClient();

  const code =
    input.code?.trim() ||
    (await suggestCode(admin, input.academy_id, input.board_type, input.length_feet, input.length_inches));

  const { error } = await admin
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
      condition: input.condition ?? 'good',
    });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/academies/${input.academy_id}`);
  return { success: true };
}

export async function updateBoard(
  id: string,
  patch: Partial<Pick<Board, 'code' | 'brand' | 'model' | 'board_type' | 'shape' | 'length_feet' | 'length_inches' | 'volume_liters' | 'status' | 'condition' | 'notes'>>,
  portalToken?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: existing } = await admin.from('boards').select('academy_id').eq('id', id).maybeSingle();
  if (!existing) return { success: false, error: 'Board not found.' };
  const g = await canManage(existing.academy_id, portalToken);
  if (!g.ok) return { success: false, error: g.error };

  const { error } = await admin
    .from('boards')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/academies/${existing.academy_id}`);
  return { success: true };
}

export async function deleteBoard(id: string, portalToken?: string | null): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: existing } = await admin.from('boards').select('academy_id').eq('id', id).maybeSingle();
  if (!existing) return { success: true };
  const g = await canManage(existing.academy_id, portalToken);
  if (!g.ok) return { success: false, error: g.error };
  await admin.from('boards').delete().eq('id', id);
  revalidatePath(`/academies/${existing.academy_id}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Rentals — renting inventory boards to walk-ins (non-students)
// ─────────────────────────────────────────────────────────────

// List rentals for an academy. Active ones first, then most-recent returned.
export async function listRentals(academyId: string, portalToken?: string | null): Promise<Rental[]> {
  const g = await canManage(academyId, portalToken);
  if (!g.ok) return [];
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
  signature_path?: string | null;  // PNG signature already uploaded to the private bucket
  waiver_text?: string | null;     // the waiver text the renter signed
  portal_token?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const actor = await canManage(input.academy_id, input.portal_token);
  if (!actor.ok) return { success: false, error: actor.error };
  const admin = createAdminClient();

  // Board must belong to this academy and not already be rented out.
  const { data: board } = await admin
    .from('boards')
    .select('id, academy_id, status')
    .eq('id', input.board_id)
    .maybeSingle();
  if (!board || board.academy_id !== input.academy_id) return { success: false, error: 'Board not found in this academy.' };
  if (board.status === 'rented') return { success: false, error: 'That board is already rented out.' };
  if (board.status === 'in_use') return { success: false, error: 'That board is assigned to a class right now.' };
  if (board.status === 'in_repair') return { success: false, error: 'That board is in repair.' };
  if (board.status === 'retired') return { success: false, error: 'That board is retired.' };

  const { error } = await admin
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
      created_by: actor.id,
      status: 'active',
      signature_path: input.signature_path || null,
      waiver_text: input.waiver_text || null,
      waiver_signed: !!input.signature_path,
      waiver_signed_at: input.signature_path ? new Date().toISOString() : null,
    });
  if (error) return { success: false, error: error.message };

  // Flip the board to rented so it disappears from the available pool.
  await admin.from('boards').update({ status: 'rented', updated_at: new Date().toISOString() }).eq('id', input.board_id);
  revalidatePath('/dashboard');
  return { success: true };
}

// Delete the renter's ID photo from the private bucket (best-effort).
async function purgeRentalIdDoc(admin: ReturnType<typeof createAdminClient>, path: string | null | undefined) {
  if (!path) return;
  try { await admin.storage.from('rental-ids').remove([path]); } catch { /* non-blocking */ }
}

// Mark a rental returned with the board's condition, free/repair/retire the
// board accordingly, and delete the ID photo (the signature/waiver is kept).
export async function returnRental(
  rentalId: string,
  condition: { return_condition?: 'good' | 'repair' | 'totaled'; damage_type?: string | null; damage_notes?: string | null } = {},
  portalToken?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('board_rentals')
    .select('id, academy_id, board_id, status, id_doc_path')
    .eq('id', rentalId)
    .maybeSingle();
  if (!rental) return { success: false, error: 'Rental not found.' };
  const g = await canManage(rental.academy_id, portalToken);
  if (!g.ok) return { success: false, error: g.error };

  const cond = condition.return_condition ?? 'good';
  // good → back in service; repair → out for repair; totaled → retired.
  const boardStatus: BoardStatus = cond === 'good' ? 'available' : cond === 'repair' ? 'in_repair' : 'retired';

  // Privacy: the moment the board comes back, the ID photo is purged.
  // (The signed waiver/signature is retained as the legal record.)
  await purgeRentalIdDoc(admin, rental.id_doc_path);

  await admin
    .from('board_rentals')
    .update({
      status: 'returned',
      returned_at: new Date().toISOString(),
      id_doc_path: null,
      return_condition: cond,
      damage_type: cond === 'good' ? null : (condition.damage_type?.trim() || null),
      damage_notes: cond === 'good' ? null : (condition.damage_notes?.trim() || null),
      updated_at: new Date().toISOString(),
    })
    .eq('id', rentalId);
  await admin
    .from('boards')
    .update({ status: boardStatus, updated_at: new Date().toISOString() })
    .eq('id', rental.board_id);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function cancelRental(rentalId: string, portalToken?: string | null): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('board_rentals')
    .select('id, academy_id, board_id, status, id_doc_path')
    .eq('id', rentalId)
    .maybeSingle();
  if (!rental) return { success: true };
  const g = await canManage(rental.academy_id, portalToken);
  if (!g.ok) return { success: false, error: g.error };
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
  return { success: true };
}

// Short-lived signed URL for viewing a renter's ID document (private bucket).
export async function getRentalIdUrl(rentalId: string, portalToken?: string | null): Promise<string | null> {
  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('board_rentals')
    .select('academy_id, id_doc_path')
    .eq('id', rentalId)
    .maybeSingle();
  if (!rental?.id_doc_path) return null;
  const g = await canManage(rental.academy_id, portalToken);
  if (!g.ok) return null;
  const { data } = await admin.storage.from('rental-ids').createSignedUrl(rental.id_doc_path, 300);
  return data?.signedUrl ?? null;
}

// Short-lived signed URL for viewing the signed waiver signature (private bucket).
export async function getRentalSignatureUrl(rentalId: string, portalToken?: string | null): Promise<string | null> {
  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('board_rentals')
    .select('academy_id, signature_path')
    .eq('id', rentalId)
    .maybeSingle();
  if (!rental?.signature_path) return null;
  const g = await canManage(rental.academy_id, portalToken);
  if (!g.ok) return null;
  const { data } = await admin.storage.from('rental-ids').createSignedUrl(rental.signature_path, 300);
  return data?.signedUrl ?? null;
}
