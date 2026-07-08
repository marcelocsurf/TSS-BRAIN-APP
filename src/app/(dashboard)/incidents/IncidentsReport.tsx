'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { IncidentAlert } from '@/lib/actions/dashboard';
import { incidentTypeLabel } from '@/lib/constants/brand';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map((n) => parseInt(n, 10));
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function IncidentsReport({ incidents, month }: { incidents: IncidentAlert[]; month: string }) {
  const router = useRouter();
  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const exportCsv = () => {
    const esc = (v: any) => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [
      ['Date', 'Type', 'Coach', 'Student', 'Description', 'Action taken', 'Status'],
      ...incidents.map((i) => [
        i.created_at ? new Date(i.created_at).toLocaleString() : '',
        incidentTypeLabel(i.incident_type),
        i.coach_name ?? '',
        i.is_general ? 'General' : (i.student_name ?? ''),
        i.incident_description ?? '',
        i.incident_action ?? '',
        i.acknowledged ? 'Read' : 'Unread',
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `incidents-${month}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--tss-cyan)]">The Surf Sequence · Admin</p>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>Incidents — {monthLabel}</h1>
        <p className="text-sm text-gray-500 mt-1">{incidents.length} incident{incidents.length === 1 ? '' : 's'} this month.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={() => router.push(`/incidents?month=${shiftMonth(month, -1)}`)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><ChevronLeft size={16} /></button>
          <span className="text-sm font-mono px-2">{month}</span>
          <button onClick={() => router.push(`/incidents?month=${shiftMonth(month, 1)}`)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><ChevronRight size={16} /></button>
        </div>
        <button onClick={exportCsv} disabled={incidents.length === 0} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--tss-navy)] text-white text-sm font-semibold disabled:opacity-40">
          <Download size={15} /> CSV
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">No incidents this month.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {incidents.map((inc) => (
            <div key={inc.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full">{incidentTypeLabel(inc.incident_type)}</span>
                <span className="text-[10px] text-gray-400">{inc.created_at ? new Date(inc.created_at).toLocaleString() : ''}</span>
              </div>
              <p className="text-sm text-[var(--tss-navy)] mt-1">
                {inc.is_general ? <span className="text-gray-500 italic">General</span> : (
                  inc.student_id ? <Link href={`/students/${inc.student_id}`} className="hover:underline">{inc.student_name || 'Student'}</Link> : (inc.student_name || 'Student')
                )}
                {inc.coach_name ? ` · ${inc.coach_name}` : ''}
                {!inc.acknowledged && inc.source === 'reported' && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white">Unread</span>}
              </p>
              {inc.incident_description && <p className="text-xs text-gray-600 mt-0.5">{inc.incident_description}</p>}
              {inc.incident_action && <p className="text-[11px] text-gray-500 mt-0.5"><span className="text-gray-400">Action:</span> {inc.incident_action}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
