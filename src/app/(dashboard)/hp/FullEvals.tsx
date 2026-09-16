'use client';

// ═══ EVALUACIÓN COMPLETA TSS · físico · técnica · maniobras · longboard ·
// táctica · mental — la misma pantalla del app HP, ahora dentro del cockpit ═══

import { useEffect, useState } from 'react';
import { adminSearchStudents } from '@/lib/actions/program-admin';
import { hpListFullEvaluations, hpCreateFullEvaluation, type HPFullEvalRow, type FullEvalBlocks } from '@/lib/actions/hp-eval-full';
import { EVAL_FULL_ITEMS, EVAL_FULL_BLOCKS, EVAL_FULL_TYPES, EVAL_FULL_DISCIPLINES, type FullEvalBlockKey } from '@/lib/constants/hp-eval-full';
import { elSalvadorToday } from '@/lib/utils/tz';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' };
const CARD = 'rgba(255,255,255,.045)';
const BORDER = 'rgba(255,255,255,.09)';
const CYAN = '#00D2FF';
const GOLD = '#FFD166';
const TXT = '#F0F7FA';
const DIM = '#9DB4C3';
const FAINT = '#6C8494';
const RED = '#FF6B6B';
const card: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14 };
const inp: React.CSSProperties = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: TXT, borderRadius: 10, padding: '8px 10px', fontSize: 13, width: '100%' };

const TYPE_LABEL: Record<string, string> = { inicial: 'Inicial', periodica: 'Periódica', final: 'Final' };
const DISC_LABEL: Record<string, string> = { shortboard: 'Shortboard', longboard: 'Longboard', both: 'Short + Long' };

function itemLabel(block: FullEvalBlockKey, id: string): string {
  for (const sec of EVAL_FULL_ITEMS[block].sections) for (const it of sec.items) if (it.id === id) return it.label;
  return id;
}

