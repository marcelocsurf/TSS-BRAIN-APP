'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { getPayrollWeek, remindClosures, markWeekPaid, getCoachPaymentHistory, type PayrollPerson } from '@/lib/actions/payroll';

const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0', CORAL = '#FF6B6B';
const money = (c: number) => `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const fmtDay = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });

function mondayOf(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.toISOString().slice(0, 10);
}
function shiftWeek(iso: string, weeks: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

export function PayrollBoard() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date(Date.now() - 6 * 3600_000)));
  const [data, setData] = useState<Awaited<ReturnType<typeof getPayrollWeek>> | null>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const load = (ws: string) => {
    setData(null); setMsg(null);
    getPayrollWeek(ws).then(setData).catch((e) => setMsg(e?.message ?? 'Error'));
  };
  useEffect(() => { load(weekStart); }, [weekStart]);

  const totals = useMemo(() => {
    const t = { payable: 0, held: 0, paid: 0, open: 0 };
    for (const p of data?.people ?? []) { t.payable += p.payable_cents; t.held += p.held_cents; t.paid += p.paid_cents; t.open += p.open_count; }
    return t;
  }, [data]);

  const weekLabel = data
    ? `${new Date(data.week_start + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${new Date(data.week_end + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
    : '';

  return (
    <div className="space-y-4">
      {/* Selector de semana + totales */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setWeekStart(shiftWeek(weekStart, -1))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm">←</button>
          <p className="font-bold text-[15px]" style={{ color: INK }}>Semana {weekLabel}</p>
          <button type="button" onClick={() => setWeekStart(shiftWeek(weekStart, 1))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm">→</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(6,214,160,.1)' }}>
            <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#0a7c5d' }}>Pagable</p>
            <p className="text-[17px] font-bold" style={{ color: '#0a7c5d' }}>{money(totals.payable)}</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,209,102,.18)' }}>
            <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#7a5c00' }}>Retenido</p>
            <p className="text-[17px] font-bold" style={{ color: '#7a5c00' }}>{money(totals.held)}</p>
            <p className="text-[9px]" style={{ color: '#7a5c00' }}>{totals.open} sin cierre</p>
          </div>
          <div className="rounded-xl p-2.5 bg-gray-50">
            <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Ya emitido</p>
            <p className="text-[17px] font-bold text-gray-600">{money(totals.paid)}</p>
          </div>
        </div>
      </div>

      {/* Tarifas duplicadas — limpieza pendiente del catálogo */}
      {data && data.duplicates.length > 0 && (
        <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,209,102,.14)' }}>
          <p className="text-[11px] font-bold" style={{ color: '#7a5c00' }}>⚠ Tarifas duplicadas en el catálogo (elegí cuál vale en Costs):</p>
          <p className="text-[11px] mt-1" style={{ color: '#7a5c00' }}>
            {data.duplicates.map((d) => `${d.level} · grupo ${d.size}: ${d.values.join(' vs ')}`).join('  ·  ')}
          </p>
        </div>
      )}

      {msg && <p className="text-sm text-red-600">{msg}</p>}
      {data === null && !msg && <p className="text-sm text-gray-400 text-center py-8">Cargando semana…</p>}
      {data && data.people.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Nadie dictó servicios esta semana.</p>}

      {(data?.people ?? []).map((p) => (
        <PersonCard key={p.person_key} p={p} weekStart={data!.week_start} weekEnd={data!.week_end}
          pending={pending} start={start} reload={() => load(weekStart)} />
      ))}
    </div>
  );
}

function PersonCard({ p, weekStart, weekEnd, pending, start, reload }: {
  p: PayrollPerson; weekStart: string; weekEnd: string;
  pending: boolean; start: React.TransitionStartFunction; reload: () => void;
}) {
  const [history, setHistory] = useState<any[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const openDates = p.days.filter((d) => !d.closed).map((d) => fmtDay(d.date));
  const payableSessions = p.days.filter((d) => d.closed && d.rate_cents != null).map((d) => d.session_id);
  const alreadyPaid = p.paid_cents >= p.payable_cents && p.payable_cents > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-bold text-[15px]" style={{ color: INK }}>{p.name}{p.cert ? <span className="text-gray-400 font-normal text-[12px]"> · {p.cert}</span> : null}</p>
          <p className="text-[11px] text-gray-400">{p.roles.join(' + ')} · {p.days.length} día(s)</p>
        </div>
        <div className="text-right">
          <p className="text-[15px] font-bold" style={{ color: '#0a7c5d' }}>{money(p.payable_cents)}</p>
          {p.held_cents > 0 && <p className="text-[11px] font-bold" style={{ color: '#7a5c00' }}>+{money(p.held_cents)} retenido</p>}
          {p.paid_cents > 0 && <p className="text-[10px] text-gray-400">emitido {money(p.paid_cents)}</p>}
        </div>
      </div>

      <div className="mt-2.5 divide-y divide-gray-50">
        {p.days.map((d) => (
          <div key={d.session_id} className="py-1.5 flex items-center justify-between gap-2 text-[12px]">
            <span className="min-w-0 truncate" style={{ color: INK }}>
              <span className="font-mono text-[10px] text-gray-400 mr-1.5">{fmtDay(d.date)}</span>
              {d.service}
              <span className="text-gray-400"> · {d.students} alumno{d.students === 1 ? '' : 's'}</span>
              {d.role !== 'coach' && (
                <span className="ml-1.5 text-[8px] font-bold rounded-full px-1.5 py-0.5 align-middle" style={{ background: 'rgba(0,210,255,.12)', color: '#0090B0' }}>
                  {d.role === 'filmer' ? 'FILMER' : 'ASISTENTE'}
                </span>
              )}
            </span>
            <span className="shrink-0 flex items-center gap-1.5">
              <span className="font-bold" style={{ color: d.rate_cents == null ? '#c04545' : INK }}>
                {d.rate_cents == null ? 'sin tarifa' : money(d.rate_cents)}
              </span>
              <span className="text-[9px] font-bold rounded-full px-2 py-0.5"
                style={d.closed ? { background: 'rgba(6,214,160,.15)', color: '#0a7c5d' } : { background: 'rgba(255,209,102,.25)', color: '#7a5c00' }}>
                {d.closed ? '✓ cerrada' : '⚠ sin cierre'}
              </span>
            </span>
          </div>
        ))}
      </div>

      {p.missing_rate && (
        <p className="text-[11px] mt-2" style={{ color: '#c04545' }}>Falta tarifa en la matriz para algún día — definila en Costs para poder pagar.</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {openDates.length > 0 && p.is_coach && (
          <button type="button" disabled={pending}
            onClick={() => start(async () => { await remindClosures(p.coach_id!, openDates); setNote('🔔 Recordatorio de cierre enviado.'); })}
            className="flex-1 min-w-[140px] rounded-full py-2.5 text-[11px] font-bold border-2 disabled:opacity-50"
            style={{ borderColor: GOLD, color: '#7a5c00', background: '#fff' }}>
            🔔 Recordar cierre ({openDates.length})
          </button>
        )}
        <button type="button" disabled={pending || p.payable_cents <= 0 || alreadyPaid}
          onClick={() => {
            if (!window.confirm(`Emitir pago de ${money(p.payable_cents)} a ${p.name} por ${payableSessions.length} sesión(es) cerradas de la semana?`)) return;
            start(async () => {
              const r = await markWeekPaid({ coachId: p.coach_id, staffMemberId: p.staff_member_id, weekStart, weekEnd, amountCents: p.payable_cents, sessionIds: payableSessions });
              setNote(r.ok ? '✓ Pago registrado y notificado.' : (r.error ?? 'Error'));
              if (r.ok) reload();
            });
          }}
          className="flex-1 min-w-[140px] rounded-full py-2.5 text-[11px] font-bold disabled:opacity-40"
          style={{ background: alreadyPaid ? '#e5e7eb' : GREEN, color: INK }}>
          {alreadyPaid ? '✓ Semana pagada' : `💵 Marcar pagado ${money(p.payable_cents)}`}
        </button>
        <button type="button"
          onClick={() => history === null ? getCoachPaymentHistory(p.person_key).then(setHistory).catch(() => setHistory([])) : setHistory(null)}
          className="rounded-full px-3 py-2.5 text-[11px] border border-gray-200 text-gray-500">
          Historial
        </button>
      </div>
      {note && <p className="text-[11px] font-semibold mt-2" style={{ color: '#0090B0' }}>{note}</p>}

      {history !== null && (
        <div className="mt-2 rounded-xl bg-gray-50 p-3">
          <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">Pagos emitidos</p>
          {history.length === 0 ? <p className="text-[11px] text-gray-400">Sin pagos registrados aún.</p>
            : history.map((h: any) => (
              <p key={h.id} className="text-[11px] text-gray-600">
                {h.period_start} → {h.period_end} · <strong>{money(h.amount_cents)}</strong>{h.method ? ` · ${h.method}` : ''}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
