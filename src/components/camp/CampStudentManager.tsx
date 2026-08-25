'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { listStudents, type StudentRow, getStudentNames } from '@/lib/actions/students';
import { addStudentToCamp, removeStudentFromCamp } from '@/lib/actions/camps';
import { createLead } from '@/lib/actions/leads';
import { sendLeadInvitation } from '@/lib/actions/lead-invitation';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { UserPlus, UserSearch, Copy, Mail, Check } from 'lucide-react';

interface Props {
  campInstanceId: string;
  currentParticipantIds: string[];
}

type Tab = 'existing' | 'new';

export function CampStudentManager({ campInstanceId, currentParticipantIds }: Props) {
  const router = useRouter();
  const [showManager, setShowManager] = useState(false);
  const [tab, setTab] = useState<Tab>('existing');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  // ── Existing tab data — server-side search by name (scales past 100s
  // of students). Debounced so we don't query on every keystroke. ──
  const [extraNames, setExtraNames] = useState<Record<string, string>>({});
  useEffect(() => {
    const missing = currentParticipantIds.filter((pid) => !students.some((st) => st.id === pid) && !extraNames[pid]);
    if (missing.length) getStudentNames(missing).then((m) => setExtraNames((prev) => ({ ...prev, ...m }))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParticipantIds, students]);

  useEffect(() => {
    if (!showManager) return;
    const term = search.trim();
    setSearching(true);
    const t = setTimeout(() => {
      listStudents({ status: 'active', limit: 50, search: term || undefined })
        .then((res) => setStudents(res.students))
        .finally(() => setSearching(false));
    }, term ? 280 : 0);
    return () => clearTimeout(t);
  }, [showManager, search]);

  // Cupo LLENO → el cupo del servicio es sugerido: ofrecer +1 en sobrecupo
  // (pedido de Rick — antes tocaba borrar el servicio y recrearlo más grande).
  // Devuelve si el asiento QUEDÓ creado: quien llama necesita saberlo para no
  // seguir adelante (mandar la invitación, pintar el panel de éxito) cuando la
  // persona canceló el confirm.
  const addWithOverbook = async (studentId: string, opts: { allowStarted?: boolean } = {}): Promise<boolean> => {
    const r: any = await addStudentToCamp(campInstanceId, studentId, opts);
    // Camp ya arrancado: se cierra al iniciar. Coordinación puede forzarlo
    // SOLO para registrar a alguien que sí vino desde el día 1 y quedó fuera
    // del sistema — queda marcado como incorporación tardía en el asiento.
    if (r?.started) {
      const ok = window.confirm(
        `${r.started.notice}\n\nSolo forzalo si esta persona YA venía en el camp y faltaba registrarla. Quedará marcada como incorporación tardía.\n\n¿Agregarla de todos modos?`,
      );
      if (!ok) return false;
      return addWithOverbook(studentId, { ...opts, allowStarted: true });
    }
    if (r?.full) {
      const ok = window.confirm(
        `This service is full (${r.full.act}/${r.full.cap} — suggested capacity).\n\nAdd 1 more as OVERBOOK anyway? It will be flagged on the seat.`,
      );
      if (!ok) return false;
      await addStudentToCamp(campInstanceId, studentId, { ...opts, allowOverbook: true });
    }
    router.refresh();
    return true;
  };

  const handleAdd = async (studentId: string) => {
    setActionId(studentId);
    try {
      await addWithOverbook(studentId);
    } catch (err: any) {
      alert(err.message);
    }
    setActionId(null);
  };

  const handleRemove = async (studentId: string) => {
    if (!confirm('Remove this student from the camp?')) return;
    setActionId(studentId);
    try {
      await removeStudentFromCamp(campInstanceId, studentId);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
    setActionId(null);
  };

  const availableStudents = students.filter((s) => !currentParticipantIds.includes(s.id));

  // ── New-lead form state ──
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [pending, startTransition] = useTransition();
  const [justCreated, setJustCreated] = useState<{
    studentId: string;
    name: string;
    url: string;
    emailed: boolean;
    reason?: string;
  } | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const submitNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.first_name.trim() || !newLead.last_name.trim()) {
      alert('First and last name are required');
      return;
    }
    startTransition(async () => {
      const doCreate = async (allowDuplicate: boolean): Promise<boolean> => {
        const res = await createLead({
          first_name: newLead.first_name,
          last_name: newLead.last_name,
          email: newLead.email || null,
          phone: newLead.phone || null,
          allowDuplicate,
        });
        if (!res.ok) {
          if (res.duplicate) {
            const d = res.duplicate;
            const field = d.matched_on === 'email' ? 'email' : 'phone';
            const confirmed = window.confirm(
              `A student named "${d.first_name} ${d.last_name}" already exists with the same ${field}. ` +
                `They may already be in the system — consider enrolling the existing ` +
                `profile instead.\n\nCreate a new separate student anyway?`,
            );
            if (confirmed) return doCreate(true);
            return false;
          }
          alert(res.error || 'Could not create student.');
          return false;
        }
        // Si cancelaron el aviso de "camp ya arrancó" (o el de sobrecupo), el
        // alumno queda creado pero SIN asiento: no se le manda invitación ni se
        // pinta el panel de éxito, que le haría creer al coordinador que quedó
        // inscrito.
        const seated = await addWithOverbook(res.studentId);
        if (!seated) {
          alert('El alumno quedó creado pero NO se inscribió al camp. Podés agregarlo desde la lista cuando quieras.');
          setNewLead({ first_name: '', last_name: '', email: '', phone: '' });
          router.refresh();
          return false;
        }
        const result = await sendLeadInvitation(res.studentId);
        setJustCreated({
          studentId: res.studentId,
          name: `${newLead.first_name} ${newLead.last_name}`,
          url: result.url,
          emailed: result.emailed,
          reason: result.reason,
        });
        setNewLead({ first_name: '', last_name: '', email: '', phone: '' });
        router.refresh();
        return true;
      };

      try {
        await doCreate(false);
      } catch (err: any) {
        console.error('createLead failed:', err);
        alert('Could not create student. Please try again.');
      }
    });
  };

  const copyLink = async () => {
    if (!justCreated) return;
    await navigator.clipboard.writeText(justCreated.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resendEmail = async () => {
    if (!justCreated) return;
    setEmailSending(true);
    try {
      const result = await sendLeadInvitation(justCreated.studentId);
      setJustCreated({ ...justCreated, emailed: result.emailed, reason: result.reason });
    } catch (err: any) {
      alert(err.message);
    }
    setEmailSending(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        type="button"
        onClick={() => setShowManager(!showManager)}
        className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90"
      >
        {showManager ? 'Close' : 'Manage Students'}
      </button>

      {showManager && (
        <div className="mt-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-3 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setTab('existing')}
              className={`px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors ${
                tab === 'existing'
                  ? 'border-[var(--tss-cyan,#5AC3E7)] text-[var(--tss-navy)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserSearch size={13} strokeWidth={1.75} />
              Existing student
            </button>
            <button
              type="button"
              onClick={() => setTab('new')}
              className={`px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors ${
                tab === 'new'
                  ? 'border-[var(--tss-cyan,#5AC3E7)] text-[var(--tss-navy)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus size={13} strokeWidth={1.75} />
              + Create new (Lead)
            </button>
          </div>

          {/* ── Existing tab ─────────────────────────── */}
          {tab === 'existing' && (
            <div className="space-y-3">
              {/* Search by name — server-side, scales to a big roster */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or last name…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
              />
              {currentParticipantIds.length > 0 && (
                <div>
                  <p
                    className="text-[10px] font-semibold text-gray-400 uppercase mb-1 tracking-wider"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    Remove from camp
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {currentParticipantIds.map((pid) => {
                      const s = students.find((st) => st.id === pid);
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => handleRemove(pid)}
                          disabled={actionId === pid}
                          className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full hover:bg-red-100 disabled:opacity-50"
                        >
                          {s ? `${s.first_name} ${s.last_name}` : extraNames[pid] ?? pid.slice(0, 8)} &times;
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableStudents.length > 0 ? (
                <div>
                  <p
                    className="text-[10px] font-semibold text-gray-400 uppercase mb-1 tracking-wider"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    Add to camp
                  </p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {availableStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleAdd(s.id)}
                        disabled={actionId === s.id}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-green-50 text-left transition-colors disabled:opacity-50"
                      >
                        <div
                          className="w-5 h-5 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: BELT_DISPLAY[s.belt_level]?.color || '#999' }}
                        >
                          {s.first_name[0]}
                          {s.last_name[0]}
                        </div>
                        <span className="text-xs text-gray-700 flex-1">
                          {s.first_name} {s.last_name}
                        </span>
                        <span className="text-[10px] text-green-600">+ Add</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  {searching
                    ? 'Searching…'
                    : search.trim()
                    ? `No students match "${search.trim()}".`
                    : 'No other active students available.'}
                </p>
              )}
            </div>
          )}

          {/* ── New-lead tab ─────────────────────────── */}
          {tab === 'new' && (
            <div>
              {!justCreated ? (
                <form onSubmit={submitNewLead} className="space-y-2">
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-2">
                    Quick capture for a new client. We create a Lead, enrol them in this service,
                    and send them the safety form to complete on their own.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      value={newLead.first_name}
                      onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      value={newLead.last_name}
                      onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email (optional but recommended)"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full py-2 bg-[var(--tss-navy)] text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {pending ? 'Creating + enrolling…' : 'Create Lead + Enrol + Send form'}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-3">
                  <p className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1.5">
                    <Check size={13} strokeWidth={2} />
                    {justCreated.name} enrolled as Lead.
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    {justCreated.emailed
                      ? 'Safety-form email sent. Once they submit, the coach sees waiver + medical info.'
                      : `Email NOT sent (${justCreated.reason ?? 'no email on file'}). Copy the link below and send via WhatsApp.`}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-800 bg-white border border-emerald-200 rounded-md px-2 py-1.5 truncate">
                    {justCreated.url}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyLink}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-[var(--tss-navy)] text-xs font-semibold rounded-md border border-emerald-200 hover:bg-emerald-50 transition-colors"
                    >
                      <Copy size={12} strokeWidth={2} />
                      {copied ? 'Copied!' : 'Copy link'}
                    </button>
                    {!justCreated.emailed && (
                      <button
                        type="button"
                        onClick={resendEmail}
                        disabled={emailSending}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--tss-navy)] text-white text-xs font-semibold rounded-md disabled:opacity-50 transition-colors"
                      >
                        <Mail size={12} strokeWidth={2} />
                        {emailSending ? 'Sending…' : 'Resend email'}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setJustCreated(null)}
                    className="w-full text-[11px] text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Add another lead
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
