import { getManagerPortalData } from '@/lib/actions/manager-portal';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { Lock, Users, GraduationCap, Flag, AlertTriangle, CalendarDays, Package, ClipboardList } from 'lucide-react';
import { SalesPanel } from './SalesPanel';

// MANAGER PORTAL (M144) — read-only executive view of ONE academy.
// Token-gated like the coach/student portals; Brand v10 look.

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const F_DISPLAY = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.08 } as const;
const F_LABEL = { fontFamily: 'var(--font-plex), monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' } as const;

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default async function ManagerPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getManagerPortalData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm">
          <Lock size={36} strokeWidth={1.75} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-lg font-bold text-[#061C2B]">Access not enabled</h1>
          <p className="text-sm text-gray-500 mt-2">This manager link is not active. Contact your academy administrator.</p>
        </div>
      </div>
    );
  }

  const k = data.kpis;
  const kpis = [
    { label: 'Active students', value: k.students, Icon: Users },
    { label: 'Team members', value: k.coaches, Icon: GraduationCap },
    { label: 'Closes · 7d', value: k.closes7d, Icon: Flag },
    { label: 'Incidents · 30d', value: k.incidents30d, Icon: AlertTriangle },
  ];

  return (
    <div className={`min-h-screen pb-16 ${archivo.variable} ${plexMono.variable}`} style={{ background: '#F7F9FA' }}>
      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 pt-4 lg:pt-8 space-y-4">

        {/* ── Ink hero ── */}
        <div className="rounded-3xl overflow-hidden" style={{ background: '#061C2B' }}>
          <div className="px-5 py-5">
            <p className="text-[9px]" style={{ ...F_LABEL, color: '#00D2FF' }}>The Surf Sequence · Manager portal</p>
            <h1 className="text-[22px] mt-2" style={{ ...F_DISPLAY, color: '#F7F9FA' }}>{data.academy.name || 'Academy'}</h1>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(247,249,250,.55)' }}>
              {data.manager.display_name} · read-only overview
            </p>
          </div>
        </div>

        {/* ── KPI tiles ── */}
        <div className="grid grid-cols-4 gap-2">
          {kpis.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm px-2 py-3 text-center">
              <p className="text-xl leading-none" style={{ ...F_DISPLAY, color: '#061C2B' }}>{s.value}</p>
              <p className="text-[7px] mt-1.5 leading-tight text-gray-400" style={{ ...F_LABEL, letterSpacing: '0.1em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Sales / occupancy with period tabs ── */}
        <SalesPanel periods={data.periods} targetCents={data.monthlyTargetCents} />

        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
        <div className="space-y-4">
        {/* ── Programmed calendar (next 14 days) ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-[9px] mb-2.5 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
            <CalendarDays size={12} /> Programmed · next 14 days
          </p>
          {data.upcoming.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing scheduled in the next two weeks.</p>
          ) : (
            <div className="space-y-1.5">
              {data.upcoming.map((s) => {
                const full = s.enrolled >= s.capacity;
                return (
                  <div key={s.id} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: '#061C2B' }}>{s.camp_name}</p>
                      <p className="text-[10px] text-gray-500">
                        {fmtDate(s.start_date)}{s.end_date && s.end_date !== s.start_date ? ` – ${fmtDate(s.end_date)}` : ''}
                        {s.scheduled_time ? ` · ${s.scheduled_time}` : ''}
                        {s.coach_name ? ` · ${s.coach_name}` : ''}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={full ? { background: 'rgba(6,214,160,.15)', color: '#047857' } : { background: 'rgba(0,210,255,.12)', color: '#0090B0' }}
                    >
                      {s.enrolled}/{s.capacity}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Incidents (30d) ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4" style={{ borderTop: '3px solid #FF6B6B' }}>
          <p className="text-[9px] mb-2.5 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#FF6B6B' }}>
            <AlertTriangle size={12} /> Incidents · last 30 days
          </p>
          {data.incidents.length === 0 ? (
            <p className="text-sm text-gray-400">No incidents reported. 🙌</p>
          ) : (
            <div className="space-y-1.5">
              {data.incidents.map((i) => (
                <div key={i.id} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold capitalize" style={{ color: '#061C2B' }}>
                      {i.incident_type.replace(/_/g, ' ')}{i.student_name ? ` · ${i.student_name}` : ''}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug mt-0.5">{i.description}</p>
                  {i.coach_name && <p className="text-[10px] text-gray-400 mt-0.5">Reported by {i.coach_name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        </div>
        <div className="space-y-4">
        {/* ── Inventory alerts ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-[9px] mb-2.5 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
            <Package size={12} /> Inventory · below minimum
          </p>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">All stock above minimums.</p>
          ) : (
            <div className="space-y-1">
              {data.lowStock.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-gray-50 last:border-0">
                  <p className="text-[12px] min-w-0 truncate" style={{ color: '#061C2B' }}>
                    {i.name}{i.unit ? <span className="text-gray-400"> · {i.unit}</span> : ''}
                  </p>
                  <p className="text-[11px] shrink-0 font-bold" style={{ color: '#FF6B6B' }}>
                    {i.qty_in_stock} <span className="text-gray-400 font-normal">/ min {i.minimum}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Purchase requisitions ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-[9px] mb-2.5 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
            <ClipboardList size={12} /> Purchase requisitions
          </p>
          {data.requisitions.length === 0 ? (
            <p className="text-sm text-gray-400">No open requisitions.</p>
          ) : (
            <div className="space-y-1.5">
              {data.requisitions.map((r) => (
                <div key={r.id} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold" style={{ color: '#061C2B' }}>
                      {r.itemCount} item{r.itemCount === 1 ? '' : 's'} · {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {r.created_by_name && <p className="text-[10px] text-gray-400">{r.created_by_name}</p>}
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold uppercase rounded-full px-2 py-0.5 ${r.status === 'ordered' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`} style={{ ...F_LABEL, letterSpacing: '0.1em' }}>
                    {r.status === 'ordered' ? 'Ordered' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        </div>
        </div>

        <p className="text-center text-[9px] text-gray-400 pt-2" style={{ ...F_LABEL }}>
          The Surf Sequence · read-only manager view
        </p>
      </div>
    </div>
  );
}
