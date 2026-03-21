'use client';

import { useState } from 'react';

interface Props {
  portalToken: string;
}

export function CopyIntakeLinkButton({ portalToken }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/intake/${portalToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`px-3 py-2 text-xs rounded-lg transition-colors ${
        copied
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      {copied ? 'Copied! \u2713' : 'Copy Intake Link'}
    </button>
  );
}
