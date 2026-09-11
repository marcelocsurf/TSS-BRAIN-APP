// ═══ La cara de la ola, desplegada ═══
// Lenguaje "Dibujar la Ola" (Marcelo, PDF 2026-09-09): cuatro franjas Z1
// (flat) → Z4 (labio), el pocket como anillo VIOLETA (Marcelo 2026-09-09: que
// no se confunda con postura ni con ningún otro comando), la línea de la secuencia
// por tramos con un color por comando, y los marcadores I · A · M/B · S.
// Código de colores de Marcelo: postura rojo · riel verde · projection
// amarillo · maniobra azul · cierre rosa · hold celeste como capa encima.
import type { WaveBoardData, Command } from '@/lib/sequence-pages/types';

export const COMMAND_COLORS: Record<Command, string> = {
  posture: '#FF3B3B',
  rail: '#22C55E',
  projection: '#FFD400',
  maneuver: '#2F6BFF',
  closure: '#FF5FA2',
};
export const HOLD_COLOR = '#7DE3FF';
/** Pocket: violeta de marca, fuera del lenguaje de los comandos. */
export const POCKET_COLOR = '#B388FF';
export const COMMAND_LABELS: Record<Command, string> = {
  posture: 'Posture',
  rail: 'Rotation / rail',
  projection: 'Projection',
  maneuver: 'Maneuver',
  closure: 'Closure',
};

/** `flip` = espejar: la ola va hacia la izquierda (goofy frontside / regular backside). */
export function WaveBoard({ data, title, flip = false }: { data: WaveBoardData; title: string; flip?: boolean }) {
  const zones = data.zoneLabels ?? ['Z4 · high · by the lip', 'Z3 · upper middle', 'Z2 · lower middle', 'Z1 · low · by the flat'];
  const used = Array.from(new Set(data.segments.map((s) => s.command)));
  const hasHold = data.segments.some((s) => s.hold);
  // Solo la geometría se espeja (línea, pocket, marcadores); los textos no.
  const geo = flip ? 'translate(720,0) scale(-1,1)' : undefined;
  const mx = (x: number) => (flip ? 720 - x : x);
  return (
    <div>
      <svg viewBox="0 0 720 300" role="img" aria-label={title} className="w-full h-auto block">
        <defs>
          <marker id="wb-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#F0F7FA" />
          </marker>
        </defs>
        <g fontFamily="var(--font-plex), IBM Plex Mono, Menlo, monospace" fontSize="12" fill="rgba(247,249,250,.72)">
          {zones.map((z, i) => (
            <g key={z}>
              <rect x="60" y={30 + i * 55} width="600" height="55" fill={i % 2 === 0 ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.04)'} />
              <text x="66" y={48 + i * 55}>{z}</text>
            </g>
          ))}
          <text x="60" y="22" fill="#F0F7FA">LIP · 100%</text>
          <text x="60" y="268" fill="#F0F7FA">FLAT · 0%</text>
          {flip ? <text x="60" y="284">← toward the shoulder</text> : <text x="590" y="268">→ toward the shoulder</text>}
        </g>
        <g transform={geo}>
          <circle cx={data.pocket.x} cy={data.pocket.y} r="20" fill={POCKET_COLOR} opacity=".18" />
          <circle cx={data.pocket.x} cy={data.pocket.y} r="14" fill="none" stroke={POCKET_COLOR} strokeWidth="3" />
          {/* HOLD: un arco celeste AL LADO de la línea (desplazado hacia abajo),
              como en el PDF "Dibujar la Ola" — encima de la línea se confundía
              con el comando (Marcelo 2026-09-10). */}
          {data.segments.filter((s) => s.hold).map((s, i) => (
            <path key={`h${i}`} d={s.d} transform="translate(0,16)" stroke={HOLD_COLOR} strokeWidth="5" fill="none" strokeLinecap="round" opacity=".95" />
          ))}
          {data.segments.map((s, i) => (
            <path key={i} d={s.d} stroke={COMMAND_COLORS[s.command]} strokeWidth="6" fill="none" strokeLinecap="round"
              markerEnd={i === data.segments.length - 1 ? 'url(#wb-arrow)' : undefined} />
          ))}
        </g>
        <text x={mx(data.pocket.x) + (flip ? -62 : 24)} y={data.pocket.y + 4} fontSize="11" fill={POCKET_COLOR} fontFamily="var(--font-plex), IBM Plex Mono, Menlo, monospace">POCKET</text>
        <g fontFamily="var(--font-plex), IBM Plex Mono, Menlo, monospace" fontSize="12" fontWeight="700" fill="#061C2B">
          {data.markers.map((m) => (
            <g key={m.label}>
              <circle cx={mx(m.x)} cy={m.y} r="10" fill="#F0F7FA" />
              <text x={mx(m.x) - (m.label.length > 1 ? 7 : 4)} y={m.y + 4}>{m.label}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px]" style={{ color: 'rgba(247,249,250,.72)' }}>
        {used.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5">
            <i className="inline-block w-5 h-1.5 rounded" style={{ background: COMMAND_COLORS[c] }} />{COMMAND_LABELS[c]}
          </span>
        ))}
        {hasHold && <span className="inline-flex items-center gap-1.5"><i className="inline-block w-5 h-1.5 rounded" style={{ background: HOLD_COLOR }} />Hold · the arc beside the line: this position is kept</span>}
        {flip && <span className="inline-flex items-center gap-1.5" style={{ color: 'rgba(247,249,250,.55)' }}>Drawn for your stance · the wave goes left</span>}
        <span className="inline-flex items-center gap-1.5"><i className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: POCKET_COLOR }} />Pocket · where the energy is</span>
        {/* Fases de la línea (PDF "Dibujar la Ola", Marcelo 2026-09-09): las
            letras del dibujo, explicadas — nadie debería adivinarlas. */}
        {data.markers.length > 0 && (
          <span className="inline-flex items-center gap-1.5" style={{ color: 'rgba(247,249,250,.7)', fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontSize: 11 }}>
            {data.markers.map((m) => m.label).filter((l, i, arr) => arr.indexOf(l) === i).map((l) => ({ I: 'I entry', A: 'A set-up', B: 'B connection', M: 'M action', S: 'S exit' } as Record<string, string>)[l] ?? l).join(' · ')}
          </span>
        )}
      </div>
    </div>
  );
}
