'use client';

// ═══ Kit de la encuesta · manual v10.1 (Marcelo 2026-09-25) ═══
// "Que sea más legible, con el diseño v10.1, que no se vea hecho con IA."
// Una sola fuente para las tres superficies: la encuesta del portal, la
// pública /feedback/[token] y la de experiencia del camp. Ink · arena · cyan;
// Archivo para los títulos, Plex mono para las etiquetas; estrellas grandes
// que se tocan con el pulgar. Student-facing → inglés.

export const SV = {
  ink: '#061C2B',
  inkText: '#10263B',
  sand: '#E9E2D2',
  border: '#DCD7C6',
  cyan: '#00D2FF',
  cyanText: '#00A8CC',
  paper: '#F7F9FA',
  muted: '#55666E',
  starEmpty: '#8A9AA3',
} as const;

export const SV_ARCHIVO: React.CSSProperties = {
  fontFamily: 'var(--font-archivo), Archivo, sans-serif',
  fontStretch: '125%',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 1.06,
};

export const SV_PLEX: React.CSSProperties = {
  fontFamily: 'var(--font-plex), IBM Plex Mono, monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  fontSize: 11,
};

const STAR = 44; // lado del botón de estrella (pulgar)
const GAP = 6;

/** Cabecera de una sección: "1 · Method & coach" en Plex, el título en Archivo,
 *  y una línea de contexto (fecha · coach). Va sobre arena. */
