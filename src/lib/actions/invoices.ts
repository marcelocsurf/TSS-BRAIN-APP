'use server';

// Monthly invoice generator. Bundles all un-invoiced course_grants per
// academy into a single academy_invoices row per (academy, year, month).
// Idempotent on re-run because UNIQUE(academy_id, period_year, period_month)
// blocks duplicates — instead we patch the existing row with any new
// uninvoiced grants and refresh total_cents.

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { isRealPlatformAdmin } from './auth';

export type AcademyInvoiceRow = {
  id: string;
  academy_id: string;
  period_year: number;
  period_month: number;
  total_cents: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  generated_at: string;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
};

export type AcademyInvoiceWithGrants = AcademyInvoiceRow & {
  academy_name?: string | null;
  grant_count: number;
};

function periodBounds(year: number, month: number): { from: string; to: string } {
  // ISO-formatted [start of month, start of next month).
  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const to = new Date(Date.UTC(year, month, 1)).toISOString();
  return { from, to };
}

// Generate (or refresh) invoices for a given period. Returns the list of
// invoices touched, keyed by academy.
export async function generateMonthlyInvoices(
  year: number,
  month: number,
): Promise<AcademyInvoiceWithGrants[]> {
  if (month < 1 || month > 12) throw new Error('Month must be 1–12.');
  const real = await isRealPlatformAdmin();
  if (!real) throw new Error('Not authorized.');

  const admin = createAdminClient();
  const { from, to } = periodBounds(year, month);

  // Pull every grant in the period that is NOT yet invoiced.
  const { data: grants, error: gErr } = await admin
    .from('course_grants')
    .select('id, academy_id, price_cents, currency, granted_at, invoiced_in')
    .gte('granted_at', from)
    .lt('granted_at', to)
    .is('invoiced_in', null);
  if (gErr) throw new Error(gErr.message);

  if (!grants || grants.length === 0) return [];

  // Group by academy. Skip grants without academy_id (legacy rows) and
  // without price (course_prices not yet set).
  const buckets = new Map<string, { total: number; currency: string; ids: string[] }>();
  for (const g of grants) {
    if (!g.academy_id || !g.price_cents) continue;
    const cur = buckets.get(g.academy_id) ?? {
      total: 0,
      currency: (g.currency as string | null) ?? 'USD',
      ids: [] as string[],
    };
    cur.total += g.price_cents;
    cur.ids.push(g.id as string);
    buckets.set(g.academy_id, cur);
  }

  const results: AcademyInvoiceWithGrants[] = [];

  for (const [academyId, bucket] of buckets) {
    // Upsert the invoice row. UNIQUE constraint on (academy_id, year, month)
    // means we'll get the existing row when re-running for the same period.
    const { data: existing } = await admin
      .from('academy_invoices')
      .select('id, total_cents, status')
      .eq('academy_id', academyId)
      .eq('period_year', year)
      .eq('period_month', month)
      .maybeSingle();

    let invoiceId: string;
    let newTotal = bucket.total;

    if (existing) {
      if (existing.status !== 'draft') {
        // Already sent/paid/cancelled — don't append. Skip.
        continue;
      }
      newTotal = (existing.total_cents ?? 0) + bucket.total;
      invoiceId = existing.id;
      const { error: updErr } = await admin
        .from('academy_invoices')
        .update({ total_cents: newTotal })
        .eq('id', invoiceId);
      if (updErr) throw new Error(updErr.message);
    } else {
      const { data: ins, error: insErr } = await admin
        .from('academy_invoices')
        .insert({
          academy_id: academyId,
          period_year: year,
          period_month: month,
          total_cents: bucket.total,
          currency: bucket.currency,
          status: 'draft',
        })
        .select('id')
        .single();
      if (insErr || !ins) throw new Error(insErr?.message ?? 'Failed to create invoice');
      invoiceId = ins.id;
    }

    // Stamp invoiced_in on every grant we just bundled.
    await admin
      .from('course_grants')
      .update({ invoiced_in: invoiceId })
      .in('id', bucket.ids);

    const { data: academy } = await admin
      .from('academies')
      .select('name')
      .eq('id', academyId)
      .maybeSingle();

    results.push({
      id: invoiceId,
      academy_id: academyId,
      academy_name: academy?.name ?? null,
      period_year: year,
      period_month: month,
      total_cents: newTotal,
      currency: bucket.currency,
      status: 'draft',
      generated_at: new Date().toISOString(),
      sent_at: null,
      paid_at: null,
      notes: null,
      grant_count: bucket.ids.length,
    });
  }

  revalidatePath('/admin/pricing');
  return results;
}

export async function markInvoiceStatus(
  invoiceId: string,
  status: 'draft' | 'sent' | 'paid' | 'cancelled',
): Promise<void> {
  const real = await isRealPlatformAdmin();
  if (!real) throw new Error('Not authorized.');

  const patch: Record<string, unknown> = { status };
  if (status === 'sent') patch.sent_at = new Date().toISOString();
  if (status === 'paid') patch.paid_at = new Date().toISOString();

  const admin = createAdminClient();
  const { error } = await admin
    .from('academy_invoices')
    .update(patch)
    .eq('id', invoiceId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/pricing');
}

// Per-academy listing — used by both admin and the academy's own billing
// view. The caller is responsible for authorization.
export async function listAcademyInvoices(academyId: string): Promise<AcademyInvoiceRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('academy_invoices')
    .select('*')
    .eq('academy_id', academyId)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false });
  return (data ?? []) as AcademyInvoiceRow[];
}

// Cents owed in the current month NOT yet rolled into an invoice. Useful
// for an "Accruing this month" tile on the academy billing view.
export async function getCurrentMonthAccrual(academyId: string): Promise<{
  cents: number;
  currency: string;
  count: number;
}> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const { from, to } = periodBounds(year, month);

  const admin = createAdminClient();
  const { data } = await admin
    .from('course_grants')
    .select('price_cents, currency')
    .eq('academy_id', academyId)
    .gte('granted_at', from)
    .lt('granted_at', to)
    .is('invoiced_in', null);

  let cents = 0;
  let currency = 'USD';
  for (const g of data ?? []) {
    if (!g.price_cents) continue;
    cents += g.price_cents;
    if (g.currency) currency = g.currency;
  }
  return { cents, currency, count: data?.length ?? 0 };
}

// Returns invoices across every academy for one period — admin overview.
export async function listInvoicesForPeriod(
  year: number,
  month: number,
): Promise<AcademyInvoiceWithGrants[]> {
  const real = await isRealPlatformAdmin();
  if (!real) throw new Error('Not authorized.');

  const admin = createAdminClient();
  const { data } = await admin
    .from('academy_invoices')
    .select('*, academies(name)')
    .eq('period_year', year)
    .eq('period_month', month)
    .order('total_cents', { ascending: false });

  return (data ?? []).map((row: any) => ({
    id: row.id,
    academy_id: row.academy_id,
    academy_name: row.academies?.name ?? null,
    period_year: row.period_year,
    period_month: row.period_month,
    total_cents: row.total_cents,
    currency: row.currency,
    status: row.status,
    generated_at: row.generated_at,
    sent_at: row.sent_at,
    paid_at: row.paid_at,
    notes: row.notes,
    grant_count: 0, // not joined here for speed; could compute via separate query if needed
  }));
}
