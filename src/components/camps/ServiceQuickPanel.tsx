'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, ArrowRight, Check } from 'lucide-react';
import { updateCampHeadCoach } from '@/lib/actions/camps';
import { getCoachesForAssignment, type CoachForAssignment } from '@/lib/actions/cascade-sessions';
import { CampStudentManager } from '@/components/camp/CampStudentManager';

interface Props {
  camp: any;
  onClose: () => void;
}

// Quick-action panel that opens when a coordinator taps a service card in
// the calendar. The two daily actions — change coach, add student — are
// one tap away here; everything else lives on the full detail page.
export function ServiceQuickPanel({ camp, onClose }: Props) {
  const router = useRouter();
  const [coaches, setCoaches] = useState<CoachForAssignment[]>([]);
  const [coachId, setCoachId] = useState<string>(camp.head_coach_id ?? '');
  const [pending, startTransition] = useTransition();
  const [savedCoach, setSavedCoach] = useState(false);

  useEffect(() => {
    getCoachesForAssignment().then((all) =>
      setCoaches(all.filter((c) => c.role === 'coach' || c.role === 'assistant')),
    );
  }, []);

  const tpl = camp.camp_templates;
  const capacity = camp.capacity_override ?? tpl?.capacity_max ?? 4;
  const active = (camp.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const paidCount = active.filter((p: any) => p.payment_status === 'paid').length;
  const enrolled = active.length;
  const participantIds = active.map((p: any) => p.student_id).filter(Boolean);

  const changeCoach = (id: string) => {
    setCoachId(id);
    setSavedCoach(false);
    startTransition(async () => {
      await updateCampHeadCoach(camp.id, id || null);
      setSavedCoach(true);
      router.refresh();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2 sticky top-0 bg-white">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              {tpl?.level_name ?? 'Service'} · {camp.scheduled_time ?? ''}
            </p>
            <h3 className="text-base font-bold text-[var(--tss-navy)] truncate">{camp.camp_name}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Coach — change inline */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1">
              Head coach
            </label>
            <div className="flex items-center gap-2">
              <select
                value={coachId}
                onChange={(e) => changeCoach(e.target.value)}
                disabled={pending}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:opacity-50"
              >
                <option value="">Select coach…</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
              </select>
              {savedCoach && !pending && <Check size={16} className="text-emerald-600 shrink-0" />}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Spots</label>
              <span className="text-xs text-gray-500 tabular-nums">
                {enrolled}/{capacity}{enrolled - paidCount > 0 ? ` · ${enrolled - paidCount} unpaid` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: capacity }).map((_, i) => {
                const state = i < paidCount ? 'paid' : i < enrolled ? 'reserved' : 'open';
                return (
                  <span key={i} className={`block w-3 h-3 rounded-full ${
                    state === 'paid' ? 'bg-emerald-500' : state === 'reserved' ? 'bg-amber-400' : 'bg-gray-200'
                  }`} />
                );
              })}
            </div>
          </div>

          {/* Add / manage students — reuses the full manager */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">
              Students
            </label>
            <CampStudentManager campInstanceId={camp.id} currentParticipantIds={participantIds} />
          </div>

          {/* Full details */}
          <Link
            href={`/camps/${camp.id}`}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-[var(--tss-navy)]"
          >
            Full details (sessions, evaluations…)
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
