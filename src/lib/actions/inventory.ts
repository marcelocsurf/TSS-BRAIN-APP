'use server';

// Academy inventory — quantity-based operational stock (gym, surf
// consumables, skate, tech, misc). Token-gated: any active team member of
// the academy (coach or support) can count and update; every save logs an
// inventory_checks row so the coordinator keeps the full history — the
// digital version of the weekly Excel check.

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';

export interface InventoryItem {
  id: string;
  category: string;
  name: string;
  unit: string | null;
  qty_in_use: number;
  qty_in_stock: number;
  minimum: number | null;
  notes: string | null;
  updated_at: string;
  updated_by_name?: string | null;
}

// Resolve the acting member + their academy. With a portal_token → the coach
// portal / support member (token-gated). With token null → session auth (the
// dashboard), which respects the platform admin's act-as academy via
// getCurrentCoach(). Either way we get {admin, coach:{id, academy_id}}.
async function resolveMember(token: string | null) {
  const admin = createAdminClient();
  if (token) {
    const { data: coach } = await admin
      .from('coaches')
      .select('id, academy_id, display_name, active_status')
      .eq('portal_token', token)
      .maybeSingle();
    if (!coach || coach.active_status === false || !coach.academy_id) return null;
    return { admin, coach };
  }
  const me = await getCurrentCoach();
  if (!me?.academy_id) return null;
  return { admin, coach: { id: me.id, academy_id: me.academy_id, display_name: me.display_name, active_status: true } };
}

export async function getInventory(token: string | null): Promise<InventoryItem[]> {
  const ctx = await resolveMember(token);
  if (!ctx) return [];
  try {
    const { data } = await ctx.admin
      .from('academy_inventory_items')
      .select('id, category, name, unit, qty_in_use, qty_in_stock, minimum, notes, updated_at, coaches:updated_by(display_name)')
      .eq('academy_id', ctx.coach.academy_id)
      .eq('active', true)
      .order('category')
      .order('display_order')
      .order('name');
    return (data ?? []).map((r: any) => ({
      id: r.id, category: r.category, name: r.name, unit: r.unit ?? null,
      qty_in_use: r.qty_in_use ?? 0, qty_in_stock: r.qty_in_stock ?? 0,
      minimum: r.minimum ?? null, notes: r.notes ?? null, updated_at: r.updated_at,
      updated_by_name: (Array.isArray(r.coaches) ? r.coaches[0] : r.coaches)?.display_name ?? null,
    }));
  } catch {
    return []; // table not migrated yet — portal keeps working
  }
}

// Save a count for one item (autosave on blur). Updates the item AND logs a
// check row — who counted what, when, with what note.
export async function saveInventoryCount(
  token: string | null,
  itemId: string,
  patch: { qty_in_use?: number; qty_in_stock?: number; notes?: string | null; minimum?: number | null; name?: string; unit?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await resolveMember(token);
  if (!ctx) return { ok: false, error: 'Not authorized.' };

  const fields: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: ctx.coach.id };
  if (patch.qty_in_use !== undefined) fields.qty_in_use = Math.max(0, Math.floor(patch.qty_in_use));
  if (patch.qty_in_stock !== undefined) fields.qty_in_stock = Math.max(0, Math.floor(patch.qty_in_stock));
  if (patch.notes !== undefined) fields.notes = patch.notes?.trim() || null;
  if (patch.minimum !== undefined) fields.minimum = patch.minimum == null ? null : Math.max(0, Math.floor(patch.minimum));
  if (patch.name !== undefined && patch.name.trim()) fields.name = patch.name.trim();
  if (patch.unit !== undefined) fields.unit = patch.unit?.trim() || null;

  const { data: item, error } = await ctx.admin
    .from('academy_inventory_items')
    .update(fields)
    .eq('id', itemId)
    .eq('academy_id', ctx.coach.academy_id) // never touch another academy's stock
    .select('id, qty_in_use, qty_in_stock, notes')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!item) return { ok: false, error: 'Item not found.' };

  // History row — best-effort, never blocks the count.
  await ctx.admin.from('inventory_checks').insert({
    academy_id: ctx.coach.academy_id,
    item_id: itemId,
    qty_in_use: item.qty_in_use,
    qty_in_stock: item.qty_in_stock,
    note: patch.notes?.trim() || null,
    checked_by: ctx.coach.id,
  }).then(() => {}, () => {});

  return { ok: true };
}

// Add an item discovered while counting ("we bought 5 tokawi leashes").
export async function addInventoryItem(
  token: string | null,
  input: { category: string; name: string; unit?: string | null; qty_in_use?: number; qty_in_stock?: number; minimum?: number | null },
): Promise<{ ok: boolean; error?: string; item?: InventoryItem }> {
  const ctx = await resolveMember(token);
  if (!ctx) return { ok: false, error: 'Not authorized.' };
  if (!input.name?.trim()) return { ok: false, error: 'Item name is required.' };

  const { data, error } = await ctx.admin
    .from('academy_inventory_items')
    .insert({
      academy_id: ctx.coach.academy_id,
      category: input.category?.trim() || 'Misc',
      name: input.name.trim(),
      unit: input.unit?.trim() || null,
      qty_in_use: Math.max(0, Math.floor(input.qty_in_use ?? 0)),
      qty_in_stock: Math.max(0, Math.floor(input.qty_in_stock ?? 0)),
      minimum: input.minimum != null ? Math.max(0, Math.floor(input.minimum)) : null,
      updated_by: ctx.coach.id,
    })
    .select('id, category, name, unit, qty_in_use, qty_in_stock, minimum, notes, updated_at')
    .single();
  if (error || !data) return { ok: false, error: error?.message || 'Could not add the item.' };
  return { ok: true, item: { ...data, updated_by_name: ctx.coach.display_name } as InventoryItem };
}
