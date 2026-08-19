'use client';

import { useEffect, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { getMyMessages, markMyMessagesRead, type MyMessage } from '@/lib/actions/programs';

// ─── Mensajes del coach (buzón simple del cockpit HP) — Home del portal ───
// Portal del alumno = fondo OSCURO. Chrome de la tarjeta en inglés; el cuerpo
// del mensaje es del coach (va tal cual lo escribió). Autocontenida: null sin
// mensajes → cero impacto en los alumnos sin HP.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

function prettyDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CoachMessagesCard({ token }: { token: string }) {
  const [messages, setMessages] = useState<MyMessage[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getMyMessages(token)
      .then((r) => { if (r.ok) setMessages(r.messages); })
      .catch(() => {});
  }, [token]);

  if (messages.length === 0) return null;
  const unread = messages.filter((m) => !m.read).length;

  const openBox = () => {
    setOpen(true);
    if (unread > 0) {
      markMyMessagesRead(token)
        .then(() => setMessages((ms) => ms.map((m) => ({ ...m, read: true }))))
        .catch(() => {});
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openBox}
        className="w-full text-left rounded-2xl p-4"
        style={{ background: 'rgba(0,210,255,.05)', border: '1px solid rgba(0,210,255,.35)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ ...MONO, color: '#00D2FF' }}>
            <Mail size={12} /> From your coach
          </span>
          {unread > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#00D2FF', color: '#061C2B' }}>
              {unread} new
            </span>
          )}
        </div>
        <p className="text-[13px] mt-1.5 truncate" style={{ color: '#f4f9fc' }}>
          {messages[0].subject || messages[0].body}
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{ background: '#061C2B', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setOpen(false)} className="text-[11px] uppercase tracking-wider" style={{ ...MONO, color: '#8aa0b2' }}>
                ← Home
              </button>
              <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#00D2FF' }}>Messages</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} color="#8aa0b2" /></button>
            </div>
            {messages.map((m) => (
              <div key={m.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>
                    {m.coach_name || 'Your coach'} · {prettyDate(m.created_at)}
                  </p>
                </div>
                {m.subject && <p className="text-[14px] font-bold mt-1" style={{ color: '#f4f9fc' }}>{m.subject}</p>}
                <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed" style={{ color: '#cfdde8' }}>{m.body}</p>
              </div>
            ))}
            <p className="text-center text-[9px] uppercase tracking-wider py-2" style={{ ...MONO, color: '#57707f' }}>
              The Surf Sequence · Messages
            </p>
          </div>
        </div>
      )}
    </>
  );
}
