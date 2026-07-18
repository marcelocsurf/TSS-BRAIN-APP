'use client';

import { useEffect, useState } from 'react';
import { ClipboardCheck, ChevronDown, Clock, Circle } from 'lucide-react';
import { getRecentCloses, getPendingServices, type SessionClose, type PendingService } from '@/lib/actions/session-closes';

// Coordinator oversight panel (M137): recent coach closes with their internal
// feedback + services still pending close. Collapsible, sits at the bottom.

const STATUS: Record<string, { label: string; dot: string; text: string }> = {
  competent: { label: 'Achieved', dot: '#10B981', text: 'text-emerald-700' },
  achieved: { label: 'Achieved', dot: '#10B981', text: 'text-emerald-700' },
  partial: { label: 'Partial', dot: '#F59E0B', text: 'text-amber-700' },
  not_yet: { label: 'Not yet', dot: '#EF4444', text: 'text-red-600' },
};

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}
function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function RecentClosesPanel() {
  const [open, setOpen] = useState(false);
  const [closes, setCloses] = useState<SessionClose[] | null>(null);
  const [pending, setPending] = useState<PendingService[]>([]);

  useEffect(() => {
    getRecentCloses(7).then(setCloses).catch(() => setCloses([]));
    getPendingServices().then(setPending).catch(() => setPending([]));
  }, []);

  if (!closes) return null;
  if (closes.length === 0 && pending.length === 0) return null;

  const newCount = closes.filter((c) => c.is_new).length;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 p-5"
      >
        <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tss-navy)]">
          <ClipboardCheck size={16} className="text-[var(--tss-cyan,#5AC3E7)]" /> Cierres y feedback
          <span className="text-[11px] font-semibold text-gray-500">· {closes.length} esta semana</span>
          {newCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-[var(--tss-cyan,#5AC3E7)] rounded-full px-2 py-0.5">{newCount} nuevo{newCount > 1 ? 's' : ''}</span>
          )}
          {pending.length > 0 && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">{pending.length} sin cerrar</span>
          )}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Pending close (started, not closed) */}
          {pending.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber-600 mb-1.5 inline-flex items-center gap-1">
                <Clock size={11} /> En curso · pendientes de cerrar
              </p>
              <div className="space-y-1.5">
                {pending.map((p) => (
                  <div key={p.camp_session_id} className="rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2 flex items-center justify-between gap-2">
                    <span className="text-[12px] text-gray-800 min-w-0 truncate">
                      <span className="font-semibold">{p.camp_name || 'Servicio'}</span>
                      {p.day_number ? ` · Día ${p.day_number}` : ''} · {fmtDate(p.session_date)}
                    </span>
                    <span className="text-[11px] text-amber-700 shrink-0">{p.coach_name || 'Coach'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent closes with feedback */}
          {closes.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">Cierres · últimos 7 días</p>
              <div className="space-y-2">
                {closes.map((c) => (
                  <div key={c.camp_session_id} className={`rounded-xl border p-3 ${c.is_new ? 'border-[var(--tss-cyan,#5AC3E7)]/50 bg-[var(--tss-cyan,#5AC3E7)]/5' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-[var(--tss-navy)] min-w-0 truncate">
                        {c.camp_name || 'Servicio'}{c.day_number ? ` · Día ${c.day_number}` : ''}
                        {c.is_new && <span className="ml-1.5 text-[9px] font-bold uppercase text-[var(--tss-cyan,#0369A1)]">nuevo</span>}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">{fmtWhen(c.closed_at)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2">Cerró: {c.coach_name || 'Coach'}</p>
                    <div className="space-y-1.5">
                      {c.students.map((s, i) => {
                        const st = STATUS[s.status ?? ''] ?? { label: '—', dot: '#9CA3AF', text: 'text-gray-500' };
                        return (
                          <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <Circle size={8} fill={st.dot} strokeWidth={0} />
                              <span className="text-[12px] font-semibold text-gray-800">{s.name}</span>
                              <span className={`text-[10px] font-semibold ${st.text}`}>{st.label}</span>
                            </div>
                            {s.feedback && <p className="text-[11px] text-gray-600 leading-snug mt-0.5">💬 {s.feedback}</p>}
                            {s.whats_next && <p className="text-[11px] text-gray-500 leading-snug">→ {s.whats_next}</p>}
                            {!s.feedback && !s.whats_next && <p className="text-[10px] text-gray-400 italic mt-0.5">Sin comentarios</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
