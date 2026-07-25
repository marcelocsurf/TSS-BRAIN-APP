import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

// ADMIN OPS BOARD (M152) — the platform owner's pulse. ONE stats block
// (replaces the old Overview strip + System Stats duplication) plus a
// platform-level Needs-attention card. All counts are live queries.

const F_DISPLAY = { fontFamily: 'var(--font-archivo), var(--font-heading), sans-serif', fontStretch: '125%' as const, fontWeight: 800, textTransform: 'uppercase' as const, lineHeight: 1.05 };
const F_LABEL = { fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.16em' };

export async function AdminOpsBoard({ unreadIncidents, pendingSurveys }: { unreadIncidents: number; pendingSurveys: number }) {
  const admin = createAdminClient();
  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  let stats = { academies: 0, students: 0, coaches: 0, services: 0, closes7d: 0 };
  const attention: { label: string; count: number; href: string; sev: 'red' | 'amber' | 'gray' }[] = [];
  try {
    const [ac, st, co, sv, cl, rq, tl] = await Promise.all([
      admin.from('academies').select('id', { count: 'exact', head: true }).is('archived_at', null),
      admin.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('lifecycle_status', 'member'),
      admin.from('coaches').select('id', { count: 'exact', head: true }).eq('active_status', true),
      admin.from('camp_instances').select('id', { count: 'exact', head: true }).not('status', 'in', '("completed","cancelled")').gte('end_date', today),
      admin.from('student_session_results').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      admin.from('inventory_requisitions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      admin.from('tool_leads').select('id', { count: 'exact', head: true }).gte('last_seen', weekAgo),
    ]);
    stats = { academies: ac.count ?? 0, students: st.count ?? 0, coaches: co.count ?? 0, services: sv.count ?? 0, closes7d: cl.count ?? 0 };
    if (unreadIncidents > 0) attention.push({ label: 'Incidentes sin leer', count: unreadIncidents, href: '/incidents', sev: 'red' });
    if ((rq.count ?? 0) > 0) attention.push({ label: 'Requisiciones abiertas', count: rq.count ?? 0, href: '/dashboard', sev: 'amber' });
    if (pendingSurveys > 0) attention.push({ label: 'Encuestas pendientes', count: pendingSurveys, href: '/dashboard', sev: 'amber' });
    if ((tl.count ?? 0) > 0) attention.push({ label: 'Tool leads · 7d', count: tl.count ?? 0, href: '/admin/tool-leads', sev: 'gray' });
  } catch { /* pre-migration tables tolerated */ }

  const dayName = new Date(today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 md:items-stretch">
      <div className="rounded-3xl p-6 flex flex-col justify-between min-h-56" style={{ background: '#061C2B' }}>
        <div>
          <p className="text-[10px]" style={{ ...F_LABEL, color: '#00D2FF' }}>The Surf Sequence · Platform</p>
          <h2 className="text-[30px] mt-2" style={{ ...F_DISPLAY, color: '#F7F9FA' }}>{dayName}<br />operations</h2>
        </div>
        <div className="grid grid-cols-5 gap-2 mt-6 pt-4" style={{ borderTop: '1px solid rgba(247,249,250,.1)' }}>
          {[
            { v: stats.academies, label: 'academies', color: '#00D2FF' },
            { v: stats.students, label: 'students', color: '#F7F9FA' },
            { v: stats.coaches, label: 'staff', color: '#F7F9FA' },
            { v: stats.services, label: 'services', color: '#06D6A0' },
            { v: stats.closes7d, label: 'closes 7d', color: '#FFD166' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[30px] leading-none" style={{ ...F_DISPLAY, color: s.color }}>{s.v}</p>
              <p className="text-[7px] mt-1.5" style={{ ...F_LABEL, color: 'rgba(247,249,250,.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4" style={{ borderTop: '3px solid #FF6B6B' }}>
        <p className="text-[9px] mb-2 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#FF6B6B' }}>
          <AlertTriangle size={12} /> Needs attention · platform
        </p>
        {attention.length === 0 ? (
          <p className="text-sm text-gray-400 mt-3">All clear — nada esperando tu decisión. 🤙</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {attention.map((a) => (
              <Link key={a.label} href={a.href} className="flex items-center justify-between py-2.5 hover:bg-gray-50 rounded-lg px-1 -mx-1">
                <p className="text-[13px] font-semibold text-[var(--tss-navy)]">{a.label}</p>
                <span className={`text-[11px] font-extrabold rounded-full px-2.5 py-0.5 ${a.sev === 'red' ? 'bg-red-50 text-red-700' : a.sev === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{a.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
