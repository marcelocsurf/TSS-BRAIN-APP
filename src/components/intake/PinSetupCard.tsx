'use client';

import { useState } from 'react';
import { setStudentPin } from '@/lib/actions/student-pin';
import { CheckCircle2, KeyRound } from 'lucide-react';

export function PinSetupCard({
  portalToken,
  hasPin,
}: {
  portalToken: string;
  hasPin: boolean;
}) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(hasPin);
  const [expanded, setExpanded] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4 to 6 digits.');
      return;
    }
    if (pin !== confirm) {
      setError('PINs do not match.');
      return;
    }
    setLoading(true);
    try {
      await setStudentPin(portalToken, pin);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your PIN.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle2 className="text-[var(--tss-cyan)] flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-semibold text-[var(--tss-navy)]">PIN saved</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            Next time, open the app and enter your PIN to come straight back in.
          </p>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <KeyRound className="text-[var(--tss-cyan)] flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-semibold text-[var(--tss-navy)]">Set a PIN for fast re-entry</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            4–6 digits. Lets you sign back in from any device without the link.
          </p>
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
      <p className="text-sm font-semibold text-[var(--tss-navy)]">Choose a PIN</p>
      <p className="text-xs text-gray-500 leading-relaxed">
        4–6 digits. You'll use this to sign in on this device — or any device where you want to access your portal.
      </p>
      <input
        type="password"
        inputMode="numeric"
        minLength={4}
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="PIN"
        autoFocus
        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
      />
      <input
        type="password"
        inputMode="numeric"
        minLength={4}
        maxLength={6}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Confirm PIN"
        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
      />
      {error && <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[var(--tss-cyan)] text-[var(--tss-navy)] rounded-xl text-sm font-semibold disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save PIN'}
      </button>
    </form>
  );
}
