'use client';

// Puerta de Términos + Privacidad: se muestra una vez (y otra vez cuando cambia
// la versión). Bloquea el portal hasta aceptar; el resto sigue montado atrás.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptTerms } from '@/lib/actions/legal';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal/versions';

const INK = '#061C2B', CYAN = '#00D2FF', PAPER = '#F7F9FA';

export function TermsGate({ token, firstName, isUpdate }: { token: string; firstName: string; isUpdate: boolean }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  if (done) return null;

  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: CYAN }}>{label}</a>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" style={{ background: 'rgba(6,28,43,.72)' }} role="dialog" aria-modal="true" aria-labelledby="terms-gate-title">
      <div className="w-full max-w-md rounded-2xl p-5 space-y-4" style={{ background: INK, color: PAPER, border: `1px solid ${CYAN}55` }}>
        <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: CYAN }}>{isUpdate ? 'We updated our terms' : 'Before you start'}</p>
        <h2 id="terms-gate-title" className="text-[20px] font-extrabold leading-tight">
          {isUpdate ? `Quick one, ${firstName}.` : `Welcome, ${firstName}.`}
        </h2>
        <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(247,249,250,.8)' }}>
          Your portal keeps your progress, your safety info and what your coach writes about your surfing. Please read how we handle it: the {link(TERMS_URL, 'Terms of Service')} and the {link(PRIVACY_URL, 'Privacy Policy')}. You can ask us to correct or delete your data anytime.
        </p>
        <label className="flex items-start gap-2.5 text-[13px] cursor-pointer">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 h-4 w-4" />
          <span>I have read and accept the Terms of Service and the Privacy Policy.</span>
        </label>
        {err && <p className="text-[12px]" style={{ color: '#FF8A8F' }}>{err}</p>}
        <button type="button" disabled={!ok || busy}
          onClick={async () => {
            setBusy(true); setErr('');
            const r = await acceptTerms(token);
            if (!r.ok) { setErr(r.error || 'Could not save.'); setBusy(false); return; }
            setDone(true);
            router.refresh();
          }}
          className="w-full h-12 rounded-xl text-[12px] font-bold uppercase tracking-[0.14em] disabled:opacity-40"
          style={{ background: CYAN, color: INK }}>
          {busy ? 'Saving…' : 'Accept and continue'}
        </button>
      </div>
    </div>
  );
}
