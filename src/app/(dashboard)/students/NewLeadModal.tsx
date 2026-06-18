'use client';

// Modal triggered from the Students page "+ New Lead" button.
// Captures the minimum needed to spin up a Lead row, then surfaces the
// public /lead/[token] link so the coach can paste it into WhatsApp.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLead } from '@/lib/actions/leads';
import { Copy, CheckCircle2, UserPlus, X } from 'lucide-react';

export default function NewLeadModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [studentType, setStudentType] = useState<'member' | 'dropin'>('member');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const reset = () => {
    setOpen(false);
    setFirst('');
    setLast('');
    setPhone('');
    setError('');
    setCreatedUrl(null);
    setCopied(false);
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const create = async (allowDuplicate: boolean) => {
      const { leadFormUrl } = await createLead({
        first_name: first,
        last_name: last,
        phone: phone || null,
        student_type: studentType,
        allowDuplicate,
      });
      setCreatedUrl(leadFormUrl);
    };
    try {
      await create(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create lead';
      if (msg.startsWith('DUPLICATE::')) {
        const [, , name, matchedOn] = msg.split('::');
        const field = matchedOn === 'email' ? 'email' : 'phone';
        const ok = window.confirm(
          `A student named "${name}" already exists with the same ${field}. ` +
            `Create a new separate student anyway?`,
        );
        if (ok) {
          try {
            await create(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create lead');
          }
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!createdUrl) return;
    await navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 bg-white text-[var(--tss-navy)] border border-[var(--tss-navy)] text-sm font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5"
      >
        <UserPlus size={16} strokeWidth={1.75} />
        New Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={reset}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {!createdUrl ? (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--tss-navy)]">New Lead</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    A Lead can attend 1–3 trial classes. We capture the minimum safety info now and promote to Member when they enroll in a course.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" required>
                    <input
                      value={first}
                      onChange={(e) => setFirst(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
                    />
                  </Field>
                  <Field label="Last name" required>
                    <input
                      value={last}
                      onChange={(e) => setLast(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
                    />
                  </Field>
                </div>

                <Field label="Phone (for WhatsApp)">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+503 7000 0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
                  />
                </Field>

                <Field label="Type">
                  <div className="grid grid-cols-2 gap-2">
                    {([['member', 'Member', 'Academy · portal + course'], ['dropin', 'Drop-in', 'Single class · waiver only']] as const).map(([val, label, desc]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStudentType(val)}
                        className={`text-left rounded-xl border px-3 py-2 transition-colors ${studentType === val ? 'border-[var(--tss-cyan)] bg-cyan-50/40' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <p className="text-sm font-semibold text-[var(--tss-navy)]">{label}</p>
                        <p className="text-[10px] text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </Field>

                {error && (
                  <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? 'Creating…' : 'Create Lead + Get link'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-[var(--tss-cyan)] flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-lg font-bold text-[var(--tss-navy)]">Lead created</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Copy this link and send it to the lead by WhatsApp. They'll fill the safety form before their first class.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
                  <code className="flex-1 text-xs text-gray-700 truncate font-mono">{createdUrl}</code>
                  <button
                    onClick={copy}
                    className="px-3 py-1.5 bg-[var(--tss-cyan)] text-[var(--tss-navy)] rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="w-full py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:brightness-110"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label} {required && <span className="text-[var(--tss-cyan)]">*</span>}
      </span>
      {children}
    </label>
  );
}