export function SurveySectionHead({ kicker, title, sub, right }: {
  kicker: string;
  title: string;
  sub?: string | null;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3" style={{ background: SV.sand }}>
      <div className="min-w-0">
        <p className="m-0" style={{ ...SV_PLEX, color: SV.muted }}>{kicker}</p>
        <h3 className="m-0 mt-1 text-[22px]" style={{ ...SV_ARCHIVO, color: SV.inkText }}>{title}</h3>
        {sub && <p className="m-0 mt-1 text-[14px] leading-snug" style={{ color: SV.muted }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/** Una pregunta con cinco estrellas. La pregunta va grande (17px, ink); las
 *  estrellas elegidas se pintan ink con la estrella cyan; debajo, Poor /
 *  Excellent alineados con la fila. */
export function StarScale({ label, value, onChange, low = 'Poor', high = 'Excellent', na }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  low?: string;
  high?: string;
  /** Opción N/A (transporte, equipo): estado y cómo alternarla. */
  na?: { on: boolean; toggle: () => void };
}) {
  const rowWidth = STAR * 5 + GAP * 4;
  return (
    <div>
      <p className="m-0 text-[17px] leading-snug" style={{ color: SV.inkText }}>{label}</p>
      <div className="mt-2.5 flex items-center" style={{ gap: GAP }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = !na?.on && value >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} of 5`}
              aria-pressed={on}
              onClick={() => onChange(n)}
              className="flex items-center justify-center rounded-[5px] leading-none transition-colors"
              style={{
                width: STAR, height: STAR, fontSize: 24,
                ...(on
                  ? { background: SV.ink, color: SV.cyan, border: `1px solid ${SV.ink}` }
                  : { background: SV.paper, color: SV.starEmpty, border: `1px solid ${SV.border}` }),
              }}
            >
              ★
            </button>
          );
        })}
        {na && (
          <button
            type="button"
            aria-pressed={na.on}
            onClick={na.toggle}
            className="ml-1 rounded-[5px] px-3 text-[12px] font-bold transition-colors"
            style={{ height: STAR, ...(na.on ? { background: SV.ink, color: SV.paper, border: `1px solid ${SV.ink}` } : { background: SV.paper, color: SV.muted, border: `1px solid ${SV.border}` }) }}
          >
            N/A
          </button>
        )}
      </div>
      <div className="flex justify-between mt-1.5" style={{ width: rowWidth, maxWidth: '100%' }}>
        <span style={{ ...SV_PLEX, fontSize: 10, color: SV.muted }}>{low}</span>
        <span style={{ ...SV_PLEX, fontSize: 10, color: SV.muted }}>{high}</span>
      </div>
    </div>
  );
}

/** Una fila de opciones con palabra (el canal de flow). Elegida = ink con
 *  letra cyan; el resto, papel con borde. */
export function ChoiceScale({ label, value, onChange, options, hint }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: { n: number; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <p className="m-0 text-[17px] leading-snug" style={{ color: SV.inkText }}>{label}</p>
      <div className="mt-2.5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => {
          const on = value === o.n;
          return (
            <button
              key={o.n}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.n)}
              className="rounded-[5px] px-1 text-[12.5px] font-bold transition-colors"
              style={{ height: STAR, ...(on ? { background: SV.ink, color: SV.cyan, border: `1px solid ${SV.ink}` } : { background: SV.paper, color: SV.muted, border: `1px solid ${SV.border}` }) }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="m-0 mt-1.5 text-[12.5px]" style={{ color: SV.muted }}>{hint}</p>}
    </div>
  );
}

/** 0–10 (recomendación). */
export function NpsScale({ label, value, onChange, low = 'Not likely', high = 'Absolutely' }: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  low?: string;
  high?: string;
}) {
  return (
    <div>
      <p className="m-0 text-[17px] leading-snug" style={{ color: SV.inkText }}>{label}</p>
      <div className="mt-2.5 grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => {
          const on = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} out of 10`}
              aria-pressed={on}
              onClick={() => onChange(n)}
              className="h-10 rounded-[5px] text-[13px] font-bold transition-colors"
              style={on ? { background: SV.ink, color: SV.cyan, border: `1px solid ${SV.ink}` } : { background: SV.paper, color: SV.muted, border: `1px solid ${SV.border}` }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span style={{ ...SV_PLEX, fontSize: 10, color: SV.muted }}>{low}</span>
        <span style={{ ...SV_PLEX, fontSize: 10, color: SV.muted }}>{high}</span>
      </div>
    </div>
  );
}

/** Texto libre opcional. */
export function SurveyField({ label, value, onChange, placeholder, maxLength = 500 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block mb-1.5" style={{ ...SV_PLEX, color: SV.muted }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-[5px] text-[15px] resize-none focus:outline-none focus:ring-2"
        style={{ background: '#fff', border: `1px solid ${SV.border}`, color: SV.inkText, ['--tw-ring-color' as any]: SV.cyan }}
      />
    </div>
  );
}

/** Separador con nombre dentro del formulario ("The method"). */
export function SurveyDivider({ label }: { label: string }) {
  return (
    <div className="pt-5" style={{ borderTop: `1px solid ${SV.border}` }}>
      <p className="m-0" style={{ ...SV_PLEX, color: SV.cyanText }}>{label}</p>
    </div>
  );
}

export function SurveyError({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 text-[14px] rounded-[5px] px-3 py-2.5" style={{ background: 'rgba(255,107,107,.14)', color: '#B42318' }}>
      {children}
    </p>
  );
}

/** El botón principal: cyan con letra ink en Archivo, como el resto del app. */
export function SurveySubmit({ loading, label, loadingLabel = 'Sending…' }: { loading: boolean; label: string; loadingLabel?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-[5px] text-[15px] disabled:opacity-50 transition-opacity hover:opacity-90"
      style={{ ...SV_ARCHIVO, letterSpacing: '0.02em', fontWeight: 800, background: SV.cyan, color: SV.ink }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

/** El gracias: una tarjeta de arena con el check ink/cyan y hasta tres líneas. */
export function SurveyDone({ title, lines, children }: { title: string; lines: React.ReactNode[]; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg px-5 py-6 text-center" style={{ background: SV.sand, border: `1px solid ${SV.border}` }}>
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full text-[22px] font-black" style={{ background: SV.ink, color: SV.cyan }}>✓</span>
      <h3 className="m-0 mt-3 text-[22px]" style={{ ...SV_ARCHIVO, color: SV.inkText }}>{title}</h3>
      <div className="mt-2 space-y-1.5">
        {lines.map((l, i) => <p key={i} className="m-0 text-[15px] leading-snug" style={{ color: SV.inkText }}>{l}</p>)}
      </div>
      {children}
    </div>
  );
}
