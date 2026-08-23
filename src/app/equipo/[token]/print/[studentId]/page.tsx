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

  // Ruta crítica: hitos por fecha — competencias, citas de evaluación y
  // semanas pico (intensidad alta o tipo competencia).
  const critical: Array<{ date: string; label: string }> = [];
  if (tl) {
    for (const w of tl.weeks) {
      const peak = (w.intensity ?? '').toLowerCase().includes('alta') || (w.type ?? '').toLowerCase().includes('compet');
      if (peak) critical.push({ date: w.start, label: `⛰ Semana pico — M${w.week}${w.type ? ` · ${w.type}` : ''}${w.intensity ? ` · ${w.intensity}` : ''}` });
      for (const e of w.events) critical.push({ date: e.date, label: `${e.icon} ${e.label}` });
    }
    for (const e of tl.ahead) critical.push({ date: e.date, label: `${e.icon} ${e.label}` });
  }
  critical.sort((a, b) => a.date.localeCompare(b.date));

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
