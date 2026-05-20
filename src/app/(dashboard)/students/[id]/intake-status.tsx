'use client';

import { useState } from 'react';
import { CheckCircle2, Hourglass, Check } from 'lucide-react';

interface Props {
  portalToken: string;
  intakeCompletedAt: string | null;
}

export function IntakeStatusCard({ portalToken, intakeCompletedAt }: Props) {
  const [copied, setCopied] = useState(false);

  const intakeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/intake/${portalToken}`
    : `/intake/${portalToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(intakeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = intakeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-2xl border p-3 ${
      intakeCompletedAt
        ? 'bg-emerald-50 border-emerald-100'
        : 'bg-amber-50 border-amber-100'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {intakeCompletedAt ? (
            <CheckCircle2 size={16} strokeWidth={2} className="text-emerald-700 shrink-0" />
          ) : (
            <Hourglass size={16} strokeWidth={1.75} className="text-amber-700 shrink-0" />
          )}
          <div className="min-w-0">
            <p className={`text-xs font-medium ${
              intakeCompletedAt ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {intakeCompletedAt
                ? `Profile completed ${new Date(intakeCompletedAt).toLocaleDateString()}`
                : 'Profile not completed yet'
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`shrink-0 px-3 py-1.5 text-xs rounded-lg font-medium transition-all inline-flex items-center gap-1 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          {copied ? (<><Check size={12} strokeWidth={2.5} /> Copied</>) : 'Copy Intake Link'}
        </button>
      </div>
    </div>
  );
}
