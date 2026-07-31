'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { frontDeskSettle } from '@/lib/actions/front-desk';

const F_LABEL: React.CSSProperties = { fontFamily: 'var(--font-plex), monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' };
const money = (c: number | null) => c == null ? '—' : `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

type Seat = {
  participant_id: string; name: string; phone: string | null; waiver_signed: boolean;
  payment_status: string | null; payment_method: string | null; amount_cents: number | null;
  sale_type: string | null; discount_reason: string | null;
};
type Klass = { id: string; name: string; date: string; time: string | null; coach: string | null; capacity: number; seats: Seat[] };

export function DeskBoard({ token, classes }: { token: string; classes: Klass[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [payFor, setPayFor] = useState<string | null>(null);
  const [room, setRoom] = useState('');
  const [q, setQ] = useState('');

  const settle = (participantId: string, method: string) => {
    start(async () => {
      const r = await frontDeskSettle(token, participantId, method);
      if (!r.ok) { alert(r.error); return; }
      setPayFor(null); setRoom('');
      router.refresh();
    });
  };

  const query = q.trim().toLowerCase();

  return (
    <div className="space-y-4">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search by name…"
        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white shadow-sm" />

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
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {!s.waiver_signed && (
                          <span className="text-[9px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgba(255,107,107,.14)', color: '#c04545' }}>Waiver ✗</span>
                        )}
                        {paid ? (
                          <span className="text-[10px] font-bold rounded-full px-2.5 py-1" style={{ background: 'rgba(6,214,160,.15)', color: '#047857' }}>
                            {free ? 'Free ✓ ticket' : 'Paid ✓ ticket'}
                          </span>
                        ) : (
                          <button type="button" disabled={pending}
                            onClick={() => setPayFor(payFor === s.participant_id ? null : s.participant_id)}
                            className="text-[10px] font-bold rounded-full px-2.5 py-1 disabled:opacity-50"
                            style={{ background: 'rgba(255,209,102,.3)', color: '#8a6d1c' }}>
                            Charge {money(s.amount_cents)}
                          </button>
                        )}
                      </div>
                    </div>

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
