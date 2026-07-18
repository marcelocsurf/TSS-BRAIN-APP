'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bus, Check, X, RotateCcw, Download, Copy, Clock } from 'lucide-react';
import { listWeekTransports, setTransportStatus, setTransportActualDepart, type TransportDay } from '@/lib/actions/transport';

// Coordinator's transport board: every upcoming class day where the coach asked
// for transport. The coordinator resolves each ride (taken / cancelled) and can
// record the REAL departure time to track how late departures run.

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(t: string | null) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
// Delay in minutes = actual − planned departure (positive = left late). null if
// either time is missing.
function delayMin(planned: string | null, actual: string | null): number | null {
  if (!planned || !actual) return null;
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  return toMin(actual) - toMin(planned);
}
function delayLabel(d: number): string {
  if (d > 0) return `+${d} min tarde`;
  if (d < 0) return `${-d} min antes`;
  return 'a tiempo';
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

  // Average delay across rides that have a real departure recorded — the
  // "how late are we running" number the coordinator wants at a glance.
  const withActual = rows.map((r) => delayMin(r.transport_depart, r.transport_actual_depart)).filter((d): d is number => d != null);
  const avgDelay = withActual.length > 0 ? Math.round(withActual.reduce((a, b) => a + b, 0) / withActual.length) : null;

  function saveActual(planId: string, time: string | null) {
    start(async () => {
      const r = await setTransportActualDepart(planId, time);
      if (!r.ok) { alert(r.error || 'Could not save.'); return; }
      refresh();
    });
  }

  // Only the rides that are actually needed (drop cancelled ones) — this is
  // the list the coordinator forwards to whoever arranges transport.
  const exportRows = (rows ?? []).filter((r) => r.transport_status !== 'cancelled');
  const statusEs = (s: string | null) => (s === 'taken' ? 'Tomado' : s === 'cancelled' ? 'Cancelado' : 'Pendiente');

  function downloadCsv() {
    const header = ['Fecha', 'Servicio', 'Coach', 'Playa', 'Hora clase', 'Salida planeada', 'Salida real', 'Atraso (min)', 'Regreso', 'Alumnos', 'Estado'];
    const cell = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = exportRows.map((r) => {
      const d = delayMin(r.transport_depart, r.transport_actual_depart);
      return [
        fmtDate(r.session_date), r.camp_name ?? '', r.coach_name ?? '', r.surf_venue ?? '',
        fmtTime(r.class_start_time), fmtTime(r.transport_depart),
        r.transport_actual_depart ? fmtTime(r.transport_actual_depart) : '', d ?? '',
        fmtTime(r.transport_return), r.students, statusEs(r.transport_status),
      ].map(cell).join(',');
    });
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
    const lines = exportRows.map((r) => {
      const d = delayMin(r.transport_depart, r.transport_actual_depart);
      const realLine = r.transport_actual_depart
        ? `\n  ⏱ Salió ${fmtTime(r.transport_actual_depart)}${d != null ? ` (${delayLabel(d)})` : ''}`
        : '';
      return `• ${fmtDate(r.session_date)} — ${r.camp_name ?? 'Servicio'}\n` +
        `  Coach: ${r.coach_name ?? '—'} · ${r.students} alumno${r.students === 1 ? '' : 's'}${r.surf_venue ? ` · 🏖 ${r.surf_venue}` : ''}\n` +
        `  🚐 Salida ${fmtTime(r.transport_depart)} · Regreso ${fmtTime(r.transport_return)}${r.class_start_time ? ` · clase ${fmtTime(r.class_start_time)}` : ''}` +
        realLine;
    });
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
          {avgDelay != null && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 border ${
                avgDelay > 5 ? 'text-red-700 bg-red-50 border-red-200' : avgDelay > 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}
              title={`Atraso promedio de salida (${withActual.length} registrado${withActual.length === 1 ? '' : 's'})`}
            >
              <Clock size={11} /> {avgDelay > 0 ? `+${avgDelay}` : avgDelay} min prom.
            </span>
          )}
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

      {/* One card per SERVICE; a compact row per day inside (M139). A coach
          planning 5 straight days = 1 card with 5 rows, not 5 big cards. */}
      <ul className="space-y-2.5">
        {(() => {
          const groups = new Map<string, TransportDay[]>();
          for (const r of rows) {
            const k = r.camp_instance_id ?? r.plan_id;
            const arr = groups.get(k) ?? [];
            arr.push(r);
            groups.set(k, arr);
          }
          return Array.from(groups.entries()).map(([k, days]) => {
            const first = days[0];
            // Beach shown once in the header when uniform; per-day when it varies.
            const venues = new Set(days.map((d) => d.surf_venue ?? ''));
            const uniformVenue = venues.size === 1 ? first.surf_venue : null;
            const pendingDays = days.filter((d) => !d.transport_status).length;
            return (
              <li key={k} className="rounded-xl border border-gray-200 overflow-hidden">
                {/* Service header — once */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-[var(--tss-navy)] min-w-0 truncate">
                    {first.camp_name || 'Servicio'}
                  </p>
                  <p className="text-[11px] text-gray-500 shrink-0">
                    {first.coach_name || 'Coach'} · {first.students} alumno{first.students === 1 ? '' : 's'}
                    {uniformVenue ? ` · 🏖 ${uniformVenue}` : ''}
                    {pendingDays > 0 && <span className="ml-1.5 font-semibold text-amber-700">· {pendingDays} pend.</span>}
                  </p>
                </div>
                {/* Compact day rows */}
                <div className="divide-y divide-gray-50">
                  {days.map((r) => (
                    <div
                      key={r.plan_id}
                      className={`px-3 py-2 ${
                        r.transport_status === 'taken' ? 'bg-emerald-50/40'
                          : r.transport_status === 'cancelled' ? 'bg-gray-50 opacity-60'
                          : 'bg-amber-50/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[12px] text-gray-700 min-w-0">
                          <span className="font-bold text-[var(--tss-navy)]">{fmtDate(r.session_date)}</span>
                          {' '}· 🚐 {fmtTime(r.transport_depart)} → {fmtTime(r.transport_return)}
                          {!uniformVenue && r.surf_venue ? ` · 🏖 ${r.surf_venue}` : ''}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {r.transport_status ? (
                            <>
                              <span className={`text-[10px] font-bold uppercase tracking-wide ${r.transport_status === 'taken' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                {r.transport_status === 'taken' ? '✓ Tomado' : '✗ Cancelado'}
                              </span>
                              <button
                                onClick={() => mark(r.plan_id, null)}
                                disabled={pending}
                                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                                title="Volver a pendiente"
                              ><RotateCcw size={12} /></button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => mark(r.plan_id, 'taken')}
                                disabled={pending}
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500 text-white disabled:opacity-50"
                              ><Check size={12} strokeWidth={2.5} /> Tomado</button>
                              <button
                                onClick={() => mark(r.plan_id, 'cancelled')}
                                disabled={pending}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-white border border-gray-200 text-red-600 disabled:opacity-50"
                              ><X size={12} strokeWidth={2.5} /> Cancelado</button>
                            </>
                          )}
                        </div>
                      </div>
                      {r.transport_status !== 'cancelled' && (
                        <ActualDepartField
                          planId={r.plan_id}
                          planned={r.transport_depart}
                          value={r.transport_actual_depart}
                          pending={pending}
                          onSave={saveActual}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </li>
            );
          });
        })()}
      </ul>
    </div>
  );
}

// Optional "real departure time" input. Saves on blur; shows the delay vs the
// planned departure right next to it.
function ActualDepartField({ planId, planned, value, pending, onSave }: {
  planId: string;
  planned: string | null;
  value: string | null;
  pending: boolean;
  onSave: (planId: string, time: string | null) => void;
}) {
  const [local, setLocal] = useState(value ?? '');
  useEffect(() => setLocal(value ?? ''), [value]);
  const d = delayMin(planned, local || null);
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span className="text-[11px] text-gray-500 shrink-0">Salió a las:</span>
      <input
        type="time"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if ((local || null) !== (value ?? null)) onSave(planId, local || null); }}
        disabled={pending}
        className="text-[12px] px-2 py-1 rounded-lg border border-gray-200 bg-white min-w-0 disabled:opacity-50"
      />
      {d != null && (
        <span className={`text-[11px] font-bold shrink-0 ${d > 5 ? 'text-red-600' : d > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {delayLabel(d)}
        </span>
      )}
    </div>
  );
}
