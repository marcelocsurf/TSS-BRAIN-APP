'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/actions/password-reset';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Could not send reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tss-navy)] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--tss-navy)] via-[var(--tss-navy-light)] to-[var(--tss-navy)] opacity-60" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <Image
            src="/tss-logo-white.png"
            alt="The Surf Sequence"
            width={240}
            height={120}
            className="mx-auto mb-3"
            priority
          />
          <p className="tss-tagline text-[var(--tss-cyan)] text-lg">
            Reset your password
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-7 shadow-2xl shadow-black/20 space-y-4 border border-white/10 text-center">
            <p className="text-sm text-[var(--tss-navy)] font-semibold">Check your email</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              If an account exists for <strong>{email}</strong>, we just sent a reset link.
              It expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="block w-full py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-7 shadow-2xl shadow-black/20 space-y-5 border border-white/10"
          >
            <p className="text-sm text-gray-600 leading-relaxed">
              Enter the email associated with your account and we'll send you a link to reset your password.
            </p>

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
                autoFocus
                className="w-full px-4 py-2.5 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent"
                placeholder="you@example.com"
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
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <p className="text-center">
              <Link
                href="/login"
                className="text-xs text-[var(--tss-gray-500)] hover:text-[var(--tss-navy)] tracking-wide"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                ← Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