export function FullEvals() {
  const [rows, setRows] = useState<HPFullEvalRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = () => hpListFullEvaluations().then((r) => { if (r.ok) setRows(r.evaluations); else setErr(r.error || null); setLoaded(true); }).catch(() => setLoaded(true));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
      {!creating ? (
        <button type="button" onClick={() => setCreating(true)}
          className="w-full rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: GOLD, color: '#412402' }}>
          + Evaluación completa TSS
        </button>
      ) : (
        <FullEvalForm onDone={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />
      )}

      <p className="text-[10.5px]" style={{ color: FAINT }}>
        Físico (13 tests con medida) · Técnica · Maniobras · Longboard · Táctica · Mental — el mismo instrumento del app de Alto Rendimiento. {rows.length} evaluaciones.
      </p>

      <div className="space-y-1.5">
        {rows.map((e) => {
          const open = openId === e.id;
          return (
            <div key={e.id} style={card}>
              <button type="button" onClick={() => setOpenId(open ? null : e.id)} className="w-full text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] font-semibold truncate" style={{ color: TXT }}>{e.student_name}</p>
                  <p className="text-[10px] shrink-0" style={{ ...MONO, color: FAINT }}>{e.eval_date}</p>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: DIM }}>
                  <span className="font-bold uppercase text-[9px] mr-1 px-1.5 py-0.5 rounded" style={{ ...MONO, background: 'rgba(255,209,102,.12)', color: GOLD }}>
                    Completa
                  </span>
                  {e.eval_type ? TYPE_LABEL[e.eval_type] ?? e.eval_type : '—'}
                  {e.discipline ? ` · ${DISC_LABEL[e.discipline] ?? e.discipline}` : ''}
                  {e.belt_assigned ? ` · cinta ${e.belt_assigned}` : ''}
                  {e.coach_name ? ` · ${e.coach_name}` : ''}
                </p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {EVAL_FULL_BLOCKS.map((b) => {
                    const has = !!e.blocks[b.key];
                    if (!has) return null;
                    const avg = e.block_avgs[b.key];
                    return (
                      <span key={b.key} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ ...MONO, border: `1px solid ${b.color}`, color: b.color }}>
                        {b.short}{avg != null ? ` ${avg.toFixed(1)}/5` : ''}
                      </span>
                    );
                  })}
                </div>
              </button>

              {open && (
                <div className="mt-2.5 pt-2.5 space-y-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
                  {(e.location || e.conditions) && (
                    <p className="text-[11px]" style={{ color: DIM }}>{[e.location, e.conditions].filter(Boolean).join(' · ')}</p>
                  )}
                  {EVAL_FULL_BLOCKS.map((b) => {
                    const data = e.blocks[b.key];
                    if (!data) return null;
                    const entries = Object.entries(data).filter(([, v]) => v != null && v !== '');
                    if (!entries.length) return null;
                    return (
                      <div key={b.key}>
                        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: b.color }}>{b.label}</p>
                        <div className="mt-1 space-y-1">
                          {entries.map(([id, v]) => {
                            const n = Number(v);
                            const isScore = b.key !== 'fisico' && typeof v === 'number' && n >= 1 && n <= 5 && Number.isInteger(n);
                            return (
                              <div key={id} className="flex items-center gap-2">
                                <p className="text-[11px] w-44 shrink-0 truncate" style={{ color: DIM }} title={itemLabel(b.key, id)}>{itemLabel(b.key, id)}</p>
                                {isScore ? (
                                  <>
                                    <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                                      <div className="h-full rounded-full" style={{ width: `${(n / 5) * 100}%`, background: b.color }} />
                                    </div>
                                    <p className="text-[10.5px] w-7 text-right" style={{ ...MONO, color: TXT }}>{n}</p>
                                  </>
                                ) : (
                                  <p className="flex-1 text-[11.5px]" style={{ color: TXT }}>{String(v)}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {(e.summary.strengths.length > 0 || e.summary.improvements.length > 0) && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Resumen</p>
                      {e.summary.strengths.length > 0 && <p className="text-[11.5px] mt-1" style={{ color: DIM }}><b style={{ color: TXT }}>Fortalezas:</b> {e.summary.strengths.join(' · ')}</p>}
                      {e.summary.improvements.length > 0 && <p className="text-[11.5px]" style={{ color: DIM }}><b style={{ color: TXT }}>A mejorar:</b> {e.summary.improvements.join(' · ')}</p>}
                    </div>
                  )}
                  {(e.diagnosis.observation || e.diagnosis.recommendation) && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Diagnóstico</p>
                      {e.diagnosis.observation && <p className="text-[11.5px] mt-1" style={{ color: DIM }}><b style={{ color: TXT }}>Observación:</b> {e.diagnosis.observation}</p>}
                      {e.diagnosis.recommendation && <p className="text-[11.5px]" style={{ color: DIM }}><b style={{ color: TXT }}>Recomendación:</b> {e.diagnosis.recommendation}</p>}
                    </div>
                  )}
                  {(e.action_plan.drills || e.action_plan.next_eval_date) && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Plan de acción</p>
                      {e.action_plan.drills && <p className="text-[11.5px] mt-1" style={{ color: DIM }}>{e.action_plan.drills}</p>}
                      {e.action_plan.next_eval_date && <p className="text-[11px]" style={{ ...MONO, color: FAINT }}>Próxima evaluación: {e.action_plan.next_eval_date}</p>}
                    </div>
                  )}
                  {e.coach_narrative && (
                    <p className="text-[11.5px] italic" style={{ color: DIM }}>{e.coach_narrative}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {loaded && rows.length === 0 && <p className="text-[12px] text-center py-3" style={{ color: FAINT }}>Sin evaluaciones completas todavía.</p>}
      </div>
    </div>
  );
}

function FullEvalForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [evalType, setEvalType] = useState<string>('periodica');
  const [discipline, setDiscipline] = useState<string>('shortboard');
  const [evalDate, setEvalDate] = useState(elSalvadorToday());
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState('');
  const [belt, setBelt] = useState('');
  const [blocks, setBlocks] = useState<FullEvalBlocks>({});
  const [strengths, setStrengths] = useState(['', '', '']);
  const [improvements, setImprovements] = useState(['', '', '']);
  const [obs, setObs] = useState('');
  const [rec, setRec] = useState('');
  const [drills, setDrills] = useState('');
  const [nextEval, setNextEval] = useState('');
  const [narrative, setNarrative] = useState('');
  const [openBlock, setOpenBlock] = useState<FullEvalBlockKey | ''>('fisico');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) adminSearchStudents(q).then((r) => { if (r.ok) setResults(r.students.map((s: any) => ({ id: s.id, name: s.name }))); });
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const setItem = (b: FullEvalBlockKey, id: string, v: number | string | null) =>
    setBlocks((prev) => {
      const cur = { ...(prev[b] ?? {}) };
      if (v == null || v === '') delete cur[id]; else cur[id] = v;
      return { ...prev, [b]: cur };
    });

  const blockAvg = (b: FullEvalBlockKey): string | null => {
    if (b === 'fisico') return null;
    const data = blocks[b] ?? {};
    const vals: number[] = [];
    for (const sec of EVAL_FULL_ITEMS[b].sections) {
      if (sec.type === 'text') continue;
      for (const it of sec.items) {
        if (it.type === 'text' || it.type === 'number') continue;
        const v = Number(data[it.id]);
        if (Number.isFinite(v) && v >= 1 && v <= 5) vals.push(v);
      }
    }
    return vals.length ? (vals.reduce((s, x) => s + x, 0) / vals.length).toFixed(1) : null;
  };
  const blockCount = (b: FullEvalBlockKey) => Object.keys(blocks[b] ?? {}).length;

  const save = async () => {
    if (!picked) return;
    setErr(null); setBusy(true);
    const r = await hpCreateFullEvaluation({
      studentId: picked.id, eval_date: evalDate, eval_type: evalType, discipline,
      location, conditions, belt_assigned: belt, blocks,
      summary: { strengths, improvements },
      diagnosis: { observation: obs, recommendation: rec },
      action_plan: { drills, next_eval_date: nextEval },
      coach_narrative: narrative,
    });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    onDone();
  };

  const pill = (active: boolean): React.CSSProperties =>
    active ? { background: CYAN, color: '#06202F' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` };

  return (
    <div style={card} className="space-y-2.5">
      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Evaluación completa TSS</p>

      <div className="relative">
        <input value={picked ? picked.name : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }} placeholder="Atleta… *" aria-label="Atleta" style={inp} />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-[5px] overflow-hidden" style={{ background: '#12283A', border: `1px solid ${BORDER}` }}>
            {results.map((st) => (
              <button key={st.id} type="button" onClick={() => { setPicked(st); setResults([]); }}
                className="w-full text-left px-3 py-2 text-[12.5px]" style={{ color: TXT }}>
                {st.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {EVAL_FULL_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setEvalType(t)} className="px-3 py-1.5 rounded-full text-[10.5px] font-bold" style={pill(evalType === t)}>{TYPE_LABEL[t]}</button>
        ))}
        <span className="w-2" />
        {EVAL_FULL_DISCIPLINES.map((d) => (
          <button key={d} type="button" onClick={() => setDiscipline(d)} className="px-3 py-1.5 rounded-full text-[10.5px] font-bold" style={pill(discipline === d)}>{DISC_LABEL[d]}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="date" value={evalDate} onChange={(e) => setEvalDate(e.target.value)} aria-label="Fecha" style={inp} />
        <input value={belt} onChange={(e) => setBelt(e.target.value)} placeholder="Cinta asignada" aria-label="Cinta asignada" style={inp} />
      </div>
      <div className="flex gap-2">
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lugar" aria-label="Lugar" style={inp} />
        <input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Condiciones" aria-label="Condiciones" style={inp} />
      </div>

      {EVAL_FULL_BLOCKS.map((b) => {
        const open = openBlock === b.key;
        const avg = blockAvg(b.key);
        const n = blockCount(b.key);
        return (
          <div key={b.key} className="rounded-[5px] overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            <button type="button" onClick={() => setOpenBlock(open ? '' : b.key)}
              className="w-full flex items-center justify-between px-3 py-2" style={{ background: 'rgba(255,255,255,.03)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ ...MONO, color: b.color }}>{b.label}</p>
              <p className="text-[10.5px]" style={{ ...MONO, color: n ? b.color : FAINT }}>
                {avg ? `${avg}/5` : n ? `${n} ítems` : open ? '▴' : '▾'}
              </p>
            </button>
            {open && (
              <div className="px-3 py-2 space-y-3">
                {EVAL_FULL_ITEMS[b.key].sections.map((sec) => (
                  <div key={sec.key}>
                    <p className="text-[10px] font-bold" style={{ color: DIM }}>{sec.label}</p>
                    <div className="mt-1 space-y-1.5">
                      {sec.items.map((it) => {
                        const kind: 'text' | 'number' | 'score' = sec.type === 'text' || it.type === 'text' ? 'text' : sec.type === 'number' || it.type === 'number' ? 'number' : 'score';
                        const cur = blocks[b.key]?.[it.id];
                        if (kind === 'text') {
                          return (
                            <input key={it.id} value={cur == null ? '' : String(cur)} onChange={(e) => setItem(b.key, it.id, e.target.value)}
                              placeholder={it.label + (it.hint ? ` — ${it.hint}` : '')} aria-label={it.label} title={it.hint} style={inp} />
                          );
                        }
                        if (kind === 'number') {
                          return (
                            <div key={it.id} className="flex items-center gap-2">
                              <p className="text-[11px] flex-1" style={{ color: DIM }} title={it.hint}>{it.label}</p>
                              <input type="number" step="any" value={cur == null ? '' : String(cur)}
                                onChange={(e) => setItem(b.key, it.id, e.target.value === '' ? null : Number(e.target.value))}
                                aria-label={it.label} style={{ ...inp, width: 90 }} />
                            </div>
                          );
                        }
                        const val = typeof cur === 'number' ? cur : null;
                        return (
                          <div key={it.id} className="flex items-center gap-2">
                            <p className="text-[11px] w-40 shrink-0" style={{ color: DIM }} title={it.hint}>{it.label}</p>
                            <input type="range" min={1} max={5} step={1} value={val ?? 3}
                              onChange={(e) => setItem(b.key, it.id, Number(e.target.value))}
                              className="flex-1" aria-label={`${it.label} 1 a 5`} />
                            <button type="button"
                              onClick={() => setItem(b.key, it.id, val != null ? null : 3)}
                              className="text-[11px] w-9 text-right shrink-0"
                              style={{ ...MONO, color: val != null ? b.color : FAINT }}
                              title={val != null ? 'Quitar puntaje' : 'Puntuar'}>
                              {val != null ? `${val}/5` : '—'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <p className="text-[9.5px]" style={{ color: FAINT }}>Solo se guardan los ítems cargados. Tocá el número para incluir/quitar un puntaje.</p>
              </div>
            )}
          </div>
        );
      })}

      <div className="rounded-[5px] px-3 py-2 space-y-1.5" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,209,102,.05)' }}>
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Resumen · 3 fortalezas · 3 a mejorar</p>
        {strengths.map((s, i) => (
          <input key={`s${i}`} value={s} onChange={(e) => setStrengths((a) => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Fortaleza ${i + 1}`} aria-label={`Fortaleza ${i + 1}`} style={inp} />
        ))}
        {improvements.map((s, i) => (
          <input key={`i${i}`} value={s} onChange={(e) => setImprovements((a) => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`A mejorar ${i + 1}`} aria-label={`A mejorar ${i + 1}`} style={inp} />
        ))}
      </div>

      <div className="rounded-[5px] px-3 py-2 space-y-1.5" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,209,102,.05)' }}>
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Diagnóstico y plan</p>
        <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observación del coach" aria-label="Observación" rows={2} style={inp} />
        <textarea value={rec} onChange={(e) => setRec(e.target.value)} placeholder="Recomendación" aria-label="Recomendación" rows={2} style={inp} />
        <textarea value={drills} onChange={(e) => setDrills(e.target.value)} placeholder="Drills / plan de acción" aria-label="Plan de acción" rows={2} style={inp} />
        <div className="flex items-center gap-2">
          <p className="text-[11px] shrink-0" style={{ color: DIM }}>Próxima evaluación</p>
          <input type="date" value={nextEval} onChange={(e) => setNextEval(e.target.value)} aria-label="Próxima evaluación" style={inp} />
        </div>
        <textarea value={narrative} onChange={(e) => setNarrative(e.target.value)} placeholder="Narrativa del coach (opcional)" aria-label="Narrativa" rows={2} style={inp} />
      </div>

      {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={busy || !picked} onClick={save}
          className="flex-1 rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: GOLD, color: '#412402', opacity: busy || !picked ? 0.5 : 1 }}>
          {busy ? 'Guardando…' : 'Guardar evaluación completa'}
        </button>
        <button type="button" onClick={onCancel} className="px-3 text-[11px]" style={{ color: FAINT }}>Cancelar</button>
      </div>
    </div>
  );
}
