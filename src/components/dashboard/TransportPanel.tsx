'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bus, Check, X, RotateCcw, Download, Copy } from 'lucide-react';
import { listWeekTransports, setTransportStatus, type TransportDay } from '@/lib/actions/transport';

// Coordinator's transport board: every class day in the next 7 days where the
// coach asked for transport, with departure/return times. The coordinator
// resolves each ride: taken or cancelled.

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(t: string | null) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function TransportPanel() {
  const [rows, setRows] = useState<TransportDay[] | null>(null);
  const [pending, start] = useTransition();

  function refresh() {
    listWeekTransports().then(setRows).catch(() => setRows([]));
  }
  useEffect(() => { refresh(); }, []);

  if (!rows || rows.length === 0) return null; // nothing needing transport this week

  function mark(planId: string, status: 'taken' | 'cancelled' | null) {
    start(async () => {
      const r = await setTransportStatus(planId, status);
      if (!r.ok) { alert(r.error || 'Could not save.'); return; }
      refresh();
    });
  }

  const pendingCount = rows.filter((r) => !r.transport_status).length;

  // Only the rides that are actually needed (drop cancelled ones) — this is
  // the list the coordinator forwards to whoever arranges transport.
  const exportRows = (rows ?? []).filter((r) => r.transport_status !== 'cancelled');
  const statusEs = (s: string | null) => (s === 'taken' ? 'Tomado' : s === 'cancelled' ? 'Cancelado' : 'Pendiente');

  function downloadCsv() {
    const header = ['Fecha', 'Servicio', 'Coach', 'Playa', 'Hora clase', 'Salida', 'Regreso', 'Alumnos', 'Estado'];
    const cell = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = exportRows.map((r) => [
      fmtDate(r.session_date), r.camp_name ?? '', r.coach_name ?? '', r.surf_venue ?? '',
      fmtTime(r.class_start_time), fmtTime(r.transport_depart), fmtTime(r.transport_return),
      r.students, statusEs(r.transport_status),
    ].map(cell).join(','));
    const csv = ['﻿' + header.map(cell).join(','), ...lines].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transportes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyText() {
    const lines = exportRows.map((r) =>
      `• ${fmtDate(r.session_date)} — ${r.camp_name ?? 'Servicio'}\n` +
      `  Coach: ${r.coach_name ?? '—'} · ${r.students} alumno${r.students === 1 ? '' : 's'}${r.surf_venue ? ` · 🏖 ${r.surf_venue}` : ''}\n` +
      `  🚐 Salida ${fmtTime(r.transport_depart)} · Regreso ${fmtTime(r.transport_return)}${r.class_start_time ? ` · clase ${fmtTime(r.class_start_time)}` : ''}`
    );
    const text = `🚐 Transportes programados\n\n${lines.join('\n\n')}`;
    navigator.clipboard?.writeText(text).then(
      () => alert('Copiado — ya podés pegarlo en WhatsApp o correo.'),
      () => alert('No se pudo copiar.'),
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tss-navy)]">
          <Bus size={16} className="text-[var(--tss-cyan,#5AC3E7)]" /> Transportes programados
        </h2>
        <div className="flex items-center gap-1.5">
          {pendingCount > 0 && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
          {exportRows.length > 0 && (
            <>
              <button
                onClick={copyText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                title="Copiar como texto (WhatsApp / correo)"
              ><Copy size={12} /> Copiar</button>
              <button
                onClick={downloadCsv}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                title="Descargar CSV"
              ><Download size={12} /> Descargar</button>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.plan_id}
            className={`rounded-xl border p-3 ${
              r.transport_status === 'taken'
                ? 'border-emerald-200 bg-emerald-50/50'
                : r.transport_status === 'cancelled'
                  ? 'border-gray-200 bg-gray-50 opacity-70'
                  : 'border-amber-200 bg-amber-50/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">
                  {fmtDate(r.session_date)}
                  {r.day_number ? ` · Día ${r.day_number}` : ''} — {r.camp_name || 'Servicio'}
                </p>
                <p className="text-[12px] text-gray-600">
                  {r.coach_name || 'Coach'} · {r.students} alumno{r.students === 1 ? '' : 's'}
                  {r.surf_venue ? ` · 🏖 ${r.surf_venue}` : ''}
                  {r.class_start_time ? ` · clase ${fmtTime(r.class_start_time)}` : ''}
                </p>
                <p className="text-[12px] font-medium text-gray-700">
                  🚐 Salida {fmtTime(r.transport_depart)} · Regreso {fmtTime(r.transport_return)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {r.transport_status ? (
                  <>
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${r.transport_status === 'taken' ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {r.transport_status === 'taken' ? '✓ Tomado' : '✗ Cancelado'}
                    </span>
                    <button
                      onClick={() => mark(r.plan_id, null)}
                      disabled={pending}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                      title="Volver a pendiente"
                    ><RotateCcw size={13} /></button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => mark(r.plan_id, 'taken')}
                      disabled={pending}
                      className="inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white disabled:opacity-50"
                    ><Check size={13} strokeWidth={2.5} /> Tomado</button>
                    <button
                      onClick={() => mark(r.plan_id, 'cancelled')}
                      disabled={pending}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-red-600 disabled:opacity-50"
                    ><X size={13} strokeWidth={2.5} /> Cancelado</button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
