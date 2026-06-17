'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  assignServiceStaff,
  removeServiceStaff,
  createStaffMember,
  type ServiceStaffRow,
  type ServiceStaffRole,
} from '@/lib/actions/service-staff';

const ROLE_LABEL: Record<string, string> = {
  assistant: 'Asistente', photographer: 'Fotógrafo', filmmaker: 'Filmmaker', other: 'Staff',
};
const STATUS_CHIP: Record<string, string> = {
  invited: 'bg-amber-50 text-amber-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  declined: 'bg-red-50 text-red-600',
};
const STATUS_LABEL: Record<string, string> = {
  invited: 'Pendiente', accepted: 'Confirmó', declined: 'Rechazó',
};

export function ServiceStaffManager({
  campInstanceId,
  staff,
  coaches,
  staffMembers,
}: {
  campInstanceId: string;
  staff: ServiceStaffRow[];
  coaches: { id: string; name: string; role: string }[];
  staffMembers: { id: string; name: string; role: string | null; email: string | null }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Assign-assistant (from coaches)
  const [assistantId, setAssistantId] = useState('');
  // Assign-external (photographer/filmmaker): pick existing or create new
  const [extRole, setExtRole] = useState<ServiceStaffRole>('photographer');
  const [extMemberId, setExtMemberId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const assignedCoachIds = new Set(staff.filter((s) => s.coach_id).map((s) => s.coach_id));
  const assignedMemberIds = new Set(staff.filter((s) => s.staff_member_id).map((s) => s.staff_member_id));

  const run = (fn: () => Promise<any>) => {
    setError('');
    startTransition(async () => {
      try { await fn(); router.refresh(); } catch (e: any) { setError(e.message || 'Error'); }
    });
  };

  const addAssistant = () => {
    if (!assistantId) return;
    run(async () => {
      const r = await assignServiceStaff({ campInstanceId, role: 'assistant', coachId: assistantId });
      if (!r.ok) throw new Error(r.error);
      setAssistantId('');
    });
  };

  const addExternal = () => {
    run(async () => {
      let memberId = extMemberId;
      if (!memberId) {
        if (!newName.trim()) throw new Error('Nombre requerido.');
        const created = await createStaffMember({ name: newName, email: newEmail || null, phone: newPhone || null, role: extRole });
        memberId = created.id;
      }
      const r = await assignServiceStaff({ campInstanceId, role: extRole, staffMemberId: memberId });
      if (!r.ok) throw new Error(r.error);
      setExtMemberId(''); setNewName(''); setNewEmail(''); setNewPhone('');
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Staff del servicio</h3>
        <p className="text-[11px] text-gray-500">Asistentes + fotógrafo/filmmaker. Cada uno recibe el aviso y confirma o rechaza.</p>
      </div>

      {/* Current staff */}
      {staff.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {staff.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">{s.name}</p>
                <p className="text-[10px] text-gray-400">{ROLE_LABEL[s.role] ?? s.role}{s.is_coach ? '' : ' · sin cuenta'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CHIP[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                <button onClick={() => run(() => removeServiceStaff(s.id))} className="text-[11px] text-gray-300 hover:text-red-500">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Add assistant */}
      <div className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50/50">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Agregar asistente (coach)</p>
        <div className="flex gap-2">
          <select value={assistantId} onChange={(e) => setAssistantId(e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">Elegir coach…</option>
            {coaches.filter((c) => !assignedCoachIds.has(c.id)).map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
            ))}
          </select>
          <button onClick={addAssistant} disabled={pending || !assistantId} className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-40 bg-[var(--tss-navy)]">Asignar</button>
        </div>
      </div>

      {/* Add external (photographer / filmmaker) */}
      <div className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50/50">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Agregar fotógrafo / filmmaker</p>
        <div className="flex gap-2">
          <select value={extRole} onChange={(e) => setExtRole(e.target.value as ServiceStaffRole)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="photographer">Fotógrafo</option>
            <option value="filmmaker">Filmmaker</option>
            <option value="other">Otro</option>
          </select>
          <select value={extMemberId} onChange={(e) => setExtMemberId(e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">+ Nueva persona…</option>
            {staffMembers.filter((m) => !assignedMemberIds.has(m.id)).map((m) => (
              <option key={m.id} value={m.id}>{m.name}{m.role ? ` (${m.role})` : ''}</option>
            ))}
          </select>
        </div>
        {!extMemberId && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email (para el aviso)" className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Teléfono" className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
          </div>
        )}
        <button onClick={addExternal} disabled={pending} className="w-full py-2 text-white text-xs font-semibold rounded-lg disabled:opacity-50 bg-[var(--tss-navy)]">
          {pending ? 'Guardando…' : 'Asignar y avisar'}
        </button>
      </div>
    </div>
  );
}
