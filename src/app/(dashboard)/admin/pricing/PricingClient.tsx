'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, FileText, CheckCircle2, Send, Ban } from 'lucide-react';
import { updateCoursePrice, type CoursePrice } from '@/lib/actions/pricing';
import {
  generateMonthlyInvoices,
  markInvoiceStatus,
  type AcademyInvoiceWithGrants,
} from '@/lib/actions/invoices';

interface Props {
  prices: CoursePrice[];
  invoices: AcademyInvoiceWithGrants[];
  year: number;
  month: number;
}

const COURSE_LABELS: Record<string, string> = {
  white_belt: 'White Belt',
  yellow_belt: 'Yellow Belt',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatCents(cents: number | null | undefined, currency: string): string {
  if (cents == null) return '—';
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${amount}`;
}

export function PricingClient({ prices, invoices, year, month }: Props) {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1
          className="text-2xl font-bold text-[var(--tss-navy)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Pricing & Invoicing
        </h1>
        <p className="text-xs uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Platform admin · global course prices · monthly academy invoices
        </p>
      </header>

      {/* ── Pricing table ── */}
      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <header className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <DollarSign size={16} className="text-[var(--tss-cyan)]" />
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Course prices</h2>
        </header>
        <ul className="divide-y divide-gray-100">
          {prices.map((p) => (
            <PriceRow key={p.course_key} price={p} onSaved={() => router.refresh()} />
          ))}
        </ul>
        <p className="px-5 py-3 text-[11px] text-gray-400 leading-relaxed">
          New course grants snapshot the current price into <code>course_grants.price_cents</code>. Existing grants keep their original price.
        </p>
      </section>

      {/* ── Invoice generator ── */}
      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <header className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <FileText size={16} className="text-[var(--tss-cyan)]" />
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Monthly invoices</h2>
        </header>

        <PeriodPicker year={year} month={month} />

        <InvoiceGeneratorButton year={year} month={month} />

        {invoices.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-gray-400">
            No invoices for {MONTHS[month - 1]} {year}. Click "Generate" to bundle any un-invoiced grants.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} onChange={() => router.refresh()} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PriceRow({
  price, onSaved,
}: { price: CoursePrice; onSaved: () => void }) {
  const [edit, setEdit] = useState(false);
  const [amount, setAmount] = useState((price.price_cents / 100).toFixed(2));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const save = () => {
    setError('');
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Enter a non-negative number.');
      return;
    }
    const cents = Math.round(parsed * 100);
    startTransition(async () => {
      try {
        await updateCoursePrice(price.course_key, cents, price.currency || 'USD');
        setEdit(false);
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save.');
      }
    });
  };

  return (
    <li className="px-5 py-3 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--tss-navy)]">
          {COURSE_LABELS[price.course_key] ?? price.course_key}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Updated {new Date(price.updated_at).toLocaleDateString()}
        </p>
      </div>
      {edit ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{price.currency}</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
          />
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => { setEdit(false); setAmount((price.price_cents / 100).toFixed(2)); setError(''); }}
            className="text-xs text-gray-500 px-2 py-1"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-[var(--tss-navy)]">
            {formatCents(price.price_cents, price.currency)}
          </span>
          <button
            type="button"
            onClick={() => setEdit(true)}
            className="text-xs text-[var(--tss-cyan)] font-semibold hover:underline"
          >
            Edit
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 ml-2">{error}</p>}
    </li>
  );
}

function PeriodPicker({ year, month }: { year: number; month: number }) {
  const router = useRouter();
  const go = (y: number, m: number) => {
    router.push(`/admin/pricing?year=${y}&month=${m}`);
  };
  const prev = () => {
    const newM = month === 1 ? 12 : month - 1;
    const newY = month === 1 ? year - 1 : year;
    go(newY, newM);
  };
  const next = () => {
    const newM = month === 12 ? 1 : month + 1;
    const newY = month === 12 ? year + 1 : year;
    go(newY, newM);
  };
  return (
    <div className="px-5 py-3 flex items-center gap-3 border-b border-gray-100 bg-gray-50">
      <button type="button" onClick={prev} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100">←</button>
      <span className="text-sm font-semibold text-[var(--tss-navy)]">{MONTHS[month - 1]} {year}</span>
      <button type="button" onClick={next} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100">→</button>
    </div>
  );
}

function InvoiceGeneratorButton({ year, month }: { year: number; month: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const run = () => {
    setMessage('');
    startTransition(async () => {
      try {
        const created = await generateMonthlyInvoices(year, month);
        setMessage(`Generated ${created.length} invoice${created.length === 1 ? '' : 's'}.`);
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Failed to generate.');
      }
    });
  };

  return (
    <div className="px-5 py-3 flex items-center gap-3 border-b border-gray-100">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="px-4 py-2 bg-[var(--tss-cyan)] text-[var(--tss-navy)] rounded-xl text-sm font-semibold disabled:opacity-50"
      >
        {pending ? 'Generating…' : `Generate invoices for ${MONTHS[month - 1]} ${year}`}
      </button>
      {message && <p className="text-xs text-gray-500">{message}</p>}
    </div>
  );
}

function InvoiceRow({
  invoice, onChange,
}: { invoice: AcademyInvoiceWithGrants; onChange: () => void }) {
  const [pending, startTransition] = useTransition();

  const setStatus = (next: 'sent' | 'paid' | 'cancelled') => {
    startTransition(async () => {
      try {
        await markInvoiceStatus(invoice.id, next);
        onChange();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Could not update.');
      }
    });
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <li className="px-5 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">
          {invoice.academy_name ?? invoice.academy_id}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Generated {new Date(invoice.generated_at).toLocaleDateString()}
        </p>
      </div>
      <span className="text-sm font-mono text-[var(--tss-navy)]">
        {formatCents(invoice.total_cents, invoice.currency)}
      </span>
      <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full ${statusColor[invoice.status] ?? statusColor.draft}`}>
        {invoice.status}
      </span>
      {invoice.status === 'draft' && (
        <button type="button" onClick={() => setStatus('sent')} disabled={pending} className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg" title="Mark as sent">
          <Send size={14} />
        </button>
      )}
      {(invoice.status === 'draft' || invoice.status === 'sent') && (
        <button type="button" onClick={() => setStatus('paid')} disabled={pending} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg" title="Mark as paid">
          <CheckCircle2 size={14} />
        </button>
      )}
      {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
        <button type="button" onClick={() => setStatus('cancelled')} disabled={pending} className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg" title="Cancel">
          <Ban size={14} />
        </button>
      )}
    </li>
  );
}
