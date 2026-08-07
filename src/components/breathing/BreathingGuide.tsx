'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

// ═══ RESPIRACIÓN GUIADA — Brand Manual v10 ═══
// Ink + blueprint grid Fibonacci + numerales gigantes delineados en cyan +
// Archivo Expanded para las órdenes (INHALÁ / EXHALÁ) + mono para datos.
// Patrones clásicos (box, 4-7-8, coherente, fire) + MÉTODO WIM HOF completo:
// 30 respiraciones contadas → retención con cronómetro (tocás para terminar)
// → recuperación 15 s → 3 rondas. Todo client-side: Web Audio, sin archivos.

type Phase = { label: string; sec: number; scale: number };
type Pattern = { id: string; name: string; desc: string; phases: Phase[] };

const BIG = 1, SMALL = 0.42;
const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };
// Blueprint grid v10: líneas 1px cyan al 6% en celdas Fibonacci (34px).
const GRID: React.CSSProperties = {
  backgroundImage: `linear-gradient(rgba(0,210,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.06) 1px, transparent 1px)`,
  backgroundSize: '34px 34px',
};

const PATTERNS: Pattern[] = [
  { id: 'wimhof', name: 'Wim Hof', desc: '30 breaths · retention · 3 rounds', phases: [] },
  { id: 'box', name: 'Box', desc: 'Focus · 4·4·4·4', phases: [
    { label: 'Inhale', sec: 4, scale: BIG }, { label: 'Hold', sec: 4, scale: BIG },
    { label: 'Exhale', sec: 4, scale: SMALL }, { label: 'Hold', sec: 4, scale: SMALL },
  ] },
  { id: '478', name: '4 · 7 · 8', desc: 'Calm · sleep', phases: [
    { label: 'Inhale', sec: 4, scale: BIG }, { label: 'Hold', sec: 7, scale: BIG }, { label: 'Exhale', sec: 8, scale: SMALL },
  ] },
  { id: 'coherent', name: 'Coherent', desc: 'Balance · 5·5', phases: [
    { label: 'Inhale', sec: 5, scale: BIG }, { label: 'Exhale', sec: 5, scale: SMALL },
  ] },
  { id: 'fire', name: 'Fire', desc: 'Energy · fast', phases: [
    { label: 'Inhale', sec: 0.7, scale: BIG }, { label: 'Exhale', sec: 0.7, scale: SMALL },
  ] },
];

// Estado del modo Wim Hof
type WimMode = 'breaths' | 'retention' | 'recovery' | 'rest' | 'done';
const WIM_BREATHS = 30, WIM_ROUNDS = 3, WIM_IN = 1.5, WIM_OUT = 1.5, WIM_RECOVERY = 15;

function usePrefersReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const h = () => setR(m.matches);
    m.addEventListener?.('change', h);
    return () => m.removeEventListener?.('change', h);
  }, []);
  return r;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function BreathingGuide({ onClose }: { onClose: () => void }) {
  const [patternId, setPatternId] = useState('wimhof');
  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  const isWim = patternId === 'wimhof';
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scale, setScale] = useState(SMALL);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [muted, setMuted] = useState(false);
  // Wim Hof
  const [wimMode, setWimMode] = useState<WimMode>('breaths');
  const [wimRound, setWimRound] = useState(1);
  const [wimBreath, setWimBreath] = useState(0);
  const [wimIn, setWimIn] = useState(true);      // inhalando (true) / exhalando
  const [retSec, setRetSec] = useState(0);       // cronómetro de retención
  const [recSec, setRecSec] = useState(WIM_RECOVERY);
  const [retentions, setRetentions] = useState<number[]>([]);
  const reduce = usePrefersReducedMotion();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const energyRef = useRef(0.35);   // intensidad del campo de energía (0..1)
  const scaleRef = useRef(SMALL);
  const runningRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const wimModeRef = useRef<WimMode>('breaths');
  wimModeRef.current = wimMode;

  function ensureAudio() {
    if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioRef.current!;
    if (!noiseRef.current) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseRef.current = buf;
    }
    return ctx;
  }

  // Soplo suave: ruido filtrado que sube (inhala) o baja (exhala).
  function playBreath(kind: 'in' | 'out', durationSec: number) {
    if (mutedRef.current) return;
    try {
      const ctx = ensureAudio();
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = noiseRef.current!;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 0.7;
      const g = ctx.createGain();
      const peak = 0.05;
      const d = Math.max(0.4, durationSec);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + d * 0.45);
      g.gain.linearRampToValueAtTime(0.0001, t + d);
      if (kind === 'in') { filter.frequency.setValueAtTime(480, t); filter.frequency.linearRampToValueAtTime(1200, t + d); }
      else { filter.frequency.setValueAtTime(1200, t); filter.frequency.linearRampToValueAtTime(420, t + d); }
      src.connect(filter); filter.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + d + 0.05);
    } catch { /* sin audio */ }
  }

  // ═══ CAMPO DE ENERGÍA (referencia: video del espiral en neón) ═══
  // Filamentos cyan caleidoscópicos (8 espejos) que nacen del centro y
  // fluyen hacia afuera con glow. La intensidad respira con el usuario:
  // inhala → se expande y brilla; exhala → se contrae y calma.
  scaleRef.current = scale;
  runningRef.current = running;
  useEffect(() => {
    if (reduce) return; // respeto a prefers-reduced-motion: fondo estático
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
    };
    fit();
    window.addEventListener('resize', fit);

    const SEGMENTS = 8;
    type P = { r: number; a: number; v: number; drift: number; life: number; max: number; w: number };
    const parts: P[] = [];
    const spawn = (): P => ({
      r: 21 + Math.random() * 34,
      a: Math.random() * (Math.PI * 2 / SEGMENTS),
      v: 0.25 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.004,
      life: 0,
      max: 240 + Math.random() * 240,
      w: 0.6 + Math.random() * 1.1,
    });
    for (let i = 0; i < 26; i++) { const p = spawn(); p.life = Math.random() * p.max; parts.push(p); }

    const tick = () => {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H * 0.42; // centro donde viven los anillos
      // energía objetivo: corre → sigue la respiración; idle → latido suave
      const target = runningRef.current ? (scaleRef.current === BIG ? 1 : 0.45) : 0.3;
      energyRef.current += (target - energyRef.current) * 0.03;
      const E = energyRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of parts) {
        p.life += 1;
        p.r += p.v * (0.6 + E * 1.8);
        p.a += p.drift;
        const maxR = Math.min(W, H) * (0.38 + E * 0.28);
        if (p.life > p.max || p.r > maxR) Object.assign(p, spawn());
        const fade = Math.sin(Math.min(1, p.life / p.max) * Math.PI); // entra y sale suave
        const alpha = fade * (0.10 + E * 0.4);
        const tail = p.r * (0.12 + E * 0.1);
        for (let s = 0; s < SEGMENTS; s++) {
          ctx.save();
          ctx.rotate((Math.PI * 2 / SEGMENTS) * s + (s % 2 ? -p.a : p.a));
          ctx.beginPath();
          ctx.moveTo(p.r - tail, 0);
          ctx.lineTo(p.r, 0);
          ctx.strokeStyle = `rgba(0,210,255,${alpha})`;
          ctx.lineWidth = p.w * DPR;
          ctx.shadowColor = 'rgba(0,210,255,0.9)';
          ctx.shadowBlur = 8 * DPR * (0.5 + E);
          ctx.stroke();
          // nodo brillante en la punta
          ctx.beginPath();
          ctx.arc(p.r, 0, p.w * DPR * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,240,255,${alpha * 1.4})`;
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit); };
  }, [reduce]);

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countRef.current) clearInterval(countRef.current);
    if (retRef.current) clearInterval(retRef.current);
  };

  // ── Motor de patrones clásicos ──────────────────────────────
  useEffect(() => {
    if (!running || isWim) return;
    let cancelled = false;
    const phases = pattern.phases;

    function runPhase(i: number) {
      if (cancelled) return;
      const ph = phases[i];
      setPhaseIdx(i);
      setScale(ph.scale);
      if (ph.label === 'Inhale') playBreath('in', ph.sec);
      else if (ph.label === 'Exhale') playBreath('out', ph.sec);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);

      if (countRef.current) clearInterval(countRef.current);
      if (ph.sec >= 1.5) {
        let left = Math.ceil(ph.sec);
        setCount(left);
        countRef.current = setInterval(() => { left -= 1; setCount(left > 0 ? left : 0); }, 1000);
      } else setCount(0);

      timeoutRef.current = setTimeout(() => {
        const next = (i + 1) % phases.length;
        if (next === 0) setCycles((c) => c + 1);
        runPhase(next);
      }, ph.sec * 1000);
    }

    setCycles(0);
    runPhase(0);
    return () => { cancelled = true; clearTimers(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternId]);

  // ── Motor WIM HOF ───────────────────────────────────────────
  useEffect(() => {
    if (!running || !isWim) return;
    let cancelled = false;

    function breathe(round: number, n: number) {
      if (cancelled) return;
      if (n > WIM_BREATHS) { startRetention(round); return; }
      setWimMode('breaths'); setWimRound(round); setWimBreath(n);
      // inhala
      setWimIn(true); setScale(BIG); playBreath('in', WIM_IN);
      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        // exhala
        setWimIn(false); setScale(SMALL); playBreath('out', WIM_OUT);
        timeoutRef.current = setTimeout(() => breathe(round, n + 1), WIM_OUT * 1000);
      }, WIM_IN * 1000);
    }

    function startRetention(round: number) {
      if (cancelled) return;
      setWimMode('retention'); setScale(SMALL); setRetSec(0);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 60, 40]);
      let s = 0;
      retRef.current = setInterval(() => {
        s += 1; setRetSec(s);
        if (s >= 210) endRetention(round); // tope de seguridad 3:30
      }, 1000);
    }

    function endRetention(round: number) {
      if (cancelled || wimModeRef.current !== 'retention') return;
      if (retRef.current) clearInterval(retRef.current);
      setRetentions((r) => [...r, retSecRef.current]);
      // recuperación: inhalá hondo y sostené 15 s
      setWimMode('recovery'); setScale(BIG); playBreath('in', 2);
      let left = WIM_RECOVERY;
      setRecSec(left);
      retRef.current = setInterval(() => {
        left -= 1; setRecSec(left);
        if (left <= 0) {
          if (retRef.current) clearInterval(retRef.current);
          if (round >= WIM_ROUNDS) { setWimMode('done'); setRunning(false); setScale(SMALL); }
          else {
            setWimMode('rest'); setScale(SMALL);
            timeoutRef.current = setTimeout(() => breathe(round + 1, 1), 3000);
          }
        }
      }, 1000);
    }

    // handler para "tocá para terminar la retención"
    endRetentionRef.current = () => {
      const r = wimRoundRef.current;
      endRetention(r);
    };

    setRetentions([]);
    breathe(1, 1);
    return () => { cancelled = true; clearTimers(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternId]);

  // refs para el tap de retención
  const retSecRef = useRef(0); retSecRef.current = retSec;
  const wimRoundRef = useRef(1); wimRoundRef.current = wimRound;
  const endRetentionRef = useRef<() => void>(() => {});

  function stop() {
    setRunning(false);
    setScale(SMALL);
    setPhaseIdx(0);
    setCount(0);
    setWimMode('breaths');
    setWimBreath(0);
    clearTimers();
  }

  const phase = pattern.phases[phaseIdx];
  const transitionSec = running ? (isWim ? (wimIn ? WIM_IN : WIM_OUT) : phase?.sec ?? 0.6) : 0.6;

  // Qué mostrar en el centro
  let word = 'Ready', numeral: string | null = null, sub: string | null = null;
  if (running && isWim) {
    if (wimMode === 'breaths') { word = wimIn ? 'Inhale' : 'Exhale'; numeral = String(wimBreath); sub = `Round ${wimRound} of ${WIM_ROUNDS}`; }
    else if (wimMode === 'retention') { word = 'Hold'; numeral = mmss(retSec); sub = 'Empty lungs · tap the circle to finish'; }
    else if (wimMode === 'recovery') { word = 'Hold'; numeral = String(recSec); sub = 'Deep breath in — hold 15 s'; }
    else if (wimMode === 'rest') { word = 'Release'; numeral = null; sub = `Round ${wimRound + 1} starts now…`; }
  } else if (!running && isWim && wimMode === 'done') {
    word = 'Complete'; numeral = null;
    sub = retentions.length ? `Retentions: ${retentions.map(mmss).join(' · ')}` : null;
  } else if (running && !isWim) {
    word = phase.label; numeral = count > 0 ? String(count) : null;
    sub = `${cycles} cycle${cycles === 1 ? '' : 's'}`;
  } else {
    sub = 'Pick a pattern and start';
  }

  const tapRetention = () => { if (running && isWim && wimMode === 'retention') endRetentionRef.current(); };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: INK, ...GRID, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Campo de energía caleidoscópico (canvas, detrás de todo) */}
      {!reduce && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />}
      {/* Barra superior — riel v10 */}
      <div className="flex items-center justify-between px-[21px] pt-[13px] pb-[8px]" style={{ borderBottom: '1px solid rgba(247,249,250,0.16)' }}>
        <div className="flex items-center gap-[13px] min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tss-logo-white-h.png" alt="The Surf Sequence" className="h-[21px] w-auto shrink-0" />
          <p className="text-[9px] truncate" style={{ ...F_M, color: CYAN }}>Breathwork</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <button onClick={() => setMuted((m) => !m)} className="p-2 text-white/60 hover:text-white" aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button onClick={onClose} className="inline-flex items-center gap-1 px-[13px] py-[5px] text-[9px]" style={{ ...F_M, background: 'rgba(247,249,250,0.1)', color: PAPER }} aria-label="Close">
            <X size={13} /> Close
          </button>
        </div>
      </div>

      {/* Patrones — chips rectilíneos v10 */}
      <div className="flex gap-[8px] px-[21px] py-[13px] overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {PATTERNS.map((p) => {
          const on = patternId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => { stop(); setPatternId(p.id); }}
              className="shrink-0 px-[13px] py-[8px] text-left transition-colors"
              style={{ border: `1px solid ${on ? CYAN : 'rgba(247,249,250,0.16)'}`, background: on ? 'rgba(0,210,255,0.08)' : 'transparent' }}
            >
              <span className="block text-[12px]" style={{ ...F_D, fontWeight: 700, color: on ? CYAN : 'rgba(247,249,250,.8)' }}>{p.name}</span>
              <span className="block text-[8px] mt-[3px]" style={{ ...F_M, color: 'rgba(247,249,250,.4)' }}>{p.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Centro: anillos Fibonacci que respiran + numeral gigante delineado */}
      <button type="button" onClick={tapRetention} className="flex-1 flex flex-col items-center justify-center gap-[21px] outline-none" style={{ cursor: running && isWim && wimMode === 'retention' ? 'pointer' : 'default' }}>
        <div className="relative flex items-center justify-center" style={{ width: 288, height: 288 }}>
          {/* Anillos concéntricos 89 · 144 · 233 (escala Fibonacci) */}
          {[233, 144, 89].map((d, i) => (
            <div key={d} className="absolute rounded-full" style={{
              width: d, height: d,
              border: `1px solid rgba(0,210,255,${(0.16 + i * 0.14) * (numeral !== null ? 0.35 : 1)})`,
              transform: `scale(${reduce ? 0.9 : scale})`,
              transition: `transform ${reduce ? 0 : transitionSec}s ease-in-out`,
            }} />
          ))}
          {/* El espiral Fibonacci respirando al centro — glow neón cyan.
              Se atenúa cuando hay numeral encima. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/tss-mark-white.png" alt="" aria-hidden className="absolute select-none" style={{
            width: 89, height: 'auto', opacity: numeral !== null ? 0.14 : 0.95,
            transform: `scale(${reduce ? 0.9 : scale * 1.6})`,
            transition: `transform ${reduce ? 0 : transitionSec}s ease-in-out, opacity 0.4s`,
            filter: `drop-shadow(0 0 8px rgba(0,210,255,0.9)) drop-shadow(0 0 21px rgba(0,210,255,0.55))`,
          }} />
          {/* Numeral gigante delineado (como los numerales de capítulo v10) */}
          {numeral !== null && (
            <p className="relative select-none tabular-nums text-[89px] leading-none" style={{ ...F_D, color: PAPER }}>
              {numeral}
            </p>
          )}
        </div>

        <div className="text-center px-[21px]">
          <p className="text-[34px] leading-none" style={{ ...F_D, color: PAPER }}>{word}</p>
          {sub && <p className="text-[9px] mt-[13px]" style={{ ...F_M, color: 'rgba(247,249,250,.45)' }}>{sub}</p>}
        </div>
      </button>

      {/* CTA — píldora cyan v10 */}
      <div className="px-[21px] pb-[34px]">
        {running ? (
          <button onClick={stop} className="w-full inline-flex items-center justify-center gap-2 rounded-full py-[16px] text-[11px]" style={{ ...F_M, background: 'rgba(247,249,250,0.1)', color: PAPER, fontWeight: 700 }}>
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button onClick={() => { setWimMode('breaths'); setRunning(true); }} className="w-full inline-flex items-center justify-center gap-2 rounded-full py-[16px] text-[11px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 800 }}>
            <Play size={16} /> {isWim ? `Start · ${WIM_ROUNDS} rounds` : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
}
