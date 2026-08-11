'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { frontDeskSettle, getTransferTargets, deskTransferSeat, deskAdjustSeatPayment, deskSetRoom } from '@/lib/actions/front-desk';
import { publicCancelBooking, publicMoveBooking, getPublicMoveTargets } from '@/lib/actions/public-classes';
import { SeatContactPanel } from '@/components/shared/SeatContactPanel';

const F_LABEL: React.CSSProperties = { fontFamily: 'var(--font-plex), monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' };
const money = (c: number | null) => c == null ? '—' : `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

type Seat = {
  participant_id: string; name: string; phone: string | null; email?: string | null; waiver_signed: boolean;
  payment_status: string | null; payment_method: string | null; amount_cents: number | null;
  sale_type: string | null; discount_reason: string | null;
  // Trazabilidad del sign-up (Cony 2026-08-10)
  room_number?: string | null; notes?: string | null; reserved_at?: string | null; booked_via?: string | null;
};
type Klass = { id: string; name: string; date: string; time: string | null; coach: string | null; capacity: number; seats: Seat[] };

export function DeskBoard({ token, classes, onChanged }: { token: string; classes: Klass[]; onChanged?: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // La página /front-desk es un server component → router.refresh() basta.
  // Embebido en HostPortal el board se carga client-side, así que además
  // avisamos por onChanged para que el HOY re-consulte tras cobrar/mover/cancelar.
  const afterChange = () => { router.refresh(); onChanged?.(); };
  const [payFor, setPayFor] = useState<string | null>(null);
  const [room, setRoom] = useState('');
  // Waiver pendiente tras cobrar: aviso persistente hasta que lo cierren.
  const [waiverWarn, setWaiverWarn] = useState<string | null>(null);
  // Ajuste de cobro (host cubre al coordinador): paquete/cortesía/monto.
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [q, setQ] = useState('');
  // Mover / cancelar en el mostrador — mismo motor y política de 24 h que el
  // link del cliente (publicCancel/MoveBooking con actor 'desk').
  const [manageFor, setManageFor] = useState<string | null>(null);
  const [targets, setTargets] = useState<Record<string, any[]>>({});
  // Transferencia de GRUPO (otro servicio): Novice día 2 → Foundation, etc.
  const [transferFor, setTransferFor] = useState<string | null>(null);
  const [transferTargets, setTransferTargets] = useState<Record<string, any[]>>({});

  const openTransfer = (s: Seat) => {
    setTransferFor(transferFor === s.participant_id ? null : s.participant_id);
    if (!transferTargets[s.participant_id]) {
      getTransferTargets(token, s.participant_id)
        .then((t) => setTransferTargets((p) => ({ ...p, [s.participant_id]: t })))
        .catch(() => setTransferTargets((p) => ({ ...p, [s.participant_id]: [] })));
    }
  };

  const transferSeat = (s: Seat, target: any) => {
    if (!window.confirm(`Transferir a ${s.name} al grupo "${target.name}" (${target.date})? El pago y la bitácora viajan con él.`)) return;
    start(async () => {
      const r = await deskTransferSeat(token, s.participant_id, target.id);
      if (!r.ok) { alert(r.error); return; }
      setTransferFor(null); setManageFor(null);
      afterChange();
    });
  };

  const hoursTo = (c: Klass) => (new Date(`${c.date}T${(c.time || '23:59').slice(0, 5)}:00-06:00`).getTime() - Date.now()) / 3600_000;

  const cancelSeat = (s: Seat, c: Klass) => {
    const late = hoursTo(c) < 24;
    const msg = late
      ? `Cancelar a ${s.name} DENTRO de las 24 h: debe la clase completa (${money(s.amount_cents)}). ¿Cancelar igual?`
      : `Cancelar a ${s.name} (falta más de 24 h — sin cargo). ¿Confirmar?`;
    if (!window.confirm(msg)) return;
    start(async () => {
      const r = await publicCancelBooking(s.participant_id, 'desk');
      if (!r.ok) { alert(r.error); return; }
      setManageFor(null);
      afterChange();
    });
  };

  const openMove = (s: Seat) => {
    if (!targets[s.participant_id]) {
      getPublicMoveTargets(s.participant_id).then((t) => setTargets((p) => ({ ...p, [s.participant_id]: t }))).catch(() => setTargets((p) => ({ ...p, [s.participant_id]: [] })));
    }
  };

  const moveSeat = (s: Seat, targetId: string) => {
    start(async () => {
      const r = await publicMoveBooking(s.participant_id, targetId, 'desk');
      if (!r.ok) { alert(r.error); return; }
      setManageFor(null);
      afterChange();
    });
  };

  const settle = (participantId: string, method: string) => {
    start(async () => {
      const r = await frontDeskSettle(token, participantId, method);
      if (!r.ok) { alert(r.error); return; }
      // El cobro ya quedó registrado; el waiver pendiente se avisa aparte
      // (antes esto TRABABA el cobro y la reserva quedaba en "pendiente").
      if (r.warning) setWaiverWarn(r.warning);
      setPayFor(null); setRoom('');
      afterChange();
    });
  };

  // Guardar la habitación del huésped en la reserva.
  // Ajustar el cobro de un asiento: incluido en paquete del hotel, cortesía,
  // o monto especial con razón. Auditado en la nota del asiento.
  const adjust = (participantId: string, kind: 'package' | 'courtesy' | 'custom') => {
    start(async () => {
      const cents = kind === 'custom' ? Math.round(parseFloat(adjAmount) * 100) : undefined;
      if (kind === 'custom' && (!Number.isFinite(cents) || (cents as number) < 0)) { alert('Escribí un monto válido.'); return; }
      const r = await deskAdjustSeatPayment(token, participantId, { kind, amount_cents: cents, reason: adjReason.trim() || undefined });
      if (!r.ok) { alert(r.error); return; }
      setPayFor(null); setAdjAmount(''); setAdjReason('');
      afterChange();
    });
  };

  const query = q.trim().toLowerCase();

  return (
    <div className="space-y-4">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search by name…"
        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white shadow-sm" />

      {/* Cobrado con waiver pendiente: el dinero ya quedó registrado, pero la
          firma sigue faltando y eso es lo que frena la entrada al agua. */}
      {waiverWarn && (
        <div className="rounded-2xl p-3.5 space-y-2" style={{ background: 'rgba(255,209,102,.2)', border: '1px solid rgba(255,209,102,.6)' }}>
          <p className="text-[12.5px] font-bold leading-snug" style={{ color: '#7a5c00' }}>⚠ {waiverWarn}</p>
          <p className="text-[11px]" style={{ color: '#a08030' }}>
            Mandale el link del waiver desde 👥 Clientes (botón 📧 o 📋 para WhatsApp), o que lo firme en el QR de la clase.
          </p>
          <button type="button" onClick={() => setWaiverWarn(null)}
            className="rounded-full px-4 py-2 text-[10px]" style={{ ...F_LABEL, background: '#061C2B', color: '#fff', fontWeight: 700 }}>
            Entendido
          </button>
        </div>
      )}

      {classes.length === 0 && <p className="text-sm text-gray-400 text-center py-10">No classes in the next 7 days.</p>}

      {classes.map((c) => {
        const seats = query ? c.seats.filter((s) => s.name.toLowerCase().includes(query)) : c.seats;
        if (query && seats.length === 0) return null;
        return (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div>
                <p className="text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>{fmtDate(c.date)}{c.time ? ` · ${c.time}` : ''}</p>
                <p className="font-bold text-[15px]" style={{ color: '#061C2B' }}>{(c.name ?? '').split(' · ')[0]}{c.coach ? <span className="text-gray-400 font-normal text-[12px]"> · {c.coach}</span> : null}</p>
              </div>
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">{c.seats.length}/{c.capacity || '∞'}</span>
            </div>

            {seats.length === 0 && <p className="text-[12px] text-gray-400">No one enrolled yet.</p>}
            <div className="divide-y divide-gray-50">
              {seats.map((s) => {
                const paid = s.payment_status === 'paid';
                const free = s.sale_type === 'courtesy';
                return (
                  <div key={s.participant_id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ color: '#061C2B' }}>{s.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {free ? (s.discount_reason || 'Courtesy') : `${money(s.amount_cents)}${s.discount_reason ? ` · ${s.discount_reason}` : ''}`}
                          {paid && s.payment_method ? ` · ${s.payment_method.startsWith('room:') ? `room ${s.payment_method.slice(5)}` : s.payment_method}` : ''}
                          {/* Huésped: la habitación se ve de un vistazo. */}
                          {s.room_number ? ` · 🏨 ${s.room_number}` : ''}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        <button type="button" aria-label="Detalle, mover o cancelar"
                          onClick={() => { const next = manageFor === s.participant_id ? null : s.participant_id; setManageFor(next); if (next) openMove(s); }}
                          className="text-[13px] font-bold rounded-full w-6 h-6 leading-none border border-gray-200 text-gray-400">⋯</button>
                        {!s.waiver_signed && (
                          <span className="text-[9px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgba(255,107,107,.14)', color: '#c04545' }}>Waiver ✗</span>
                        )}
                        {paid ? (
                          <span className="text-[10px] font-bold rounded-full px-2.5 py-1" style={{ background: 'rgba(6,214,160,.15)', color: '#047857' }}>
                            {free ? 'Free ✓ ticket' : 'Paid ✓ ticket'}
                          </span>
                        ) : (
                          <button type="button" disabled={pending}
                            onClick={() => {
                              const opening = payFor !== s.participant_id;
                              // Cobrar a la habitación: pre-llenar con la del huésped.
                              if (opening) setRoom(s.room_number ?? '');
                              setPayFor(opening ? s.participant_id : null);
                            }}
                            className="text-[10px] font-bold rounded-full px-2.5 py-1 disabled:opacity-50"
                            style={{ background: 'rgba(255,209,102,.3)', color: '#8a6d1c' }}>
                            Charge {money(s.amount_cents)}
                          </button>
                        )}
                      </div>
                    </div>

                    {manageFor === s.participant_id && (
                      <div className="mt-2 space-y-1.5 rounded-xl p-2.5" style={{ background: '#F7F9FA' }}>
                        {/* Quién es y por dónde entró la reserva (Cony 2026-08-10).
                            Mismo bloque que la Agenda — fuente única. */}
                        <SeatContactPanel
                          seat={s}
                          disabled={pending}
                          onSaveRoom={(room) => deskSetRoom(token, s.participant_id, room).then((r) => { if (r.ok) afterChange(); return r; })}
                        />

                        <p className="text-[8px] text-gray-400" style={F_LABEL}>Mover de fecha · {(c.name ?? '').split(' · ')[0]}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(targets[s.participant_id] ?? []).length === 0
                            ? <span className="text-[11px] text-gray-400">{targets[s.participant_id] ? 'Sin otras fechas con cupo.' : 'Cargando fechas…'}</span>
                            : (targets[s.participant_id] ?? []).slice(0, 8).map((t: any) => (
                              <button key={t.id} type="button" disabled={pending} onClick={() => moveSeat(s, t.id)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-gray-200 disabled:opacity-50" style={{ color: '#061C2B' }}>
                                {fmtDate(t.date)}{t.time ? ` · ${t.time.slice(0, 5)}` : ''}{t.left != null ? ` (${t.left})` : ''}
                              </button>
                            ))}
                        </div>
                        <button type="button" disabled={pending} onClick={() => openTransfer(s)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border disabled:opacity-50"
                          style={{ borderColor: '#00D2FF', color: '#0090B0', background: '#fff' }}>
                          🔁 Transferir a otro grupo/servicio
                        </button>
                        {transferFor === s.participant_id && (
                          <div className="mt-1.5 space-y-1 max-h-52 overflow-y-auto">
                            {(transferTargets[s.participant_id] ?? []).length === 0
                              ? <p className="text-[11px] text-gray-400">{transferTargets[s.participant_id] ? 'Sin grupos con cupo.' : 'Cargando grupos…'}</p>
                              : (transferTargets[s.participant_id] ?? []).map((t: any) => (
                                <button key={t.id} type="button" disabled={pending} onClick={() => transferSeat(s, t)}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] bg-white border border-gray-200 disabled:opacity-50 text-left">
                                  <span className="min-w-0 truncate" style={{ color: '#061C2B' }}>
                                    <strong>{t.name}</strong> · {fmtDate(t.date)}{t.time ? ` ${t.time.slice(0, 5)}` : ''}
                                  </span>
                                  <span className="shrink-0 text-[10px] ml-1" style={{ color: t.full ? '#b45309' : '#9ca3af' }}>
                                    {t.price_cents != null ? `$${(t.price_cents / 100).toFixed(0)}` : ''}{t.full ? ' · LLENO (sobrecupo)' : t.left != null ? ` · ${t.left} libre${t.left === 1 ? '' : 's'}` : ''}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}
                        <button type="button" disabled={pending} onClick={() => cancelSeat(s, c)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 disabled:opacity-50"
                          style={{ borderColor: '#FF6B6B', color: '#c04545', background: '#fff' }}>
                          ✕ Cancelar reserva {hoursTo(c) < 24 ? '(⚠ <24 h: debe la clase completa)' : '(sin cargo, +24 h)'}
                        </button>
                      </div>
                    )}

                    {payFor === s.participant_id && !paid && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {(['cash', 'card', 'transfer'] as const).map((m) => (
                          <button key={m} type="button" disabled={pending} onClick={() => settle(s.participant_id, m)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#061C2B] text-white disabled:opacity-50 capitalize">
                            {m === 'cash' ? '💵 Cash' : m === 'card' ? '💳 Card' : '🏦 Transfer'}
                          </button>
                        ))}
                        <span className="inline-flex items-center gap-1">
                          <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room #"
                            className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-[11px]" />
                          <button type="button" disabled={pending || !room.trim()} onClick={() => settle(s.participant_id, `room:${room.trim()}`)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-40"
                            style={{ background: '#00D2FF', color: '#061C2B' }}>
                            🏨 To room
                          </button>
                        </span>

                        {/* Ajustar cobro — el host cubre al coordinador (Cony
                            2026-08-09): paquete del hotel / cortesía / monto
                            especial. Queda auditado en la nota del asiento. */}
                        <div className="w-full mt-1.5 pt-1.5 border-t border-gray-100">
                          <p className="text-[8px] text-gray-400 mb-1" style={F_LABEL}>Ajustar cobro (queda en la nota)</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button type="button" disabled={pending} onClick={() => adjust(s.participant_id, 'package')}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border disabled:opacity-50"
                              style={{ borderColor: '#06D6A0', color: '#0a7c5d', background: 'rgba(6,214,160,.08)' }}>
                              🏨 Incluido en paquete ($0)
                            </button>
                            <button type="button" disabled={pending} onClick={() => adjust(s.participant_id, 'courtesy')}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border disabled:opacity-50"
                              style={{ borderColor: '#FFD166', color: '#8a6d1c', background: 'rgba(255,209,102,.12)' }}>
                              🎁 Cortesía ($0)
                            </button>
                            <span className="inline-flex items-center gap-1">
                              <span className="text-[11px] text-gray-400">$</span>
                              <input value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} placeholder="0.00" inputMode="decimal"
                                className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-[11px]" />
                              <input value={adjReason} onChange={(e) => setAdjReason(e.target.value)} placeholder="Razón (ej. paquete, promo)"
                                className="w-36 px-2 py-1.5 border border-gray-200 rounded-lg text-[11px]" />
                              <button type="button" disabled={pending || !adjAmount.trim()} onClick={() => adjust(s.participant_id, 'custom')}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-40"
                                style={{ background: '#061C2B', color: '#fff' }}>
                                Guardar
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
