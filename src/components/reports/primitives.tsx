// Primitivas de UI compartidas por las páginas de reportes (server-safe: sin
// hooks). Extraídas de admin/analytics para no duplicarlas en cada reporte.
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'navy',
}: {
  icon?: LucideIcon;
  label: string;
  value: number | string;
  sub?: string;
  tone?: 'navy' | 'cyan' | 'emerald' | 'amber' | 'rose';
}) {
  const tones: Record<string, string> = {
    navy: 'bg-[var(--tss-navy)] text-white',
    cyan: 'bg-cyan-50 text-[var(--tss-navy)] border border-cyan-200',
    emerald: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border border-amber-200',
    rose: 'bg-rose-50 text-rose-900 border border-rose-200',
  };
  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between mb-2">
        {Icon ? <Icon size={18} className="opacity-80" /> : <span />}
        <span className="text-[10px] uppercase tracking-wider opacity-70" style={{ fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
      </div>
      <p className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </p>
      {sub ? <p className="text-[11px] opacity-70 mt-1">{sub}</p> : null}
    </div>
  );
}

export function Th({ children, align = 'left' }: { children?: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = 'left',
  mono = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  mono?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${align === 'right' ? 'text-right tabular-nums' : ''}`}
      style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}
    >
      {children}
    </td>
  );
}

/** Tarjeta contenedora estándar de un reporte (título + acción opcional). */
export function ReportCard({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon ? <Icon size={18} className="text-[var(--tss-navy)]" /> : null}
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Formatea *_cents a "$1,234.50". */
export function money(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
