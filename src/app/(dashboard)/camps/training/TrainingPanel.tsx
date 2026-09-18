'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTrainingScenarios, deleteTrainingScenarios, type ScenarioKey } from '@/lib/actions/training';

type Coach = { id: string; display_name: string; max_belt_permission: string | null };
type Scenario = { id: string; camp_name: string; start_date: string; end_date: string; status: string; coach: string | null; students: number; closed_days: number; total_days: number };

const OPTIONS: { key: ScenarioKey; label: string }[] = [
  { key: 'camp_wb', label: 'Camp Beginner' },
  { key: 'camp_yb', label: 'Camp Novice' },
  { key: 'camp_bb', label: 'Camp Foundation' },
  { key: 'lesson', label: 'Clase de surf' },
  { key: 'skate', label: 'Clase de skate' },
];

// Reparto que pidió Marcelo (2026-09-18): se puede cambiar antes de crear.
const DEFAULTS: Array<[RegExp, ScenarioKey]> = [
  [/sacha/i, 'camp_wb'],
  [/rachel|raychael/i, 'camp_yb'],
  [/melvin/i, 'camp_bb'],
  [/fiallos/i, 'camp_yb'],
  [/stanley/i, 'lesson'],
];

export function TrainingPanel({ coaches, scenarios, defaultDate }: { coaches: Coach[]; scenarios: Scenario[]; defaultDate: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pick, setPick] = useState<Record<string, Set<ScenarioKey>>>(() => {
    const m: Record<string, Set<ScenarioKey>> = {};
    for (const c of coaches) {
      const hit = DEFAULTS.find(([re]) => re.test(c.display_name));
      m[c.id] = new Set(hit ? [hit[1]] : []);
    }
    return m;
  });
  const [date, setDate] = useState(defaultDate);
  const [msg, setMsg] = useState<string | null>(null);
  // Confirmación en la página (un diálogo nativo traba al navegador automatizado).
  const [armed, setArmed] = useState<'create' | 'wipe' | null>(null);

  const toggle = (id: string, key: ScenarioKey) => setPick((p) => { const n = { ...p }; const s = new Set(n[id] ?? []); if (s.has(key)) s.delete(key); else s.add(key); n[id] = s; return n; });
  const items = coaches.map((c) => ({ coachId: c.id, scenarios: Array.from(pick[c.id] ?? []) })).filter((i) => i.scenarios.length);
  const total = items.reduce((n, i) => n + i.scenarios.length, 0);

  const create = () => {
    if (!total) { setMsg('Marcá al menos un escenario.'); return; }
    if (armed !== 'create') { setArmed('create'); setMsg(`Se van a crear ${total} servicio${total === 1 ? '' : 's'} de prueba para ${items.length} coach${items.length === 1 ? '' : 'es'} a partir del ${date}. Tocá de nuevo para confirmar.`); return; }
    setArmed(null);
    start(async () => {
      const r = await createTrainingScenarios({ items, startDate: date });
      setMsg(r.ok ? `✓ ${r.created} servicios de prueba creados.` : `Error: ${r.error}`);
      router.refresh();
    });
  };
  const wipe = () => {
    if (!scenarios.length) return;
    if (armed !== 'wipe') { setArmed('wipe'); setMsg(`Se van a borrar los ${scenarios.length} servicios de prueba con todo lo que generaron (planes, cierres, evaluaciones, alumnos de prueba). No se puede deshacer. Tocá de nuevo para confirmar.`); return; }
    setArmed(null);
    start(async () => {
      const r = await deleteTrainingScenarios();
      setMsg(r.ok ? `✓ ${r.deleted} servicios de prueba borrados.` : `Error: ${r.error}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] p-4 space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E]">1 · Qué practica cada coach</p>
        <div className="space-y-1.5">
          {coaches.map((c) => (
            <div key={c.id} className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#10263B] truncate">{c.display_name}</span>
                {c.max_belt_permission && <span className="ml-auto text-[10px] text-[#55666E] capitalize">{c.max_belt_permission.replace('_belt', '')}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {OPTIONS.map((o) => {
                  const on = pick[c.id]?.has(o.key);
                  return (
                    <button key={o.key} type="button" aria-pressed={on} onClick={() => toggle(c.id, o.key)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                      style={on ? { background: '#061C2B', borderColor: '#061C2B', color: '#F7F9FA' } : { background: '#fff', borderColor: '#DCD7C6', color: '#55666E' }}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] pt-1">2 · Día de inicio</p>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-[#F7F9FA]" />
        <p className="text-[12px] text-[#55666E]">Los camps van 6 días desde esa fecha (08:00). La clase de surf (14:00) y la de skate (16:00) caen ese mismo día. Cada coach recibe 3 alumnos de prueba.</p>
        <button type="button" disabled={pending} onClick={create} className="w-full sm:w-auto px-5 py-2.5 rounded-[5px] text-sm font-bold text-[#061C2B] disabled:opacity-50" style={{ background: '#00D2FF' }}>
          {pending ? 'Creando…' : armed === 'create' ? `Confirmar · crear ${total}` : `Crear escenarios de prueba · ${total}`}
        </button>
        {msg && <p className="text-[12px] text-[#10263B]">{msg}</p>}
      </div>

      <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E]">Servicios de prueba activos · {scenarios.length}</p>
          {scenarios.length > 0 && (
            <button type="button" disabled={pending} onClick={wipe} className="text-[12px] font-semibold px-3 py-1.5 rounded-[5px] border border-red-300 text-red-700 bg-white disabled:opacity-50">
              {armed === 'wipe' ? 'Confirmar · borrar todo' : 'Borrar pruebas'}
            </button>
          )}
        </div>
        {scenarios.length === 0 ? (
          <p className="text-[12px] text-[#55666E]">Todavía no hay servicios de prueba.</p>
        ) : (
          <div className="divide-y divide-[#DCD7C6] bg-[#F7F9FA] rounded-[5px] border border-[#DCD7C6]">
            {scenarios.map((s) => (
              <Link key={s.id} href={`/camps/${s.id}`} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-white">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#10263B] truncate">{s.camp_name}</span>
                  <span className="block text-[11px] text-[#55666E]">{s.coach ?? '—'} · {s.start_date}{s.end_date !== s.start_date ? ` → ${s.end_date}` : ''} · {s.students} alumnos</span>
                </span>
                <span className="shrink-0 text-[11px] font-mono uppercase tracking-wider" style={{ color: s.status === 'completed' ? '#2FA36B' : '#55666E' }}>
                  {s.status === 'completed' ? 'finalizado' : `${s.closed_days}/${s.total_days} días`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
