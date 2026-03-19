'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
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

    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tss-navy)] px-4 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--tss-navy)] via-[var(--tss-navy-light)] to-[var(--tss-navy)] opacity-60" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo + tagline */}
        <div className="text-center mb-10">
          <Image
            src="/tss-logo-light.png"
            alt="The Surf Sequence"
            width={180}
            height={180}
            className="mx-auto mb-4"
            priority
          />
          <p
            className="text-[var(--tss-cyan)] text-sm tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Evolve through play
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl p-7 shadow-2xl shadow-black/20 space-y-5 border border-white/10"
        >
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

          {error && (
            <p className="text-sm text-[var(--tss-danger)] bg-red-50 p-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--tss-gold)] text-white rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-[var(--tss-gold)]/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p
          className="text-center text-xs text-white/30 mt-8 tracking-wide"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          TSS Brain v0.1
        </p>
      </div>
    </div>
  );
}
