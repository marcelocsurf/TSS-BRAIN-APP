'use client';

// Universal entry — single front door for the app.
// - "Student" tab: redirects to /activate when the user has a TSS-XXXX-XXXX
//   code (or to their stored portal link). The PIN-based fast re-entry lands
//   here in Tanda 3 once `setStudentPin` + `loginStudentByPin` are wired up.
// - "Coach / Coordinator / Admin" tab: email + password (Supabase auth).

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, GraduationCap, AlertTriangle } from 'lucide-react';
import { loginStudentByPin } from '@/lib/actions/student-pin';

type Tab = 'student' | 'staff';

export default function EntryForm({ kicked = false }: { kicked?: boolean }) {
  const [tab, setTab] = useState<Tab>('student');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tss-navy)] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--tss-navy)] via-[var(--tss-navy-light,#0f2444)] to-[var(--tss-navy)] opacity-60" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Image
            src="/tss-logo-white.png?v=2"
            alt="The Surf Sequence"
            width={220}
            height={110}
            className="mx-auto mb-3"
            priority
          />
          <p className="tss-tagline text-[var(--tss-cyan)] text-base">
            Evolve through play
          </p>
        </div>

        {kicked && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              You were logged out because someone signed into your account on another device. Enter your PIN to take this session back.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <TabButton active={tab === 'student'} onClick={() => setTab('student')} icon={<GraduationCap size={16} />}>
            Student
          </TabButton>
          <TabButton active={tab === 'staff'} onClick={() => setTab('staff')} icon={<Users size={16} />}>
            Coach / Coordinator / Admin
          </TabButton>
        </div>

        {tab === 'student' ? <StudentPanel /> : <StaffPanel />}

        <p
          className="text-center text-xs text-white/30 mt-8 tracking-wide"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          The Surf Sequence
        </p>
      </div>
    </div>
  );
}

function TabButton({
  active, onClick, icon, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2.5 rounded-2xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all ${
        active
          ? 'bg-[var(--tss-cyan)] text-[var(--tss-navy)] shadow-md'
          : 'bg-white/10 text-white/70 hover:bg-white/15'
      }`}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

function StudentPanel() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const looksLikeCode = /^TSS-/i.test(code.trim());
  const looksLikePin = /^\d{4,6}$/.test(code.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    if (!trimmed) return;

    if (looksLikeCode) {
      router.push(`/activate?code=${encodeURIComponent(trimmed)}`);
      return;
    }

    if (looksLikePin) {
      setLoading(true);
      try {
        const { portalToken } = await loginStudentByPin(trimmed);
        router.push(`/portal/${portalToken}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not sign in.');
        setLoading(false);
      }
      return;
    }

    setError('Enter your 4–6 digit PIN, or the access code your coach sent you (TSS-XXXX-XXXX).');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-2xl shadow-black/20 space-y-4 border border-white/10">
      <div>
        <label
          className="block text-xs font-medium text-[var(--tss-gray-500)] mb-1.5 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Access code or PIN
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          inputMode={looksLikeCode ? 'text' : 'numeric'}
          className="w-full px-4 py-2.5 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent"
          placeholder="TSS-XXXX-XXXX or your PIN"
        />
        <p className="text-[11px] text-gray-500 mt-1.5">
          First time? Use the code your coach sent you. Already activated? Use your PIN (soon) or the portal link saved on your device.
        </p>
      </div>

      {error && <p className="text-sm text-[var(--tss-danger,#dc2626)] bg-red-50 p-3 rounded-xl">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[var(--tss-cyan)] text-[var(--tss-navy)] rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-[var(--tss-cyan)]/20"
      >
        {loading ? 'Signing in…' : 'Continue'}
      </button>
    </form>
  );
}

function StaffPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Go to / so the server-side role routing decides between
    // /dashboard (admin/coordinator) and /coach-portal/[token] (coach).
    router.push('/');
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-2xl shadow-black/20 space-y-4 border border-white/10">
      <div>
        <label
          className="block text-xs font-medium text-[var(--tss-gray-500)] mb-1.5 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent"
          placeholder="coach@thesurfsequence.com"
        />
      </div>

      <div>
        <label
          className="block text-xs font-medium text-[var(--tss-gray-500)] mb-1.5 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-[var(--tss-danger,#dc2626)] bg-red-50 p-3 rounded-xl">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[var(--tss-gold,#d4a017)] text-white rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-[var(--tss-gold,#d4a017)]/20"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center pt-1">
        <a href="/forgot-password" className="text-xs text-[var(--tss-gray-500,#6b7280)] hover:text-[var(--tss-navy)]">
          Forgot your password?
        </a>
      </p>

      {/* First-time / expired-invite recovery — the activation link is
          single-use and expires, so new staff land here without a password. */}
      <div className="mt-1 rounded-xl bg-[var(--tss-gray-50,#f3f4f6)] border border-[var(--tss-gray-200,#e5e7eb)] px-4 py-3 text-center">
        <p className="text-xs text-[var(--tss-gray-500,#6b7280)] leading-relaxed">
          First time here, or your activation link expired?
        </p>
        <a href="/forgot-password" className="inline-block mt-1.5 text-sm font-semibold text-[var(--tss-cyan)] hover:brightness-110">
          Get a new link &amp; set your password →
        </a>
      </div>
    </form>
  );
}
