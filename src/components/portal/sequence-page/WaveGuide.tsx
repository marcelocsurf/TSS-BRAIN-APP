// ═══ Wave Guide · la ola ilustrada con el recorrido de la secuencia ═══
// Envoltorio React del SVG puro (src/lib/sequence-pages/wave-guide-svg.ts):
// misma fuente para el app y para los archivos exportados del paquete de diseño.
// `waveDirection` es solo hacia dónde corre la ola; no cambia el nombre ni el
// contenido de la maniobra (stance y frontside/backside se resuelven afuera).
import type { WaveBoardData } from '@/lib/sequence-pages/types';
import { buildWaveGuideSvg, legendItems, type WaveDirection } from '@/lib/sequence-pages/wave-guide-svg';

/** Poner la ruta cuando exista el PNG aprobado; null = ilustración en código. */
export const WAVE_FACE_IMAGE: string | null = null;

export function WaveGuide({ data, title, waveDirection = 'right', legend = true, legendColor = '#10263B' }: {
  data: WaveBoardData;
  title: string;
  waveDirection?: WaveDirection;
  /** Leyenda en HTML debajo del dibujo (color del texto según el fondo de la tarjeta). */
  legend?: boolean;
  legendColor?: string;
}) {
  // Ola pintada (cuando Marcelo la apruebe): public/tss/assets/wave-face-right.png. Hasta entonces, la ilustración en código.
  const svg = buildWaveGuideSvg(data, { waveDirection, title, faceImageHref: WAVE_FACE_IMAGE ?? undefined });
  return (
    <figure className="m-0">
      <div className="rounded-[5px] overflow-hidden" style={{ background: '#061C2B', lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />
      {legend && (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-[13px] font-semibold" style={{ color: legendColor }}>
          {legendItems(data).map((it) => (
            <span key={it.key} className="inline-flex items-center gap-1.5">
              {it.kind === 'ring'
                ? <i className="inline-block w-3 h-3 rounded-full shrink-0" style={{ border: `2.5px solid ${it.color}` }} />
                : <i className="inline-block w-6 h-2 rounded-full shrink-0" style={{ background: it.color }} />}
              {it.label}
            </span>
          ))}
          {waveDirection === 'left' && <span className="font-normal" style={{ opacity: .7 }}>Drawn for your stance · the wave goes left</span>}
        </figcaption>
      )}
    </figure>
  );
}
