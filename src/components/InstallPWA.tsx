'use client';

// Mounts the service worker registration + shows a friendly "Save to home
// screen" prompt the first time the browser fires `beforeinstallprompt`.
// Dismissals are remembered in localStorage so we don't nag.

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'tss_pwa_install_dismissed';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPWA() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!show || !deferred) return null;

  const install = async () => {
    setShow(false);
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, '1');
    }
    setDeferred(null);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-[var(--tss-navy)] text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3 flex items-center gap-3">
      <Download size={20} className="text-[var(--tss-cyan)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Install The Surf Sequence</p>
        <p className="text-[11px] text-white/60 leading-tight mt-0.5">Save to your home screen for fullscreen access.</p>
      </div>
      <button
        onClick={install}
        className="px-3 py-1.5 bg-[var(--tss-cyan)] text-[var(--tss-navy)] rounded-lg text-xs font-semibold"
      >
        Install
      </button>
      <button onClick={dismiss} className="p-1 text-white/40 hover:text-white/80" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}
