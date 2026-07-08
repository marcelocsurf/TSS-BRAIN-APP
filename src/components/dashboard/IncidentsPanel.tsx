'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { acknowledgeIncident, type IncidentAlert } from '@/lib/actions/dashboard';
import { incidentTypeLabel } from '@/lib/constants/brand';
import { AlertTriangle, Check, ChevronDown } from 'lucide-react';

// Coordinator/admin incident feed: unread badge on top, mark-as-read per
// reported incident, and a link to the full monthly report.
export function IncidentsPanel({ incidents }: { incidents: IncidentAlert[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const unread = incidents.filter((i) => !i.acknowledged);

  const markRead = async (id: string) => {
    const rawId = id.replace(/^rep-/, '');
    setBusyId(id);
    const res = await acknowledgeIncident(rawId);
    setBusyId(null);
    if (!res.ok) { alert(res.error || 'Could not mark as read.'); return; }
    router.refresh();
  };

  if (incidents.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-semibold text-red-700 uppercase tracking-wider inline-flex items-center gap-1.5"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          <AlertTriangle size={14} strokeWidth={1.75} /> Incidents
          {unread.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white">{unread.length} unread</span>
          )}
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <Link href="/incidents" className="text-[11px] text-[var(--tss-navy)] hover:underline">
          Full report →
        </Link>
      </div>

      {open && (
        <div className="bg-white rounded-xl border border-red-200 divide-y divide-red-50 overflow-hidden">
          {incidents.map((inc) => (
            <div key={inc.id} className={inc.acknowledged ? 'opacity-55' : ''}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                    {incidentTypeLabel(inc.incident_type)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {inc.created_at ? new Date(inc.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-sm text-[var(--tss-navy)] mt-1">
                  {inc.is_general ? (
                    <span className="text-gray-500 italic">General (no specific student)</span>
                  ) : (
                    <>
                      {inc.student_id ? (
                        <Link href={`/students/${inc.student_id}`} className="hover:underline">{inc.student_name || 'Student'}</Link>
                      ) : (inc.student_name || 'Student')}
                    </>
                  )}
                  {inc.coach_name ? ` · ${inc.coach_name}` : ''}
                </p>
                {inc.incident_description && (
                  <p className="text-xs text-gray-600 mt-0.5">{inc.incident_description}</p>
                )}
                {inc.incident_action && (
                  <p className="text-[11px] text-gray-500 mt-0.5"><span className="text-gray-400">Action:</span> {inc.incident_action}</p>
                )}
                <div className="mt-2">
                  {inc.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><Check size={11} strokeWidth={2.5} /> Read</span>
                  ) : inc.source === 'reported' ? (
                    <button
                      onClick={() => markRead(inc.id)}
                      disabled={busyId === inc.id}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[var(--tss-navy)] rounded-full px-3 py-1 disabled:opacity-50"
                    >
                      <Check size={12} strokeWidth={2.5} /> {busyId === inc.id ? '…' : 'Mark as read'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">Logged with the session</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
