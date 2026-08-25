'use client';

import { useEffect, useState } from 'react';
import { getMyAthleteScores, type MyAthleteScores } from '@/lib/actions/programs';

// ─── Score por pilar en el portal del ATLETA (línea Alto Rendimiento) ───
// El mismo "Score por pilar" que el atleta veía en su perfil del app HP
// viejo: Físico/Técnico/Táctico/Mental + global + capacidad de score.
// Autocontenido: null si el alumno no tiene evaluaciones (los ~2.700 alumnos
// no-HP ven el Home idéntico). Copy en inglés como todo el portal.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

const PILLARS: Array<{ key: keyof MyAthleteScores['pillars']; label: string; color: string }> = [
  { key: 'fis', label: 'Physical', color: '#39D98A' },
  { key: 'tec', label: 'Technical', color: '#00D2FF' },
  { key: 'tac', label: 'Tactical', color: '#9B7BFF' },
  { key: 'men', label: 'Mental', color: '#FFA94D' },
];

export function AthleteScoreCard({ token, initial }: { token: string; initial?: MyAthleteScores | null }) {
  const [data, setData] = useState<MyAthleteScores | null>(initial ?? null);

  useEffect(() => {
    if (initial !== undefined) return; // vino del bundle server-side
    getMyAthleteScores(token)
      .then((r) => { if (r.ok) setData(r.data); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!data) return null;
  // NUNCA una tarjeta vacía. Un atleta HP recién otorgado todavía no tiene
  // evaluación: mostrarle un "My Athlete Score" con guiones no le enseña que
  // le falta la evaluación, le enseña que la app no funciona. La tarjeta
  // APARECE el día que su coach lo evalúa por primera vez — así su aparición
  // es un premio y no un hueco. (Hoy 9 de los 21 atletas están en ese caso.)
  // Hace falta un SCORE de verdad. La "scoring capacity" suelta no alcanza:
  // una tarjeta titulada "My Athlete Score" que no muestra ningún score no
  // cumple lo que promete (caso Julissa y Jax: capacidad cargada, cero
  // evaluaciones). Aparece el día que el coach evalúa.
  const hasPillar = PILLARS.some((p) => data.pillars?.[p.key] != null);
  if (!hasPillar && data.global == null) return null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(0,210,255,.05)', border: '1px solid rgba(0,210,255,.25)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#00D2FF' }}>
          My Athlete Score
        </span>
        {data.eval_date && (
          <span className="text-[9px] uppercase tracking-wider" style={{ ...MONO, color: '#6f8698' }}>
            Last evaluation · {data.eval_date}
          </span>
        )}
      </div>

      {data.eval_date && (
      <div className="mt-3 space-y-2.5">
        {PILLARS.map((p) => {
          const v = data.pillars[p.key];
          return (
            <div key={p.key}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold" style={{ color: '#dce8f0' }}>{p.label}</span>
                <span className="text-[12px] font-bold" style={{ ...MONO, color: p.color }}>
                  {v != null ? `${v.toFixed(1)}/5` : '—'}
                </span>
              </div>
              <div className="mt-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${v != null ? (v / 5) * 100 : 0}%`, background: p.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      )}

      {data.eval_date && (
      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <span className="text-[11px]" style={{ color: '#8aa0b2' }}>Overall score</span>
        <span className="text-[19px] font-bold" style={{ ...MONO, color: '#00D2FF' }}>
          {data.global != null ? `${data.global.toFixed(1)}/5` : '—'}
        </span>
      </div>
      )}
      {data.score_capacity != null && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: '#8aa0b2' }}>Scoring capacity</span>
          <span className="text-[12px] font-bold" style={{ ...MONO, color: '#FFD166' }}>{data.score_capacity}/10</span>
        </div>
      )}
    </div>
  );
}
