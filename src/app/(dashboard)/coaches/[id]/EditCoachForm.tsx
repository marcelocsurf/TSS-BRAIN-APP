'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCoachIdentity, deleteCoach } from '@/lib/actions/coach-admin';
import { Pencil, Trash2, X } from 'lucide-react';

const ROLES = ['admin', 'coordinator', 'head_coach', 'coach', 'assistant', 'seller', 'host'];

export function EditCoachForm({ coach, academies = [] }: { coach: any; academies?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(coach.first_name || '');
  const [lastName, setLastName] = useState(coach.last_name || '');
  const [email, setEmail] = useState(coach.email || '');
  const [role, setRole] = useState(coach.role || 'assistant');
  const [academyId, setAcademyId] = useState(coach.academy_id || '');
  const [canCoordinate, setCanCoordinate] = useState(coach.portal_can_coordinate === true);
  const [canBoards, setCanBoards] = useState(coach.portal_can_manage_boards === true);
  const [opsCoordination, setOpsCoordination] = useState(coach.ops_coordination === true);
  const [specialistRole, setSpecialistRole] = useState<string>(coach.specialist_role || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await updateCoachIdentity(coach.id, {
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      academy_id: academyId || undefined,
      portal_can_coordinate: canCoordinate,
      portal_can_manage_boards: canBoards,
      ops_coordination: opsCoordination,
      specialist_role: specialistRole || null,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Could not save.');
      return;
    }
    setOpen(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm(`Permanently delete ${coach.display_name || 'this person'}? This cannot be undone. (If they have sessions, deactivate instead.)`)) return;
    setDeleting(true);
    setError(null);
    const res = await deleteCoach(coach.id);
    setDeleting(false);
    if (!res.ok) {
      setError(res.error || 'Could not delete.');
      return;
    }
    router.push('/coaches');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 bg-[#F7F9FA] text-[var(--tss-navy)] text-xs font-medium rounded-lg hover:bg-[#EDF3F5] inline-flex items-center gap-1"
      >
        <Pencil size={12} strokeWidth={1.75} /> Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] shadow-xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--tss-navy)]">Edit staff member</h3>
          <button onClick={() => setOpen(false)} className="text-[#55666E] hover:text-[#55666E]"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-[#55666E]">First name
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm text-[#10263B]" />
          </label>
          <label className="text-xs text-[#55666E]">Last name
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm text-[#10263B]" />
          </label>
        </div>
        <label className="text-xs text-[#55666E] block">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm text-[#10263B]" />
        </label>
        <label className="text-xs text-[#55666E] block">Role
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm text-[#10263B] bg-[#F7F9FA] capitalize">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        {role === 'host' && (
          <label className="flex items-start gap-2 text-xs text-[#55666E] bg-[#F7F9FA] rounded-lg p-3 cursor-pointer">
            <input type="checkbox" checked={canCoordinate} onChange={(e) => setCanCoordinate(e.target.checked)} className="mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--tss-navy)]">Coverage mode (coordination)</span><br />
              On coordinator-off days this host can assign coaches and reschedule/cancel one-day classes from their portal. Money and configuration stay dashboard-only.
            </span>
          </label>
        )}
        {role === 'host' && (
          <label className="flex items-start gap-2 text-xs text-[#55666E] bg-[#F7F9FA] rounded-lg p-3 cursor-pointer">
            <input type="checkbox" checked={opsCoordination} onChange={(e) => setOpsCoordination(e.target.checked)} className="mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--tss-navy)]">Coordination coverage (planning dashboard)</span><br />
              Opens the coordinator&apos;s planning tools in the dashboard: services, camps, schedules, coaches and staff assignment, students, spaces. No costs, reports, payroll, sales or course codes.
            </span>
          </label>
        )}
        <label className="text-xs text-[#55666E] block">HP specialist role (team portal /equipo)
          <select value={specialistRole} onChange={(e) => setSpecialistRole(e.target.value)}
            className="mt-1 w-full border border-[#DCD7C6] rounded-lg px-2 py-1.5 text-sm">
            <option value="">— None —</option>
            <option value="psicologo">Psicólogo</option>
            <option value="fisico">Preparador físico</option>
            <option value="nutricionista">Nutricionista</option>
          </select>
        </label>
        {!['host', 'coordinator', 'admin'].includes(role) && (
          <label className="flex items-start gap-2 text-xs text-[#55666E] bg-[#F7F9FA] rounded-lg p-3 cursor-pointer">
            <input type="checkbox" checked={canBoards} onChange={(e) => setCanBoards(e.target.checked)} className="mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--tss-navy)]">Board inventory access</span><br />
              This coach can add, edit and rent boards from the 🏄 Inventory tool in their portal (the same inventory used for rentals and camps). Note: rentals include client contact info.
            </span>
          </label>
        )}
        {academies.length > 0 && (
          <label className="text-xs text-[#55666E] block">Academy
            <select value={academyId} onChange={(e) => setAcademyId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#DCD7C6] rounded-lg text-sm text-[#10263B] bg-[#F7F9FA]">
              {academies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={remove}
            disabled={deleting}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 size={12} strokeWidth={1.75} /> {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="px-3 py-2 text-xs rounded-lg border border-[#DCD7C6] text-[#55666E] hover:bg-[#F7F9FA]">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--tss-navy)] text-white hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
