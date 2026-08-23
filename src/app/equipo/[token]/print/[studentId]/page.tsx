import { notFound } from 'next/navigation';
import { getSpecialistAthlete } from '@/lib/actions/specialist';
import { PrintButton } from './PrintButton';

// ═══ F4: PLAN IMPRIMIBLE + RUTA CRÍTICA ═══
// Página clara (para papel) con el timeline completo del atleta y la ruta
// crítica: competencias, evaluaciones y semanas pico en orden. Mismo gate
// que el portal del especialista (vínculo de temporada).

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Props {
  params: Promise<{ token: string; studentId: string }>;
}

export default async function PrintPlanPage({ params }: Props) {
  const { token, studentId } = await params;
  const r = await getSpecialistAthlete(token, studentId);
  if (!r.ok || !r.data) notFound();
  const d = r.data;
  const tl = d.timeline;

  // Ruta crítica: hitos por fecha — inicios de FASE del plan anual,
  // competencias, citas de evaluación y semanas pico.
  const critical: Array<{ date: string; label: string }> = [];
  if (tl) {
    for (const f of tl.phases) {
      critical.push({ date: f.start, label: `🚩 Fase: ${f.name}${f.objective ? ` — ${f.objective}` : ''}` });
    }
    for (const w of tl.weeks) {
      // Solo 'Peak' es semana pico ('High' es carga alta RUTINARIA — con
      // 'high' la ruta crítica se inundaba de semanas normales; revisión).
      const inten = (w.intensity ?? '').toLowerCase();
      const peak = inten.includes('peak') || inten.includes('pico') || (w.type ?? '').toLowerCase().includes('compet');
      if (peak) critical.push({ date: w.start, label: `⛰ Semana pico — M${w.week}${w.type ? ` · ${w.type}` : ''}${w.intensity ? ` · ${w.intensity}` : ''}` });
      for (const e of w.events) critical.push({ date: e.date, label: `${e.icon} ${e.label}` });
    }
    for (const e of tl.ahead) critical.push({ date: e.date, label: `${e.icon} ${e.label}` });
  }
  critical.sort((a, b) => a.date.localeCompare(b.date));

  // Franja del año para papel: % dentro de la temporada.
  const season = tl?.season ?? null;
  const spanMs = season ? Math.max(1, Date.parse(`${season.end}T23:59:59Z`) - Date.parse(`${season.start}T00:00:00Z`)) : 1;
  const pctIn = (d: string) => season
    ? Math.max(0, Math.min(100, ((Date.parse(`${d}T12:00:00Z`) - Date.parse(`${season.start}T00:00:00Z`)) / spanMs) * 100))
    : 0;
  const PHASE_INK: Record<string, string> = {
    general: '#00A8CC', especifica: '#0090B8', precompetitiva: '#D97706',
    competitiva: '#B8862B', transicion: '#94A3B8', recuperacion: '#16A34A',
  };

  return (
    <div className="min-h-screen bg-white text-[#061C2B] px-8 py-8 print:px-0 print:py-0">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 pb-4" style={{ borderColor: '#061C2B' }}>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0090B0]">The Surf Sequence® · Training Plan</p>
            <h1 className="text-2xl font-extrabold mt-1">{d.student.name}{d.student.nickname ? ` · "${d.student.nickname}"` : ''}</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {d.season.title}{d.season.objective ? ` — ${d.season.objective}` : ''}
            </p>
            {tl && <p className="text-xs text-gray-500 mt-0.5">Programa: {tl.program_title}</p>}
          </div>
          <PrintButton />
        </div>

        {/* Plan anual: franja de fases del año */}
        {tl && season && tl.phases.length > 0 && (
          <div className="mt-5">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0090B0] border-b border-gray-300 pb-1">
              Plan anual · {season.start} → {season.end}
            </h2>
            <div className="relative h-9 rounded mt-2 overflow-hidden" style={{ background: '#F1F5F9' }}>
              {tl.phases.map((f) => {
                const l = pctIn(f.start), r = pctIn(f.end);
                const c = PHASE_INK[f.color_key] ?? '#00A8CC';
                return (
                  <div key={f.id} className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden"
                    style={{ left: `${l}%`, width: `${Math.max(r - l, 2)}%`, background: `${c}26`, borderLeft: `2px solid ${c}` }}>
                    <span className="text-[8px] font-mono font-bold uppercase truncate px-1" style={{ color: c }}>{f.name}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {tl.phases.map((f) => `${f.name}: ${f.start.slice(5)}→${f.end.slice(5)}`).join(' · ')}
            </p>
          </div>
        )}

        {/* Timeline */}
        {tl ? (
          <table className="w-full text-[12px] mt-5 border-collapse">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray-500 border-b border-gray-300">
                <th className="py-1.5 pr-2">Micro</th>
                <th className="py-1.5 pr-2">Fechas</th>
                <th className="py-1.5 pr-2">Bloque · Intensidad</th>
                <th className="py-1.5 pr-2">Objetivo</th>
                <th className="py-1.5 pr-2 text-right">Días</th>
                <th className="py-1.5">Eventos</th>
              </tr>
            </thead>
            <tbody>
              {tl.weeks.map((w) => (
                <tr key={w.week} className="border-b border-gray-200 align-top" style={w.current ? { background: '#FFF7E0' } : undefined}>
                  <td className="py-2 pr-2 font-bold whitespace-nowrap">M{w.week}{w.current ? ' ←' : ''}</td>
                  <td className="py-2 pr-2 whitespace-nowrap text-gray-600">{w.start.slice(5)} → {w.end.slice(5)}</td>
                  <td className="py-2 pr-2">{[w.label, w.type, w.intensity].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="py-2 pr-2 text-gray-600">{w.objective ?? '—'}</td>
                  <td className="py-2 pr-2 text-right font-mono">{w.days_done}/{w.days_total}</td>
                  <td className="py-2">{w.events.map((e) => `${e.icon} ${e.label}`).join(' · ') || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500 mt-5">Sin programa activo.</p>
        )}

        {/* Ruta crítica */}
        {critical.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0090B0] border-b border-gray-300 pb-1">Ruta crítica</h2>
            <div className="mt-2 space-y-1">
              {critical.map((c, i) => (
                <p key={i} className="text-[12px]">
                  <span className="font-mono text-gray-500">{c.date}</span> — {c.label}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Score */}
        {d.pillars && (
          <div className="mt-6">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0090B0] border-b border-gray-300 pb-1">Score por pilar · últ. evaluación {d.pillars.eval_date}</h2>
            <p className="text-[13px] mt-2">
              Físico <b>{d.pillars.fis ?? '—'}</b> · Técnico <b>{d.pillars.tec ?? '—'}</b> · Táctico <b>{d.pillars.tac ?? '—'}</b> · Mental <b>{d.pillars.men ?? '—'}</b>
              {d.pillars.global != null && <> · Global <b>{d.pillars.global}/5</b></>}
            </p>
          </div>
        )}

        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-gray-400 mt-8 text-center">
          The Surf Sequence® · Evolve through play
        </p>
      </div>
    </div>
  );
}
