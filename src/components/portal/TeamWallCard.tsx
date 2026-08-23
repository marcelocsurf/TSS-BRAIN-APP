'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMyTeamWall, postMyTeamWall, type MyTeamData } from '@/lib/actions/programs';

// ─── F2: muro del equipo en el portal del ATLETA ───
// El hilo compartido con su staff (head coach, psicólogo, físico,
// nutricionista): lee y escribe. Autocontenido — null si no tiene equipo.
// Student-facing → inglés. Brand v10.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166';

const fmtDT = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/El_Salvador' });

export function TeamWallCard({ token }: { token: string }) {
  const [data, setData] = useState<MyTeamData | null>(null);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    getMyTeamWall(token).then((r) => { if (r.ok) setData(r.data); }).catch(() => {});
  }, [token]);
  useEffect(() => { load(); }, [load]);

  if (!data) return null;

  const post = async () => {
    setErr(null); setBusy(true);
    const r = await postMyTeamWall(token, body);
    setBusy(false);
    if (!r.ok) { setErr(r.error ?? 'Could not post.'); return; }
    setBody(''); load();
  };

  const latest = data.wall[0] ?? null;

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(155,123,255,.07)', border: '1px solid rgba(155,123,255,.35)' }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#B9A5FF' }}>
            💬 My Team
          </span>
          <span className="text-[10px]" style={{ ...MONO, color: '#B9A5FF' }}>{open ? '▴' : `${data.wall.length}`}</span>
        </div>
        {!open && latest && (
          <p className="text-[11.5px] mt-1.5 truncate" style={{ color: '#b8cad8' }}>
            <b style={{ color: '#dce8f0' }}>{latest.author}:</b> {latest.body}
          </p>
        )}
        {!open && !latest && (
          <p className="text-[11.5px] mt-1.5" style={{ color: '#8aa0b2' }}>Talk with your coaching team — they all read this.</p>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message your team…"
              className="flex-1 rounded-xl px-3 py-2 text-[12px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
            <button type="button" disabled={busy || !body.trim()} onClick={post}
              className="rounded-full px-4 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40" style={{ ...MONO, background: CYAN, color: INK }}>
              Send
            </button>
          </div>
          {err && <p className="text-[10.5px]" style={{ color: '#ffb4a6' }}>{err}</p>}
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {data.wall.map((w) => (
              <div key={w.id} className="rounded-xl px-3 py-2" style={{ background: w.mine ? 'rgba(0,210,255,.08)' : 'rgba(255,255,255,.05)', borderLeft: `3px solid ${w.mine ? CYAN : GOLD}` }}>
                <p className="text-[9.5px] uppercase tracking-wide" style={{ ...MONO, color: w.mine ? CYAN : GOLD }}>
                  {w.author} · {fmtDT(w.created_at)}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: '#eaf4fa' }}>{w.body}</p>
              </div>
            ))}
            {data.wall.length === 0 && <p className="text-[11px]" style={{ color: '#8aa0b2' }}>No messages yet — say hi to your team 🤙</p>}
          </div>
        </div>
      )}
    </div>
  );
}
