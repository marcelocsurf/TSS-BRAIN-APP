'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getWeekOverviewByToken, saveDayLogisticsByToken, setStudentDayBoardByToken,
  applyStudentBoardToWeek,
  type WeekOverview, type WeekDayOverview,
} from '@/lib/actions/service-planner';
import { createBookingByToken, cancelBookingByToken } from '@/lib/actions/spaces';

// ═══ 📅 VISTA SEMANA — planner tipo Excel (pedido de Marcelo 2026-08-21) ═══
// Grilla días × (clase, lugar, transporte, espacios, tablas) para PLANEAR el
// camp de un vistazo. Tap en una celda → editor abajo; "Aplicar a toda la
// semana" replica el valor en los días no cerrados. La edición fina de
// drills/bloques sigue en la vista del día.

type CellKind = 'clase' | 'lugar' | 'transporte' | 'espacios' | 'tablas';

const ROWS: Array<{ kind: CellKind; label: string }> = [
  { kind: 'clase', label: '🕐 Clase' },
  { kind: 'lugar', label: '📍 Lugar' },
  { kind: 'transporte', label: '🚐 Transporte' },
  { kind: 'espacios', label: '🏛 Espacios' },
  { kind: 'tablas', label: '🏄 Tablas' },
];

const dayLabel = (d: WeekDayOverview) => {
  const w = new Date(`${d.session_date}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
  return `D${d.day_number} · ${w}`;
};

export function WeekPlanBoard({ token, campInstanceId, onClose }: {
  token: string;
  campInstanceId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<WeekOverview | null>(null);
  const [sel, setSel] = useState<{ kind: CellKind; sessionId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState('');

  const load = useCallback(() => {
    getWeekOverviewByToken(token, campInstanceId).then(setData).catch(() => setData({ ok: false, error: 'No se pudo cargar.', days: [], students: [], availableBoards: [], academySpaces: [] }));
  }, [token, campInstanceId]);
  useEffect(() => { load(); }, [load]);

  const ping = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2500); };

  if (!data) return <div className="rounded-2xl bg-white p-6"><p className="text-sm text-gray-400">Cargando semana…</p></div>;
  if (!data.ok) return <div className="rounded-2xl bg-white p-6"><p className="text-sm text-rose-600">{data.error}</p></div>;

  const day = sel ? data.days.find((d) => d.camp_session_id === sel.sessionId) ?? null : null;

  const cellContent = (kind: CellKind, d: WeekDayOverview): { text: string; ok: boolean } => {
    switch (kind) {
      case 'clase':
        return { text: d.class_start_time ? d.class_start_time.slice(0, 5) : '—', ok: !!d.class_start_time };
      case 'lugar':
        return { text: d.surf_venue || '—', ok: !!d.surf_venue };
      case 'transporte':
        if (!d.transport_needed) return { text: 'no', ok: true };
        return {
          text: `${d.transport_depart?.slice(0, 5) ?? '¿?'}→${d.transport_return?.slice(0, 5) ?? '¿?'}`,
          ok: !!d.transport_depart,
        };
      case 'espacios':
        return { text: d.spaces.length ? d.spaces.map((s) => s.name).join(', ') : '—', ok: true };
      case 'tablas': {
        const n = d.boards.filter((b) => b.board_id || b.board_type).length;
        const t = data.students.length;
        return { text: t ? `${n}/${t}` : '—', ok: n >= t && t > 0 };
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#0A1628' }}>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">Vista semana</p>
          <p className="text-sm font-bold text-white">{data.campName}</p>
        </div>
        <button type="button" onClick={onClose} className="text-[11px] font-semibold text-white/70 hover:text-white">✕ Cerrar</button>
      </div>

      {flash && <p className="px-4 py-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50">{flash}</p>}

      {/* La grilla — primera columna fija, días con scroll horizontal */}
      <div className="overflow-x-auto">
        <table className="text-[11px] border-collapse min-w-full">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white text-left px-3 py-2 text-gray-500 font-mono text-[9px] uppercase tracking-wider border-b border-gray-100 z-10">Plan</th>
              {data.days.map((d) => (
                <th key={d.camp_session_id} className={`px-2 py-2 text-center border-b border-gray-100 whitespace-nowrap font-semibold ${d.state === 'closed' ? 'text-gray-400' : 'text-[var(--tss-navy)]'}`}>
                  {dayLabel(d)}
                  {d.state === 'closed' && <span className="block text-[8px] text-gray-400 font-normal">cerrado ✓</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.kind}>
                <td className="sticky left-0 bg-white px-3 py-2 font-semibold text-gray-700 whitespace-nowrap border-b border-gray-50 z-10">{row.label}</td>
                {data.days.map((d) => {
                  const c = cellContent(row.kind, d);
                  const closed = d.state === 'closed';
                  const selected = sel?.kind === row.kind && sel.sessionId === d.camp_session_id;
                  return (
                    <td key={d.camp_session_id} className="border-b border-gray-50 p-1">
                      <button
                        type="button"
                        disabled={closed}
                        onClick={() => setSel(selected ? null : { kind: row.kind, sessionId: d.camp_session_id })}
                        className={`w-full min-w-[74px] rounded-lg px-2 py-1.5 text-center truncate max-w-[130px] transition-colors ${
                          closed
                            ? 'bg-gray-50 text-gray-400'
                            : selected
                              ? 'bg-[var(--tss-navy)] text-white'
                              : c.ok
                                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                        }`}
                        title={c.text}
                      >
                        {c.text}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor de la celda seleccionada */}
      {sel && day && (
        <CellEditor
          key={`${sel.kind}-${sel.sessionId}`}
          kind={sel.kind}
          day={day}
          data={data}
          token={token}
          busy={busy}
          setBusy={setBusy}
          onSaved={(msg) => { ping(msg); load(); }}
          onCloseEditor={() => setSel(null)}
        />
      )}

      <p className="px-4 py-2.5 text-[10px] text-gray-500 border-t border-gray-50">
        Verde = listo · Ámbar = falta planear · Los días cerrados no se tocan. Los drills y la evaluación siguen en la vista del día.
      </p>
    </div>
  );
}

function CellEditor({ kind, day, data, token, busy, setBusy, onSaved, onCloseEditor }: {
  kind: CellKind;
  day: WeekDayOverview;
  data: WeekOverview;
  token: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onSaved: (msg: string) => void;
  onCloseEditor: () => void;
}) {
  const [clase, setClase] = useState(day.class_start_time?.slice(0, 5) ?? '');
  const [lugar, setLugar] = useState(day.surf_venue ?? '');
  const [tNeeded, setTNeeded] = useState(!!day.transport_needed);
  const [tDep, setTDep] = useState(day.transport_depart?.slice(0, 5) ?? '');
  const [tRet, setTRet] = useState(day.transport_return?.slice(0, 5) ?? '');
  const [spaceId, setSpaceId] = useState('');
  const [spStart, setSpStart] = useState('');
  const [spEnd, setSpEnd] = useState('');

  const saveLogistics = async (applyWeek: boolean) => {
    const patch =
      kind === 'clase' ? { class_start_time: clase || null }
      : kind === 'lugar' ? { surf_venue: lugar.trim() || null }
      : { transport_needed: tNeeded, transport_depart: tNeeded ? tDep || null : null, transport_return: tNeeded ? tRet || null : null };
    // Reporte de Bauti 2026-08-23: un corte de red dejaba busy=true para
    // siempre y TODOS los Guardar quedaban muertos — finally obligatorio.
    setBusy(true);
    try {
      const r = await saveDayLogisticsByToken(token, day.camp_session_id, patch, applyWeek);
      if (!r.ok) { alert(r.error || 'No se pudo guardar. Revisá tu señal y reintentá.'); return; }
      onSaved(applyWeek ? `✓ Aplicado a ${r.days} días` : '✓ Guardado');
      if (!applyWeek) onCloseEditor();
    } catch {
      alert('Sin conexión — no se guardó. Reintentá.');
    } finally {
      setBusy(false);
    }
  };

  const header = `${dayLabel(day)} · ${ROWS.find((r) => r.kind === kind)?.label}`;

  return (
    <div className="border-t border-gray-100 px-4 py-3 space-y-2.5 bg-gray-50/60">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{header}</p>

      {kind === 'clase' && (
        <div className="flex items-center gap-2">
          <input type="time" value={clase} onChange={(e) => setClase(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" />
          <SaveButtons busy={busy} onDay={() => saveLogistics(false)} onWeek={() => saveLogistics(true)} />
        </div>
      )}

      {kind === 'lugar' && (
        <div className="flex items-center gap-2 flex-wrap">
          <input value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder="Playa / punto (ej. K61, Río Mar)"
            className="flex-1 min-w-[160px] text-sm px-3 py-1.5 rounded-lg border border-gray-200" />
          <SaveButtons busy={busy} onDay={() => saveLogistics(false)} onWeek={() => saveLogistics(true)} />
        </div>
      )}

      {kind === 'transporte' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={tNeeded} onChange={(e) => setTNeeded(e.target.checked)} />
            Necesito transporte este día
          </label>
          {tNeeded && (
            <div className="flex items-center gap-2">
              <input type="time" value={tDep} onChange={(e) => setTDep(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" aria-label="Salida" />
              <span className="text-gray-400 text-xs">→</span>
              <input type="time" value={tRet} onChange={(e) => setTRet(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" aria-label="Regreso" />
            </div>
          )}
          <SaveButtons busy={busy} onDay={() => saveLogistics(false)} onWeek={() => saveLogistics(true)} />
          <p className="text-[10px] text-gray-500">Esto alimenta el tablero 🚐 del Front Desk.</p>
        </div>
      )}

      {kind === 'espacios' && (
        <div className="space-y-2">
          {day.spaces.length > 0 && (
            <div className="space-y-1">
              {day.spaces.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-[12px] bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                  <span className="text-gray-700">🏛 {s.name} · {s.start}–{s.end}</span>
                  {s.mine && (
                    <button type="button" disabled={busy}
                      onClick={async () => {
                        if (!confirm('¿Cancelar esta reserva?')) return;
                        setBusy(true);
                        try {
                          const r = await cancelBookingByToken(token, s.id);
                          if (!r.ok) { alert(r.error || 'No se pudo cancelar.'); return; }
                          onSaved('✓ Reserva cancelada');
                        } catch {
                          alert('Sin conexión — reintentá.');
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-700">✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200">
              <option value="">Espacio…</option>
              {data.academySpaces.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
            <input type="time" value={spStart} onChange={(e) => setSpStart(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" aria-label="Desde" />
            <span className="text-gray-400 text-xs">→</span>
            <input type="time" value={spEnd} onChange={(e) => setSpEnd(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" aria-label="Hasta" />
            <button type="button" disabled={busy || !spaceId || !spStart || !spEnd}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await createBookingByToken(token, {
                    spaceId, date: day.session_date, startTime: spStart, endTime: spEnd,
                    title: data.campName ?? undefined,
                  });
                  if (!r.ok) { alert(r.error || 'No se pudo reservar.'); return; }
                  setSpaceId(''); setSpStart(''); setSpEnd('');
                  onSaved('✓ Espacio reservado');
                } catch {
                  alert('Sin conexión — reintentá.');
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40" style={{ background: 'var(--tss-navy)' }}>
              Reservar
            </button>
          </div>
        </div>
      )}

      {kind === 'tablas' && (
        <div className="space-y-1.5">
          {data.students.length === 0 && <p className="text-[12px] text-gray-500">Sin alumnos activos todavía.</p>}
          {data.students.map((st) => {
            const cur = day.boards.find((b) => b.student_id === st.student_id);
            const curVal = cur?.board_id ?? (cur?.board_type ? `type:${cur.board_type}` : '');
            return (
              <div key={st.student_id} className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                <span className="text-[12px] font-semibold text-gray-700 flex-1 truncate">
                  {(cur?.board_id || cur?.board_type) ? '🏄' : '⚠️'} {st.display_name}
                </span>
                <select
                  value={curVal}
                  disabled={busy}
                  onChange={async (e) => {
                    const v = e.target.value;
                    const inv = data.availableBoards.find((b) => b.id === v);
                    setBusy(true);
                    try {
                      const r = await setStudentDayBoardByToken(token, day.camp_session_id, st.student_id, {
                        board_id: inv?.id ?? null,
                        board_type: inv ? (inv.board_type ?? null) : v.startsWith('type:') ? v.slice(5) : null,
                        board_size_feet: inv?.length_feet ?? null,
                        board_size_inches: inv?.length_inches ?? null,
                      });
                      if (!r.ok) { alert(r.error || 'No se pudo asignar.'); return; }
                      onSaved(`✓ Tabla de ${st.display_name.split(' ')[0]}`);
                    } catch {
                      alert('Sin conexión — reintentá.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="text-[11px] px-2 py-1.5 rounded-lg border border-gray-200 max-w-[46%]"
                >
                  <option value="">Sin tabla</option>
                  {data.availableBoards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} · {b.board_type ?? 'board'}{b.length_feet != null ? ` ${b.length_feet}'${b.length_inches ?? 0}"` : ''}{b.status === 'in_use' ? ' · en uso' : ''}
                    </option>
                  ))}
                  <option value="type:soft-top">Soft-top (sin código)</option>
                  <option value="type:shortboard">Shortboard (sin código)</option>
                  <option value="type:longboard">Longboard (sin código)</option>
                  <option value="type:own">Trae la suya</option>
                </select>
                <button type="button" disabled={busy || !curVal}
                  title="Aplicar su tabla a toda la semana"
                  onClick={async () => {
                    const inv = data.availableBoards.find((b) => b.id === curVal);
                    setBusy(true);
                    try {
                      const r = await applyStudentBoardToWeek(token, day.camp_session_id, st.student_id, {
                        board_id: inv?.id ?? null,
                        board_type: inv ? (inv.board_type ?? null) : curVal.startsWith('type:') ? curVal.slice(5) : null,
                        board_size_feet: inv?.length_feet ?? null,
                        board_size_inches: inv?.length_inches ?? null,
                      });
                      if (!r.ok) { alert(r.error || 'No se pudo aplicar.'); return; }
                      onSaved(`✓ Semana entera para ${st.display_name.split(' ')[0]}${r.skipped ? ` (${r.skipped} días con choque, sin tabla)` : ''}`);
                    } catch {
                      alert('Sin conexión — reintentá.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="text-[10px] font-bold px-2 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[var(--tss-cyan,#5AC3E7)] disabled:opacity-30 shrink-0">
                  ⇥ Semana
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SaveButtons({ busy, onDay, onWeek }: { busy: boolean; onDay: () => void; onWeek: () => void }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button type="button" disabled={busy} onClick={onDay}
        className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40" style={{ background: 'var(--tss-navy)' }}>
        Guardar
      </button>
      <button type="button" disabled={busy} onClick={onWeek}
        className="rounded-full px-3 py-1.5 text-[11px] font-bold border border-gray-200 text-gray-700 hover:border-[var(--tss-cyan,#5AC3E7)] disabled:opacity-40">
        Aplicar a toda la semana
      </button>
    </div>
  );
}
