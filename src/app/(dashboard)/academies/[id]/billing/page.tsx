import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach, isRealPlatformAdmin } from '@/lib/actions/auth';
import {
  listAcademyInvoices,
  getCurrentMonthAccrual,
} from '@/lib/actions/invoices';
import { FileText, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatCents(cents: number | null | undefined, currency: string): string {
  if (cents == null) return '—';
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${amount}`;
}

export default async function AcademyBillingPage({ params }: Props) {
  const { id } = await params;

  const me = await getCurrentCoach();
  const isAdmin = await isRealPlatformAdmin();
  // Coordinators of this academy can see their own bill; admins can see any.
  if (!me) redirect('/');
  if (!isAdmin && me.academy_id !== id) redirect('/dashboard');

  const admin = createAdminClient();
  const { data: academy } = await admin
    .from('academies')
    .select('id, name')
    .eq('id', id)
    .maybeSingle();
  if (!academy) redirect('/dashboard');

  const [invoices, accrual] = await Promise.all([
    listAcademyInvoices(id),
    getCurrentMonthAccrual(id),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <Link href={`/academies/${id}`} className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Back to academy
        </Link>
        <h1
          className="text-2xl font-bold text-[var(--tss-navy)]"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          Billing — {academy.name}
        </h1>
      </div>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Accruing this month (un-invoiced)
        </p>
        <p className="text-2xl font-semibold text-[var(--tss-navy)] font-mono">
          {formatCents(accrual.cents, accrual.currency)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {accrual.count} course grant{accrual.count === 1 ? '' : 's'} this period
        </p>
      </section>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <header className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <FileText size={16} className="text-[var(--tss-cyan)]" />
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Invoices</h2>
        </header>
        {invoices.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-gray-400">No invoices yet for this academy.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {invoices.map((inv) => {
              const statusColor: Record<string, string> = {
                draft: 'bg-gray-100 text-gray-600',
                sent: 'bg-amber-50 text-amber-700',
                paid: 'bg-emerald-50 text-emerald-700',
                cancelled: 'bg-red-50 text-red-700',
              };
              return (
                <li key={inv.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--tss-navy)]">
                      {MONTHS[inv.period_month - 1]} {inv.period_year}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Generated {new Date(inv.generated_at).toLocaleDateString()}
                      {inv.paid_at ? ` · Paid ${new Date(inv.paid_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-[var(--tss-navy)]">
                    {formatCents(inv.total_cents, inv.currency)}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full ${statusColor[inv.status] ?? statusColor.draft}`}>
                    {inv.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {isAdmin && (
          <p className="px-5 py-3 text-[11px] text-gray-400 border-t border-gray-100">
            Status changes (sent / paid / cancelled) live in the admin panel: <Link href="/admin/pricing" className="text-[var(--tss-cyan)] hover:underline">Pricing & Invoicing</Link>.
          </p>
        )}
      </section>
    </div>
  );
}
