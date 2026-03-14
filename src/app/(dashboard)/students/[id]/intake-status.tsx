'use client';

import { useState } from 'react';

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
    <div className={`rounded-xl border p-3 ${
      intakeCompletedAt
        ? 'bg-green-50 border-green-100'
        : 'bg-amber-50 border-amber-100'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0">
            {intakeCompletedAt ? '✓' : '⏳'}
          </span>
          <div className="min-w-0">
            <p className={`text-xs font-medium ${
              intakeCompletedAt ? 'text-green-700' : 'text-amber-700'
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
          className={`shrink-0 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy Intake Link'}
        </button>
      </div>
    </div>
  );
}
