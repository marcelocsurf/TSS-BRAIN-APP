'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { validateAccessCode, redeemCodeAndCreateStudent } from '@/lib/actions/course';
import { CheckCircle2 } from 'lucide-react';

type Step = 'enter-code' | 'fill-profile' | 'success';

const PRODUCT_LABEL: Record<string, string> = {
  white_belt: 'White Belt Masterclass',
};

function InputField({
  label,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent"
      />
    </div>
  );
}

export default function ActivatePage() {
  const [step, setStep] = useState<Step>('enter-code');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [code, setCode] = useState('');
  const [productType, setProductType] = useState('');

  // Step 2
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [dob, setDob] = useState('');

  // Step 3
  const [portalToken, setPortalToken] = useState('');

  const handleValidateCode = async () => {
    const trimmed = code.toUpperCase().trim();
    if (!trimmed) {
      setError('Please enter your activation code');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await validateAccessCode(trimmed);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCode(trimmed);
    setProductType(res.productType);
    setStep('fill-profile');
  };

  const handleCreateAccount = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await redeemCodeAndCreateStudent(code, {
      firstName,
      lastName,
      email: email || undefined,
      country: country || undefined,
      dob: dob || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPortalToken(res.portalToken);
    setStep('success');
  };

  const portalUrl = `/portal/${portalToken}`;

  return (
    <>
      {/* Step 1 — Enter Code */}
      {step === 'enter-code' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <h1
              className="text-2xl font-bold mb-1 leading-tight"
              style={{ color: 'var(--tss-navy, #0d2240)', fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Activate Your Access
            </h1>
            <p className="text-sm text-gray-500">
              Enter the access code you received to get started.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleValidateCode()}
              placeholder="TSS-XXXX-XXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-mono font-semibold tracking-widest uppercase focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  '--tw-ring-color': 'var(--tss-cyan, #00c2e0)',
                } as React.CSSProperties
              }
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleValidateCode}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--tss-navy, #0d2240)' }}
          >
            {loading ? 'Checking...' : 'Activate'}
          </button>
        </div>
      )}

      {/* Step 2 — Fill Profile */}
      {step === 'fill-profile' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <div
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
              style={{
                backgroundColor: 'var(--tss-cyan, #00c2e0)',
                color: '#fff',
              }}
            >
              Code valid — {PRODUCT_LABEL[productType] ?? productType}
            </div>
            <h1
              className="text-2xl font-bold mb-1 leading-tight"
              style={{ color: 'var(--tss-navy, #0d2240)', fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Create Your Profile
            </h1>
            <p className="text-sm text-gray-500">
              Fill in your details to set up your student account.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="First Name"
                required
                value={firstName}
                onChange={setFirstName}
                placeholder="Ana"
              />
              <InputField
                label="Last Name"
                required
                value={lastName}
                onChange={setLastName}
                placeholder="García"
              />
            </div>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ana@email.com"
            />
            <InputField
              label="Country"
              value={country}
              onChange={setCountry}
              placeholder="El Salvador"
            />
            <InputField
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={setDob}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--tss-navy, #0d2240)' }}
          >
            {loading ? 'Creating account...' : 'Create My Account'}
          </button>

          <button
            onClick={() => {
              setStep('enter-code');
              setError(null);
            }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 text-center"
          >
            ← Back to code entry
          </button>
        </div>
      )}

      {/* Step 3 — Success */}
      {step === 'success' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center space-y-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--tss-cyan, #00c2e0)' }}
          >
            <CheckCircle2 size={32} strokeWidth={1.75} className="text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold mb-2 leading-tight"
              style={{ color: 'var(--tss-navy, #0d2240)', fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Your account is ready!
            </h1>
            <p className="text-sm text-gray-500">
              Welcome to TSS Surf Academy. Your student portal is ready to use.
            </p>
          </div>

          <a
            href={portalUrl}
            className="block w-full py-3 rounded-lg font-semibold text-sm text-white text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--tss-navy, #0d2240)' }}
          >
            Go to my portal →
          </a>

          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-left">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Bookmark this link to access your portal anytime:
            </p>
            <p className="text-xs font-mono break-all text-gray-700">
              {typeof window !== 'undefined'
                ? `${window.location.origin}${portalUrl}`
                : portalUrl}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
