'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

// Purchase requisitions (M136). Built from the inventory items that are below
// their minimum: a snapshot of what to buy + how many. Shown on the manager
// dashboard and printable to PDF for purchasing.

export interface RequisitionItem {
  name: string;
  unit: string | null;
  category: string | null;
  in_stock: number;
  minimum: number;
  needed: number; // minimum − in_stock (at least 1)
}

export interface Requisition {
  id: string;
  academy_id: string | null;
  created_by_name: string | null;
  status: string; // open | ordered | received | cancelled
  note: string | null;
  items: RequisitionItem[];
  created_at: string;
}

// Resolve academy: token (coach/support portal) OR session (dashboard, respects
// the platform admin's act-as academy).
async function resolveScope(token: string | null) {
  const admin = createAdminClient();
  if (token) {
    const { data: coach } = await admin
      .from('coaches').select('id, academy_id, display_name, active_status')
      .eq('portal_token', token).maybeSingle();
    if (!coach || coach.active_status === false || !coach.academy_id) return null;
    return { admin, academyId: coach.academy_id as string, coachId: coach.id as string, name: coach.display_name as string | null };
  }
  const me = await getCurrentCoach();
  if (!me?.academy_id) return null;
  return { admin, academyId: me.academy_id, coachId: me.id, name: me.display_name };
}

// Create a requisition from every item currently below its minimum.
export async function createRequisitionFromLowStock(
  token: string | null,
  note?: string,
): Promise<{ ok: boolean; id?: string; count?: number; error?: string }> {
  const ctx = await resolveScope(token);
  if (!ctx) return { ok: false, error: 'Not authorized.' };

  const { data: items, error } = await ctx.admin
    .from('academy_inventory_items')
    .select('name, unit, category, qty_in_stock, minimum')
    .eq('academy_id', ctx.academyId)
    .eq('active', true)
    .not('minimum', 'is', null);
  if (error) return { ok: false, error: error.message };

  const low: RequisitionItem[] = (items ?? [])
    .filter((i: any) => i.minimum != null && (i.qty_in_stock ?? 0) < i.minimum)
    .map((i: any) => ({
      name: i.name,
      unit: i.unit ?? null,
      category: i.category ?? null,
      in_stock: i.qty_in_stock ?? 0,
      minimum: i.minimum,
      needed: Math.max(1, i.minimum - (i.qty_in_stock ?? 0)),
    }))
    .sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '') || a.name.localeCompare(b.name));

  if (low.length === 0) return { ok: false, error: 'No hay ítems bajo el mínimo — nada que pedir.' };

  const { data: req, error: insErr } = await ctx.admin
    .from('inventory_requisitions')
    .insert({
      academy_id: ctx.academyId,
      created_by: ctx.coachId,
      created_by_name: ctx.name,
      status: 'open',
      note: note?.trim() || null,
      items: low,
    })
    .select('id')
    .single();
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath('/dashboard');
  return { ok: true, id: req.id, count: low.length };
}

// Dashboard list — recent requisitions for the current academy.
export async function listRequisitions(): Promise<Requisition[]> {
  const ctx = await resolveScope(null);
  if (!ctx) return [];
  const { data, error } = await ctx.admin
    .from('inventory_requisitions')
    .select('id, academy_id, created_by_name, status, note, items, created_at')
    .eq('academy_id', ctx.academyId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) return [];
  return (data ?? []) as Requisition[];
}

export async function getRequisition(id: string): Promise<(Requisition & { academy_name: string | null }) | null> {
  const ctx = await resolveScope(null);
  if (!ctx) return null;
  const { data } = await ctx.admin
    .from('inventory_requisitions')
    .select('id, academy_id, created_by_name, status, note, items, created_at, academies:academy_id(name)')
    .eq('id', id)
    .eq('academy_id', ctx.academyId)
    .maybeSingle();
  if (!data) return null;
  const academy = Array.isArray((data as any).academies) ? (data as any).academies[0] : (data as any).academies;
  return { ...(data as any), academy_name: academy?.name ?? null } as Requisition & { academy_name: string | null };
}

export async function setRequisitionStatus(
  id: string,
  status: 'open' | 'ordered' | 'received' | 'cancelled',
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await resolveScope(null);
  if (!ctx) return { ok: false, error: 'Not authorized.' };
  const { error } = await ctx.admin
    .from('inventory_requisitions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('academy_id', ctx.academyId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}
