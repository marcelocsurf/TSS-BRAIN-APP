// ═══ Wave Guide · la ola del TSS_Wave_Kit con el recorrido de la secuencia ═══
// Una sola ola en todo el app (Marcelo 2026-10-01: "pone el nuevo y elimina
// ese viejo"): la ola fotorrealista del kit + sus capas (zonas, pocket,
// etiquetas). El recorrido: las capas del kit para las 6 Blue; para el resto,
// la misma fórmula del kit desde la config (src/lib/sequence-pages/wave-kit.ts).
// `waveDirection` es solo hacia dónde corre la ola; no cambia el nombre ni el
// contenido de la maniobra (stance y frontside/backside se resuelven afuera).
import type { WaveBoardData } from '@/lib/sequence-pages/types';
import { kitRouteSvg, legendItems, type WaveDirection } from '@/lib/sequence-pages/wave-kit';

/** Secuencias con capas de recorrido hechas por el TSS_Wave_Kit (2026-09-17).
 *  Las demás dibujan su recorrido con la fórmula del kit (wave-kit.ts). */
export const WAVE_KIT_SEQUENCE: Record<string, string> = {
  'BB-SEQ-08': 'frontside-pumping',
  'BB-SEQ-09': 'backside-pumping',
  'BB-SEQ-10': 'frontside-snap',
  'BB-SEQ-11': 'backside-snap',
  'BB-SEQ-12': 'frontside-cutback',
  'BB-SEQ-13': 'backside-cutback',
};

/** Capas del kit: todas comparten viewBox 2048×683; los archivos wave-left ya
 *  vienen espejados (no aplicar otro scaleX). El fondo PNG del kit (2172×724,
 *  misma proporción 3:1) va en WebP: 1024 px para teléfono, 2172 px arriba. */
function WaveKitLayers({ sequence, data, waveDirection, title }: { sequence?: string; data: WaveBoardData; waveDirection: WaveDirection; title: string }) {
  const base = '/tss/waves';
  // Con capas del kit: sus archivos. Sin: el recorrido generado, como imagen
  // (data URI) para que la flecha de cada ola no choque con otra en la página.
  const route = sequence
    ? [`${base}/layers/${sequence}-wave-${waveDirection}-hold.svg`, `${base}/layers/${sequence}-wave-${waveDirection}-route.svg`]
    : [`data:image/svg+xml;charset=utf-8,${encodeURIComponent(kitRouteSvg(data, waveDirection))}`];
  const layers = [
    `${base}/layers/zones-wave-${waveDirection}.svg`,
    ...route,
    `${base}/layers/pocket-wave-${waveDirection}.svg`,
    `${base}/layers/labels-wave-${waveDirection}.svg`,
  ];
  return (
    <div role="img" aria-label={title} className="relative w-full" style={{ aspectRatio: '2048 / 683', background: '#061C2B', isolation: 'isolate' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}/wave-clean-wave-${waveDirection}.webp`}
        srcSet={`${base}/wave-clean-wave-${waveDirection}-1024.webp 1024w, ${base}/wave-clean-wave-${waveDirection}.webp 2172w`}
        sizes="(max-width: 640px) 100vw, 720px"
        alt="" aria-hidden className="absolute inset-0 w-full h-full" />
      {layers.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={p} alt="" aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: i + 1 }} />
      ))}
    </div>
  );
}

export function WaveGuide({ data, title, waveDirection = 'right', legend = true, legendColor = '#10263B', kitSequence }: {
  data: WaveBoardData;
  title: string;
  waveDirection?: WaveDirection;
  /** Slug del TSS_Wave_Kit (ver WAVE_KIT_SEQUENCE): usa sus capas de recorrido; sin él, el recorrido sale de `data`. */
  kitSequence?: string;
  /** Leyenda en HTML debajo del dibujo (color del texto según el fondo de la tarjeta). */
  legend?: boolean;
  legendColor?: string;
}) {
  return (
    <figure className="m-0">
      {/* En teléfono la lámina tiene ancho mínimo y se desplaza a lo ancho
          para que zonas y etiquetas se lean (recomendación del kit). */}
      <div className="rounded-[5px] overflow-x-auto" style={{ background: '#061C2B' }}><div className="min-w-[640px] sm:min-w-0"><WaveKitLayers sequence={kitSequence} data={data} waveDirection={waveDirection} title={title} /></div></div>
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
