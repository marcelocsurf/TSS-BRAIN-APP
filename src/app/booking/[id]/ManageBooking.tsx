'use client';

// Cancelar o mover la reserva — el cliente solo, sin llamar a nadie.
// La política de 24 h se muestra SIEMPRE antes de confirmar.

import { useState, useTransition } from 'react';
import { publicCancelBooking, publicMoveBooking, getPublicMoveTargets } from '@/lib/actions/public-classes';

const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166', CORAL = '#FF6B6B';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.08 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };

const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

type Booking = {
  id: string; class_name: string; date: string; time: string | null; first_name: string;
  amount_cents: number | null; paid: boolean; active: boolean; hours_left: number; free_cancel: boolean;
};

export function ManageBooking({ booking }: { booking: Booking }) {
  const [pending, start] = useTransition();
  const [view, setView] = useState<'main' | 'move' | 'cancelled' | 'moved'>('main');
  const [targets, setTargets] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ date?: string; time?: string | null; late?: boolean }>({});

  const price = booking.amount_cents != null ? `$${(booking.amount_cents / 100).toFixed(2)}` : null;

  if (!booking.active || view === 'cancelled') {
    const late = result.late;
    return (
      <div className="text-center space-y-4 py-6">
        <p className="text-[9px]" style={{ ...F_M, color: '#8A98A0' }}>The Surf Sequence</p>
        <h1 className="text-[24px]" style={{ ...F_D, color: INK }}>
          {view === 'cancelled' ? 'Booking cancelled' : 'This booking is no longer active'}
        </h1>
        {view === 'cancelled' && (
          <p className="text-[13px] leading-relaxed rounded-2xl p-4 mx-auto"
            style={late ? { background: 'rgba(255,209,102,.2)', color: '#7a5c00' } : { background: 'rgba(6,214,160,.12)', color: '#0a7c5d' }}>
            {late
              ? `Since this was within 24 hours of class, the full price${price ? ` (${price})` : ''} is still due at front desk — that spot was held for you.`
              : 'Cancelled free of charge — the spot is open for another surfer. Come back any time!'}
          </p>
        )}
        <p className="text-[12px] text-gray-500">Want to book again? Scan the QR at the academy or ask at front desk. 🤙</p>
      </div>
    );
  }

  if (view === 'moved') {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl" style={{ background: 'rgba(6,214,160,.15)' }}>✓</div>
        <h1 className="text-[24px]" style={{ ...F_D, color: INK }}>You&apos;re moved!</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Your new class</p>
          <p className="font-bold text-[15px] mt-1" style={{ color: INK }}>{booking.class_name}</p>
          <p className="text-[13px] text-gray-500">{result.date ? fmtDate(result.date) : ''}{result.time ? ` · ${result.time.slice(0, 5)}` : ''}</p>
        </div>
        <p className="text-[12px] text-gray-500">Same booking, new day — {booking.paid ? 'already paid ✓' : 'pay at front desk before class'}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[9px]" style={{ ...F_M, color: '#8A98A0' }}>Manage your booking</p>
        <h1 className="text-[22px] mt-1" style={{ ...F_D, color: INK }}>Hi, {booking.first_name}!</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Your class</p>
        <p className="font-bold text-[16px] mt-1" style={{ color: INK }}>{booking.class_name}</p>
        <p className="text-[13px] text-gray-500">{fmtDate(booking.date)}{booking.time ? ` · ${booking.time.slice(0, 5)}` : ''}</p>
        <p className="text-[12px] mt-1.5 font-semibold" style={{ color: booking.paid ? '#0a7c5d' : '#7a5c00' }}>
          {booking.paid ? '✓ Paid' : price ? `${price} — pay at front desk` : 'Pay at front desk'}
        </p>
      </div>

      {/* La política, siempre visible ANTES de decidir */}
      <div className="rounded-2xl p-3.5 text-[11.5px] leading-relaxed" style={{ background: '#0A2438', color: 'rgba(247,249,250,.85)', border: '1px solid rgba(0,210,255,.35)' }}>
        <span style={{ ...F_M, color: CYAN }} className="text-[9px] block mb-1">Cancellation policy</span>
        Free cancellation up to <strong>24 hours</strong> before class. Within 24 hours, the full class price is due — the spot was held for you.
        <span className="block mt-1" style={{ color: booking.free_cancel ? '#06D6A0' : GOLD }}>
          {booking.free_cancel
            ? `You still have time: ${booking.hours_left} hours left for free changes.`
            : `Your class is in ${Math.max(booking.hours_left, 0)} hours — changes now mean the full price is due.`}
        </span>
      </div>

      {view === 'main' && (
        <div className="space-y-2">
          <button type="button" disabled={pending}
            onClick={() => { setView('move'); setErr(null); if (targets === null) getPublicMoveTargets(booking.id).then(setTargets).catch(() => setTargets([])); }}
            className="w-full rounded-full py-3.5 text-[10px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
            📅 Move to another date
          </button>
          <button type="button" disabled={pending}
            onClick={() => {
              const msg = booking.free_cancel
                ? 'Cancel this booking? It’s free — you’re more than 24h out.'
                : `Cancel within 24h of class: the full price${price ? ` (${price})` : ''} is still due. Cancel anyway?`;
              if (!window.confirm(msg)) return;
              start(async () => {
                const r = await publicCancelBooking(booking.id);
                if (!r.ok) { setErr(r.error ?? 'Could not cancel.'); return; }
                setResult({ late: r.late });
                setView('cancelled');
              });
            }}
            className="w-full rounded-full py-3.5 text-[10px] border-2" style={{ ...F_M, borderColor: CORAL, color: '#c04545', background: '#fff', fontWeight: 700 }}>
            ✕ Cancel my booking
          </button>
          {err && <p className="text-[12px] text-red-600 text-center">{err}</p>}
        </div>
      )}

      {view === 'move' && (
        <div className="space-y-2">
          <p className="text-[9px] text-gray-400" style={F_M}>Pick a new date · {booking.class_name}</p>
          {targets === null ? <p className="text-[12px] text-gray-400 text-center py-3">Loading dates…</p>
            : targets.length === 0 ? <p className="text-[12px] text-gray-500 text-center py-3">No other dates with room right now — ask at front desk.</p>
            : targets.map((t: any) => (
              <button key={t.id} type="button" disabled={pending}
                onClick={() => start(async () => {
                  setErr(null);
                  const r = await publicMoveBooking(booking.id, t.id);
                  if (!r.ok) { setErr(r.error ?? 'Could not move.'); return; }
                  setResult({ date: r.new_date, time: r.new_time });
                  setView('moved');
                })}
                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 text-left active:scale-[0.99]">
                <span className="text-[13px] font-bold" style={{ color: INK }}>{fmtDate(t.date)}{t.time ? ` · ${t.time.slice(0, 5)}` : ''}</span>
                {t.left != null && <span className="text-[11px]" style={{ color: '#0090B0' }}>{t.left} left</span>}
              </button>
            ))}
          {err && <p className="text-[12px] text-red-600 text-center">{err}</p>}
          <button type="button" onClick={() => setView('main')} className="w-full py-2 text-[11px] text-gray-400">← Back</button>
        </div>
      )}
    </div>
  );
}
