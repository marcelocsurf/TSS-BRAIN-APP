// ═══ Láminas de lección dibujadas en código (línea aprobada) ═══
// Una figura por lección, arriba del texto. Hoy: Paddling angle (STP-029) y
// las etapas de la ola (STP-033), la misma lámina. Se agregan de a una.
import { buildPaddlingAngleSvg, PADDLE_LEGEND } from '@/lib/sequence-pages/paddling-angle-svg';

const INK = '#10263B', MUTED = '#55666E', BORDER = '#DCD7C6';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' };

export function lessonHasFigure(lessonId: string | null | undefined): boolean {
  return lessonId === 'STP-029' || lessonId === 'STP-033';
}

export function LessonFigure({ lessonId }: { lessonId: string }) {
  if (!lessonHasFigure(lessonId)) return null;
  const svg = buildPaddlingAngleSvg({ waveDirection: 'left', title: 'Paddling angle · the 3 options on the wave stages' });
  return (
    <figure className="m-0 mb-4 rounded-lg overflow-hidden" style={{ background: '#E9E2D2', border: `1px solid ${BORDER}` }}>
      <div className="px-4 pt-3 pb-2">
        <p className="m-0" style={{ ...MONO, color: MUTED }}>{lessonId === 'STP-029' ? 'Paddling angle · the 3 options' : 'Wave stages 1–4 · where you paddle'}</p>
      </div>
      <div className="mx-3 rounded-[5px] overflow-hidden" style={{ background: '#061C2B', lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-semibold" style={{ color: INK }}>
        {PADDLE_LEGEND.map((it) => (
          <span key={it.key} className="inline-flex items-center gap-1.5">
            <i className="inline-block w-6 h-2 rounded-full shrink-0" style={{ background: it.color, boxShadow: it.color === '#FFFFFF' ? `0 0 0 1px ${BORDER}` : undefined }} />{it.label}
          </span>
        ))}
        <span className="basis-full text-[12.5px] font-normal" style={{ color: MUTED }}>Variable: does the pocket have a lip already, or is it just whitewater? The wave breaks to the right here; on a left it mirrors.</span>
      </figcaption>
    </figure>
  );
}
