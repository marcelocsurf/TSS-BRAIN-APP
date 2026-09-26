'use client';

// Puerta de Términos + Privacidad: se muestra una vez (y otra vez cuando cambia
// la versión). Bloquea el portal hasta aceptar; el resto sigue montado atrás.
import { useState } from 'react';
import { acceptTerms } from '@/lib/actions/legal';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal/versions';

const INK = '#061C2B', CYAN = '#00D2FF', PAPER = '#F7F9FA';

export function TermsGate({ token, firstName, isUpdate, minor = false, needsGuardian = false, needsHealth = false }: {
  token: string; firstName: string; isUpdate: boolean;
  /** Menor de 18 según la ficha: el tutor acepta por él/ella. */
  minor?: boolean;
  /** Menor sin tutor registrado: se pide el nombre del tutor. */
  needsGuardian?: boolean;
  /** Ficha con datos de salud sin consentimiento expreso (auditoría 2026-09-25). */
  needsHealth?: boolean;
}) {
  const [ok, setOk] = useState(false);
  const [health, setHealth] = useState(false);
  const [guardian, setGuardian] = useState('');
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
        {minor && (
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(0,210,255,.08)', border: `1px solid ${CYAN}55` }}>
            <p className="text-[13px] leading-snug m-0">{firstName} is under 18: a <b>parent or legal guardian</b> accepts on their behalf.</p>
            {needsGuardian && (
              <input value={guardian} onChange={(e) => setGuardian(e.target.value)} placeholder="Parent / guardian full name" maxLength={120}
                className="w-full h-11 rounded-lg px-3 text-[14px]" style={{ background: PAPER, color: INK, border: '1px solid #DCD7C6' }} />
            )}
          </div>
        )}
        {needsHealth && (
          <label className="flex items-start gap-2.5 text-[13px] cursor-pointer">
            <input type="checkbox" checked={health} onChange={(e) => setHealth(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span>I consent to The Surf Sequence storing {minor ? `${firstName}'s` : 'my'} health and safety information (emergency contact, allergies, injuries, medical notes) so the coaches can teach {minor ? 'them' : 'me'} safely. Only the staff who coach {minor ? 'them' : 'me'} can see it.</span>
          </label>
        )}
        <label className="flex items-start gap-2.5 text-[13px] cursor-pointer">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 h-4 w-4" />
          <span>I have read and accept the Terms of Service and the Privacy Policy{minor ? ` on behalf of ${firstName}` : ''}.</span>
        </label>
        {err && <p className="text-[12px]" style={{ color: '#FF8A8F' }}>{err}</p>}
        <button type="button" disabled={!ok || busy || (needsHealth && !health) || (needsGuardian && guardian.trim().length < 3)}
          onClick={async () => {
            setBusy(true); setErr('');
            const r = await acceptTerms(token, { guardianName: needsGuardian ? guardian : null, healthConsent: needsHealth ? health : undefined });
            if (!r.ok) { setErr(r.error || 'Could not save.'); setBusy(false); return; }
            // Cerrar la puerta acá mismo: volver a renderizar el portal entero
            // (20 lecturas) solo para que desaparezca era lo que hacía sentir
            // lento el "Accept". La aceptación ya quedó guardada.
            setDone(true);
          }}
          className="w-full h-12 rounded-xl text-[12px] font-bold uppercase tracking-[0.14em] disabled:opacity-40"
          style={{ background: CYAN, color: INK }}>
          {busy ? 'Saving…' : 'Accept and continue'}
        </button>
      </div>
    </div>
  );
}
