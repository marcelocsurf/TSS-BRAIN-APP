'use client';

import { useState } from 'react';
import type { HoldingSeat, HoldingTarget } from '@/lib/actions/holding';

// ═══ POR ASIGNAR · nivel por confirmar ═══
// Misma tarjeta en el Home del coordinador y en Clientes de Kat. Una persona
// mira nivel + ficha y confirma: "sí, va Novice" → elige el camp real.
export function HoldingAssignPanel({ seats, targets, assign, onAssigned, lang = 'en' }: {
  seats: HoldingSeat[];
  targets: HoldingTarget[];
  assign: (participantId: string, targetCampId: string) => Promise<{ ok: boolean; error?: string }>;
  onAssigned?: () => void;
  lang?: 'en' | 'es';
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [gone, setGone] = useState<Set<string>>(new Set());
  const t = lang === 'es'
    ? { title: 'Por asignar · nivel por confirmar', sub: 'Quieren camp. Cuando llenan su intake, sale su nivel: confirmá y movelos al camp real.', waiting: 'todavía no llenó el intake', assign: 'Asignar a…', go: 'Mover', pick: 'Elegí el camp', none: 'No hay camps futuros con lugar. Creá uno en Services.', quiz: 'Quiz', intake: 'Ficha', waiver: 'Waiver', paid: 'Pagado', unpaid: 'Sin pagar', goal: 'Meta', ok: '✓ Movido a' }
    : { title: 'To assign · level to confirm', sub: 'They want a camp. Once the intake is in, their level shows: confirm and move them to the real camp.', waiting: 'intake not filled yet', assign: 'Assign to…', go: 'Move', pick: 'Pick the camp', none: 'No upcoming camps with room. Create one in Services.', quiz: 'Quiz', intake: 'Profile', waiver: 'Waiver', paid: 'Paid', unpaid: 'Unpaid', goal: 'Goal', ok: '✓ Moved to' };
  const rows = seats.filter((s) => !gone.has(s.participant_id));
  if (rows.length === 0) return null;
  const Chip = ({ ok, label }: { ok: boolean; label: string }) => (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{ok ? '✓' : '✗'} {label}</span>
  );
  return (
    <div className="rounded-2xl border-2 mb-4 overflow-hidden" style={{ borderColor: '#FFD166', background: '#fff' }}>
      <div className="px-4 py-3" style={{ background: 'rgba(255,209,102,.18)' }}>
        <p className="text-[13px] font-extrabold uppercase tracking-wide" style={{ color: '#061C2B' }}>🟡 {t.title} · {rows.length}</p>
        <p className="text-[12px] text-gray-600">{t.sub}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((s) => {
          const ready = s.quiz && s.intake;
          const chosen = pick[s.participant_id] ?? '';
          const suggested = targets.filter((x) => !s.level_name || !x.level || x.level.toLowerCase().includes(s.level_name.toLowerCase()) || x.name.toLowerCase().includes(s.level_name.toLowerCase()));
          const list = suggested.length ? suggested : targets;
          return (
            <div key={s.participant_id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold" style={{ color: '#061C2B' }}>{s.name}
                    {s.level_name && <span className="ml-2 text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,210,255,.16)', color: '#0090B0' }}>{s.level_name}{s.score != null ? ` · ${s.score}/100` : ''}</span>}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <Chip ok={s.quiz} label={t.quiz} /><Chip ok={s.intake} label={t.intake} /><Chip ok={s.waiver} label={t.waiver} />
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.paid ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{s.paid ? t.paid : t.unpaid}</span>
                  </div>
                  {s.goal && <p className="text-[12px] text-gray-600 mt-1">{t.goal}: {s.goal}</p>}
                  {!ready && <p className="text-[12px] text-amber-700 mt-1">⏳ {t.waiting}</p>}
                </div>
                <button type="button" onClick={() => setOpen(open === s.participant_id ? null : s.participant_id)}
                  className="shrink-0 rounded-full px-4 py-2 text-[12px] font-bold"
                  style={{ background: ready ? '#00D2FF' : '#E1E7EB', color: '#061C2B' }}>
                  {t.assign}
                </button>
              </div>
              {open === s.participant_id && (
                <div className="mt-2 flex gap-2 flex-wrap items-center">
                  {targets.length === 0 ? <p className="text-[12px] text-gray-500">{t.none}</p> : (
                    <>
                      <select value={chosen} onChange={(e) => setPick({ ...pick, [s.participant_id]: e.target.value })} className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white">
                        <option value="">{t.pick}</option>
                        {list.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.start} → {x.end}{x.left !== null ? ` · ${x.left} left` : ''}</option>)}
                      </select>
                      <button type="button" disabled={!chosen || busy === s.participant_id}
                        onClick={async () => {
                          setBusy(s.participant_id);
                          const r = await assign(s.participant_id, chosen);
                          setBusy(null);
                          if (!r.ok) { setMsg({ ...msg, [s.participant_id]: r.error ?? 'Error' }); return; }
                          const tg = targets.find((x) => x.id === chosen);
                          setMsg({ ...msg, [s.participant_id]: `${t.ok} ${tg?.name ?? ''}` });
                          setTimeout(() => { setGone(new Set([...gone, s.participant_id])); onAssigned?.(); }, 1200);
                        }}
                        className="rounded-full px-4 py-2 text-[12px] font-bold disabled:opacity-40" style={{ background: '#06D6A0', color: '#061C2B' }}>
                        {busy === s.participant_id ? '…' : t.go}
                      </button>
                    </>
                  )}
                </div>
              )}
              {msg[s.participant_id] && <p className={`text-[12px] mt-1 font-semibold ${msg[s.participant_id].startsWith('✓') ? 'text-emerald-700' : 'text-red-600'}`}>{msg[s.participant_id]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
