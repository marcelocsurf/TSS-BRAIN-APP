'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMyTodayExtras, markMyStaffTaskDone, type MyTodayExtras } from '@/lib/actions/programs';

// ─── F3 en la vista TODAY del atleta: dieta del micro + sesiones del staff ───
// Lo que la nutricionista y los especialistas dejan cae directo en SU día.
// Autocontenido: null si no hay nada. Student-facing → inglés. Brand v10.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const INK = '#061C2B', GOLD = '#FFD166', GREEN = '#39D98A';

const KIND_ICON: Record<string, string> = { fisico: '💪', mental: '🧠', tecnico: '🎯', nutricion: '🥗', otro: '📌' };

function toEmbedUrl(url: string): string | null {
  const m = url.match(/youtube\.com\/watch\?v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function TodayExtras({ token, initial }: { token: string; initial?: MyTodayExtras | null }) {
  const [data, setData] = useState<MyTodayExtras | null>(initial ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const load = useCallback(() => {
    getMyTodayExtras(token).then((r) => { if (r.ok) setData(r.data); }).catch(() => {});
  }, [token]);
  useEffect(() => { if (initial === undefined) load(); }, [load]);

  if (!data) return null;

  const done = async (id: string) => {
    setBusy(id);
    const r = await markMyStaffTaskDone(token, id);
    setBusy(null);
    if (r.ok) load();
  };

  return (
    <>
      {/* 🥗 Dieta del microciclo + nota de hoy */}
      {(data.diet_micro || data.diet_today) && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>
            🥗 Nutrition — from your nutritionist
          </p>
          {/* El ajuste de HOY manda sobre la base de la semana, y se dice
              cuál es cuál: si no, el atleta lee dos textos sueltos y no sabe
              si el de arriba reemplaza al de abajo o se suman. */}
          {data.diet_today && (
            <div className="mt-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,209,102,.12)' }}>
              <p className="text-[9px] uppercase tracking-wide font-bold" style={{ ...MONO, color: GOLD }}>
                Just for today
              </p>
              <p className="text-[12px] mt-0.5 whitespace-pre-line" style={{ color: '#f4ecd7' }}>{data.diet_today}</p>
            </div>
          )}
          {data.diet_micro && (
            <>
              {data.diet_today && (
                <p className="text-[9px] uppercase tracking-wide font-bold mt-2.5" style={{ ...MONO, color: '#8aa0b2' }}>
                  Your week — still applies
                </p>
              )}
              <p className="text-[12px] mt-1 whitespace-pre-line" style={{ color: '#dce8f0' }}>{data.diet_micro}</p>
            </>
          )}
        </div>
      )}

      {/* 📌 Sesiones online / tareas del staff */}
      {data.tasks.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(57,217,138,.06)', border: '1px solid rgba(57,217,138,.35)' }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GREEN }}>
            📌 From your team · {data.tasks.length}
          </p>
          <div className="mt-2 space-y-2">
            {data.tasks.map((t) => (
              <div key={t.id} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,.05)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: '#eaf4fa' }}>
                      {KIND_ICON[t.kind] ?? '📌'} {t.title}
                    </p>
                    {t.body && <p className="text-[11.5px] mt-0.5 whitespace-pre-line" style={{ color: '#b8cad8' }}>{t.body}</p>}
                    {t.due_date && <p className="text-[10px] mt-1" style={{ ...MONO, color: '#8aa0b2' }}>Due {t.due_date.slice(5)}</p>}
                  </div>
                  <button type="button" disabled={busy === t.id} onClick={() => done(t.id)}
                    className="shrink-0 rounded-full px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-wider disabled:opacity-50"
                    style={{ ...MONO, background: GREEN, color: INK }}>
                    Done ✓
                  </button>
                </div>
                {t.video_url && (
                  playing === t.id && toEmbedUrl(t.video_url) ? (
                    <div className="mt-2 rounded-lg overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
                      <iframe src={`${toEmbedUrl(t.video_url)}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={t.title} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => (toEmbedUrl(t.video_url!) ? setPlaying(t.id) : window.open(t.video_url!, '_blank', 'noopener'))}
                      className="mt-2 text-[11px] font-semibold"
                      style={{ color: '#00D2FF' }}
                    >
                      ▶ Watch video
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
