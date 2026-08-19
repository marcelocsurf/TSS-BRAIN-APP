'use client';

import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { getMyCompetitions, saveMyHeatPrep, type MyCompetitionData, type MyHeatView } from '@/lib/actions/competitions';

// ─── Ola 2: la competencia del atleta + ranking semanal (Home del portal) ───
// Paridad con la app HP: preparación pre-heat (checklist, lineup, estrategia,
// mantra — la llena el ATLETA), olas puntuadas, passed, y el ranking del grupo.
// Portal del alumno = fondo OSCURO (#061C2B). Student-facing: inglés.
// Autocontenida: null si no hay nada (cero impacto en los 2.727 sin HP).

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const ARCHIVO: React.CSSProperties = { fontFamily: 'Archivo, sans-serif', fontStretch: '125%' };

const GOLD = '#FFD166';
const INK = '#061C2B';

const PREP_CHECKS: { key: string; label: string }[] = [
  { key: 'warmup', label: 'Warm-up done' },
  { key: 'simulation', label: 'Pre-heat simulation' },
  { key: 'breathing', label: 'Breathing routine' },
  { key: 'visualization', label: 'Visualization' },
  { key: 'mantra', label: 'Mantra / key word ready' },
  { key: 'board', label: 'Board checked & ready' },
];

const LINEUPS: { key: string; label: string; tip: string }[] = [
  { key: 'A', label: 'A · Main peak', tip: 'Where the sets break' },
  { key: 'B', label: 'B · Secondary peak', tip: 'Less crowd, steady waves' },
  { key: 'C', label: 'C · Open space', tip: 'Your own zone' },
];

const STRATEGIES: { key: string; label: string; tip: string }[] = [
  { key: 'backup', label: '1. Backup first, then wait', tip: 'Secure a mid wave in the first 5 min. Never sit on zero.' },
  { key: 'build', label: '2. Build the score', tip: 'Two solid mid waves beat waiting for a perfect one.' },
  { key: 'attack', label: '3. Attack the first chance', tip: 'First available wave, full commitment. Pressure your rival.' },
  { key: 'select', label: '4. Only two waves all heat', tip: 'Ultra-selective. Wait for the two best waves.' },
  { key: 'block', label: '5. Block your rival', tip: 'Sit on their peak and force them to move.' },
  { key: 'explode', label: '6. Explosive start + priority', tip: 'Score early, stack points, force impossible numbers.' },
];

