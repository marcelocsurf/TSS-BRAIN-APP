'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCoachIdentity, deleteCoach } from '@/lib/actions/coach-admin';
import { Pencil, Trash2, X } from 'lucide-react';

const ROLES = ['admin', 'coordinator', 'coach', 'assistant'];

export function EditCoachForm({ coach, academies = [] }: { coach: any; academies?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(coach.first_name || '');
  const [lastName, setLastName] = useState(coach.last_name || '');
  const [email, setEmail] = useState(coach.email || '');
  const [role, setRole] = useState(coach.role || 'assistant');
  const [academyId, setAcademyId] = useState(coach.academy_id || '');
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
        className="px-3 py-2 bg-gray-50 text-[var(--tss-navy)] text-xs font-medium rounded-lg hover:bg-gray-100 inline-flex items-center gap-1"
      >
        <Pencil size={12} strokeWidth={1.75} /> Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--tss-navy)]">Edit staff member</h3>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">First name
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
          </label>
          <label className="text-xs text-gray-500">Last name
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
          </label>
        </div>
        <label className="text-xs text-gray-500 block">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
        </label>
        <label className="text-xs text-gray-500 block">Role
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white capitalize">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        {academies.length > 0 && (
          <label className="text-xs text-gray-500 block">Academy
            <select value={academyId} onChange={(e) => setAcademyId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white">
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
            <button onClick={() => setOpen(false)} className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--tss-navy)] text-white hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
