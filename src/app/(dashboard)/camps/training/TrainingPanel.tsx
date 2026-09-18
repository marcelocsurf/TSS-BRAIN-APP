'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTrainingScenarios, deleteTrainingScenarios } from '@/lib/actions/training';

type Coach = { id: string; display_name: string; max_belt_permission: string | null };
type Scenario = { id: string; camp_name: string; start_date: string; end_date: string; status: string; coach: string | null; students: number; closed_days: number; total_days: number };

const DEFAULT_PICK = /bauti|rachel|raychael|sacha|stanley|santos|melvin/i;

export function TrainingPanel({ coaches, scenarios, defaultDate }: { coaches: Coach[]; scenarios: Scenario[]; defaultDate: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [picked, setPicked] = useState<Set<string>>(() => new Set(coaches.filter((c) => DEFAULT_PICK.test(c.display_name)).map((c) => c.id)));
  const [date, setDate] = useState(defaultDate);
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const create = () => {
    if (!picked.size) { setMsg('Elegí al menos un coach.'); return; }
    if (!confirm(`Crear 3 servicios de prueba para ${picked.size} coach${picked.size === 1 ? '' : 'es'} a partir del ${date}?`)) return;
    start(async () => {
      const r = await createTrainingScenarios({ coachIds: Array.from(picked), startDate: date });
      setMsg(r.ok ? `✓ ${r.created} servicios de prueba creados.` : `Error: ${r.error}`);
      router.refresh();
    });
  };
  const wipe = () => {
    if (!scenarios.length) return;
    if (!confirm(`Borrar los ${scenarios.length} servicios de prueba con todo lo que generaron (planes, cierres, evaluaciones, alumnos de prueba)? No se puede deshacer.`)) return;
    start(async () => {
      const r = await deleteTrainingScenarios();
      setMsg(r.ok ? `✓ ${r.deleted} servicios de prueba borrados.` : `Error: ${r.error}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] p-4 space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E]">1 · Coaches que van a practicar</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {coaches.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-[#10263B] bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={picked.has(c.id)} onChange={() => toggle(c.id)} className="accent-[#00A8CC]" />
              <span className="truncate">{c.display_name}</span>
              {c.max_belt_permission && <span className="ml-auto text-[10px] text-[#55666E] capitalize">{c.max_belt_permission.replace('_belt', '')}</span>}
            </label>
          ))}
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] pt-1">2 · Día de inicio</p>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-[#F7F9FA]" />
        <p className="text-[12px] text-[#55666E]">El camp va 6 días desde esa fecha (08:00). La clase de surf (14:00) y la de skate (16:00) caen el mismo primer día. Cada coach recibe 3 alumnos de prueba.</p>
        <button type="button" disabled={pending} onClick={create} className="w-full sm:w-auto px-5 py-2.5 rounded-[5px] text-sm font-bold text-[#061C2B] disabled:opacity-50" style={{ background: '#00D2FF' }}>
          {pending ? 'Creando…' : `Crear escenarios de prueba · ${picked.size} coach${picked.size === 1 ? '' : 'es'}`}
        </button>
        {msg && <p className="text-[12px] text-[#10263B]">{msg}</p>}
      </div>

      <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E]">Servicios de prueba activos · {scenarios.length}</p>
          {scenarios.length > 0 && (
            <button type="button" disabled={pending} onClick={wipe} className="text-[12px] font-semibold px-3 py-1.5 rounded-[5px] border border-red-300 text-red-700 bg-white disabled:opacity-50">
              Borrar pruebas
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