function prettyDate(d: string): string {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function CompetitionCard({ token }: { token: string }) {
  const [data, setData] = useState<MyCompetitionData | null>(null);
  const [open, setOpen] = useState(false);

  const load = () => {
    getMyCompetitions(token)
      .then((r) => { if (r.ok && r.data) setData(r.data); })
      .catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [token]);

  if (!data) return null;
  const up = data.upcoming;
  const rk = data.ranking;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl p-4"
        style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ ...MONO, color: GOLD }}>
            <Trophy size={12} /> Competition
          </span>
          {up ? (
            <span className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>
              {up.days_to === 0 ? 'TODAY' : `${up.days_to} day${up.days_to === 1 ? '' : 's'} to go`}
            </span>
          ) : rk?.my_position != null ? (
            <span className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>
              Rank #{rk.my_position}
            </span>
          ) : null}
        </div>
        <p className="font-bold mt-1.5" style={{ ...ARCHIVO, color: '#f4f9fc', fontSize: 17 }}>
          {up ? up.name : 'Weekly ranking'}
        </p>
        <p className="text-[11.5px] mt-1" style={{ color: '#b8cad8' }}>
          {up
            ? `${prettyDate(up.comp_date)}${up.location ? ` · ${up.location}` : ''} — tap to prep your heats`
            : rk?.my_position != null
              ? `You're #${rk.my_position} of ${rk.total} this week · ${rk.my_points} pts`
              : 'See how your week stacks up'}
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{ background: INK, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setOpen(false)} className="text-[11px] uppercase tracking-wider" style={{ ...MONO, color: '#8aa0b2' }}>
                ← Home
              </button>
              <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>Competition</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} color="#8aa0b2" /></button>
            </div>

            {up && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>
                  {up.days_to === 0 ? 'TODAY' : `${up.days_to} DAYS TO GO`}
                </p>
                <p className="font-bold mt-1" style={{ ...ARCHIVO, color: '#f4f9fc', fontSize: 20 }}>{up.name}</p>
                <p className="text-[12px] mt-0.5" style={{ color: '#b8cad8' }}>
                  {prettyDate(up.comp_date)}
                  {up.location ? ` · ${up.location}` : ''}
                  {up.category ? ` · ${up.category}` : ''}
                </p>
              </div>
            )}

            {up?.heats.map((h) => (
              <HeatBlock key={h.id} token={token} heat={h} onSaved={load} />
            ))}
            {up && up.heats.length === 0 && (
              <p className="text-[12px] text-center py-3" style={{ color: '#8aa0b2' }}>
                Your heats will appear here once they&apos;re scheduled.
              </p>
            )}

            {data.last_result && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>Last result</p>
                <p className="text-[13.5px] font-semibold mt-1" style={{ color: '#f4f9fc' }}>
                  {data.last_result.name}
                  {data.last_result.final_place && <span style={{ color: GOLD }}> — {data.last_result.final_place}</span>}
                </p>
                {data.last_result.final_notes && (
                  <p className="text-[12px] italic mt-1" style={{ color: '#b8cad8' }}>«{data.last_result.final_notes}»</p>
                )}
              </div>
            )}

            {rk && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(0,210,255,.05)', border: '1px solid rgba(0,210,255,.3)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#00D2FF' }}>Weekly ranking</p>
                  {rk.my_position != null && (
                    <p className="text-[11px] font-bold" style={{ ...MONO, color: '#00D2FF' }}>You · #{rk.my_position} · {rk.my_points} pts</p>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {rk.top.map((r) => (
                    <div key={r.position} className="flex items-center justify-between">
                      <p className="text-[12.5px]" style={{ color: r.position <= 3 ? '#f4f9fc' : '#b8cad8', fontWeight: r.position <= 3 ? 700 : 400 }}>
                        {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `${r.position}.`} {r.name}
                      </p>
                      <p className="text-[12px]" style={{ ...MONO, color: '#7BA2B5' }}>{r.points}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-2" style={{ color: '#7BA2B5' }}>
                  Points come from your daily work: marked days, check-ins, sleep, water, nutrition.
                </p>
              </div>
            )}

            <p className="text-center text-[9px] uppercase tracking-wider py-2" style={{ ...MONO, color: '#57707f' }}>
              The Surf Sequence · Competition
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Un heat: preparación (editable) o resultado (cuando ya corrió) ───

function HeatBlock({ token, heat, onSaved }: { token: string; heat: MyHeatView; onSaved: () => void }) {
  const [checks, setChecks] = useState<string[]>(heat.prep.checks ?? []);
  const [lineup, setLineup] = useState<string>(heat.prep.lineup ?? '');
  const [strategy, setStrategy] = useState<string>(heat.prep.strategy ?? '');
  const [mantra, setMantra] = useState<string>(heat.prep.mantra ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toggle = (k: string) =>
    setChecks((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  const save = async () => {
    setErr(null);
    setSaving(true);
    const r = await saveMyHeatPrep(token, heat.id, { checks, lineup: lineup || null, strategy: strategy || null, mantra: mantra || null });
    setSaving(false);
    if (!r.ok) { setErr(r.error || 'Could not save.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  };

  const done = heat.status === 'done';

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold" style={{ color: '#f4f9fc' }}>
          Heat {heat.heat_number}{heat.round_name ? ` · ${heat.round_name}` : ''}
        </p>
        {done && heat.passed != null && (
          <span className="text-[11px] font-bold" style={{ color: heat.passed ? '#06D6A0' : '#FF6B6B' }}>
            {heat.passed ? 'ADVANCED ✓' : 'ELIMINATED'}
          </span>
        )}
      </div>

      {done ? (
        <>
          {heat.waves.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1.5">
                {heat.waves.map((w) => (
                  <span key={w.wave_number} className="px-2 py-1 rounded-lg text-[12px] font-bold"
                    style={{ ...MONO, background: 'rgba(0,210,255,.1)', color: '#00D2FF', border: '1px solid rgba(0,210,255,.3)' }}>
                    {w.score.toFixed(2)}
                  </span>
                ))}
              </div>
              <p className="text-[12px] mt-1.5" style={{ color: '#b8cad8' }}>
                Heat total (best 2): <b style={{ color: GOLD }}>{heat.heat_total.toFixed(2)}</b> · {heat.waves.length} wave{heat.waves.length === 1 ? '' : 's'}
              </p>
            </div>
          )}
          {(heat.what_worked || heat.what_to_improve) && (
            <div className="mt-2 space-y-1">
              {heat.what_worked && <p className="text-[12px]" style={{ color: '#b8cad8' }}>✓ <b style={{ color: '#06D6A0' }}>Worked:</b> {heat.what_worked}</p>}
              {heat.what_to_improve && <p className="text-[12px]" style={{ color: '#b8cad8' }}>→ <b style={{ color: GOLD }}>Improve:</b> {heat.what_to_improve}</p>}
            </div>
          )}
        </>
      ) : (
        <div className="mt-2.5 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>Pre-heat checklist</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {PREP_CHECKS.map((c) => {
                const on = checks.includes(c.key);
                return (
                  <button key={c.key} type="button" onClick={() => toggle(c.key)}
                    className="text-left px-2.5 py-2 rounded-xl text-[11.5px]"
                    style={{
                      background: on ? 'rgba(6,214,160,.12)' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${on ? 'rgba(6,214,160,.45)' : 'rgba(255,255,255,.09)'}`,
                      color: on ? '#7fe8cd' : '#b8cad8',
                    }}>
                    {on ? '✓ ' : ''}{c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>Lineup position</p>
            <div className="mt-1.5 flex gap-1.5">
              {LINEUPS.map((l) => (
                <button key={l.key} type="button" onClick={() => setLineup(lineup === l.key ? '' : l.key)}
                  className="flex-1 px-2 py-2 rounded-xl text-[11px] text-center"
                  style={{
                    background: lineup === l.key ? 'rgba(255,209,102,.12)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${lineup === l.key ? 'rgba(255,209,102,.5)' : 'rgba(255,255,255,.09)'}`,
                    color: lineup === l.key ? GOLD : '#b8cad8',
                  }}
                  title={l.tip}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>Heat strategy</p>
            <div className="mt-1.5 space-y-1.5">
              {STRATEGIES.map((s) => (
                <button key={s.key} type="button" onClick={() => setStrategy(strategy === s.key ? '' : s.key)}
                  className="w-full text-left px-3 py-2 rounded-xl"
                  style={{
                    background: strategy === s.key ? 'rgba(255,209,102,.12)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${strategy === s.key ? 'rgba(255,209,102,.5)' : 'rgba(255,255,255,.09)'}`,
                  }}>
                  <span className="block text-[11.5px] font-bold" style={{ color: strategy === s.key ? GOLD : '#f4f9fc' }}>{s.label}</span>
                  <span className="block text-[10px] mt-0.5" style={{ color: '#8aa0b2' }}>{s.tip}</span>
                </button>
              ))}
            </div>
          </div>

          <input
            value={mantra}
            onChange={(e) => setMantra(e.target.value)}
            placeholder="Your mantra / key word…"
            aria-label="Mantra or key word"
            className="w-full rounded-xl px-3 py-2.5 text-[13px]"
            style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: '#eaf4fa' }}
            maxLength={60}
          />
          {mantra.trim() && (
            <p className="text-center text-[16px] font-black uppercase tracking-[3px]" style={{ color: '#00D2FF' }}>
              “{mantra.trim()}”
            </p>
          )}

          {err && <p className="text-[11px]" style={{ color: '#FF6B6B' }}>{err}</p>}
          <button type="button" disabled={saving} onClick={save}
            className="w-full rounded-full py-3 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
            style={{ ...MONO, background: GOLD, color: '#412402' }}>
            {saving ? 'SAVING…' : saved ? 'SAVED ✓' : 'SAVE MY HEAT PREP'}
          </button>
        </div>
      )}
    </div>
  );
}
