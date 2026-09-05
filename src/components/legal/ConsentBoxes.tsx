'use client';

// Las tres casillas legales que acompañan a todo formulario que captura datos
// (intake, QR de clases). Un solo texto para todos los puntos de entrada:
//   1. Datos de salud — consentimiento EXPRESO, obligatorio (categoría sensible).
//   2. Términos + Privacidad — obligatorio, con links.
//   3. Imagen — OPCIONAL, opt-in (nunca pre-marcada), con alcance explícito.
// Inglés primero (regla de marca), español corto debajo.

import { PRIVACY_URL, TERMS_URL } from '@/lib/legal/versions';

export function ConsentBoxes({
  health, onHealth, terms, onTerms, media, onMedia, minor, forName,
}: {
  health: boolean; onHealth: (v: boolean) => void;
  terms: boolean; onTerms: (v: boolean) => void;
  media: boolean; onMedia: (v: boolean) => void;
  /** Quien firma es el adulto responsable de un menor. */
  minor?: boolean;
  /** Nombre del alumno cuando firma un tercero (menor). */
  forName?: string | null;
}) {
  const who = minor ? `${forName || 'the minor'}'s` : 'my';
  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#0090B0' }}>{label}</a>
  );
  const box = (checked: boolean, onChange: (v: boolean) => void, body: React.ReactNode, required: boolean) => (
    <label className="flex items-start gap-2.5 text-[12px] leading-snug cursor-pointer rounded-lg p-3" style={{ background: required ? 'rgba(6,28,43,.04)' : 'rgba(0,210,255,.07)', color: '#061C2B' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{body}</span>
    </label>
  );

  return (
    <div className="space-y-2">
      {box(health, onHealth, (
        <>
          I consent to The Surf Sequence storing {who} health and safety information (emergency contact, swimming ability, allergies, injuries, medical notes, height and weight) so the coaches can teach safely. Only staff who coach {minor ? 'them' : 'me'} can see it. *
          <span className="block text-[11px] text-gray-500 mt-0.5">Consiento que se guarden {minor ? 'sus' : 'mis'} datos de salud y seguridad para entrenar con seguridad. Solo el staff que {minor ? 'lo' : 'me'} entrena los ve.</span>
        </>
      ), true)}
      {box(terms, onTerms, (
        <>
          I have read and accept the {link(TERMS_URL, 'Terms of Service')} and the {link(PRIVACY_URL, 'Privacy Policy')}{minor ? ` on behalf of ${forName || 'the minor'}` : ''}. *
          <span className="block text-[11px] text-gray-500 mt-0.5">Acepto los Términos y la Política de privacidad.</span>
        </>
      ), true)}
      {box(media, onMedia, (
        <>
          Optional — I authorize photos and video of {who} surfing to be used inside the portal (video analysis, progress) and in The Surf Sequence educational and promotional content. I can withdraw this anytime by email.
          <span className="block text-[11px] text-gray-500 mt-0.5">Opcional — autorizo fotos y video de {minor ? 'su' : 'mi'} surf para el portal y para contenido educativo y promocional. Puedo retirarlo cuando quiera.</span>
        </>
      ), false)}
    </div>
  );
}
