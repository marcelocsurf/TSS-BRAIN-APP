'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

// Guided breathing — box, 4-7-8, coherent, breath of fire. Pure client: a CSS
// scale animation + Web Audio tones (no audio files) + optional haptics.
// Nothing loads over the network, nothing is saved.

type Phase = { label: string; sec: number; scale: number };
type Pattern = { id: string; name: string; desc: string; accent: string; phases: Phase[] };

const BIG = 1, SMALL = 0.42;

const PATTERNS: Pattern[] = [
  { id: 'box', name: 'Box breathing', desc: 'Foco y calma · 4·4·4·4', accent: '#5AC3E7', phases: [
    { label: 'Inhalá', sec: 4, scale: BIG }, { label: 'Sostené', sec: 4, scale: BIG },
    { label: 'Exhalá', sec: 4, scale: SMALL }, { label: 'Sostené', sec: 4, scale: SMALL },
  ] },
  { id: '478', name: '4 · 7 · 8', desc: 'Calmar · dormir', accent: '#A78BFA', phases: [
    { label: 'Inhalá', sec: 4, scale: BIG }, { label: 'Sostené', sec: 7, scale: BIG }, { label: 'Exhalá', sec: 8, scale: SMALL },
  ] },
  { id: 'coherent', name: 'Coherente', desc: 'Equilibrio · 5·5', accent: '#34D399', phases: [
    { label: 'Inhalá', sec: 5, scale: BIG }, { label: 'Exhalá', sec: 5, scale: SMALL },
  ] },
  { id: 'fire', name: 'Breath of Fire', desc: 'Energía · rápido', accent: '#F59E0B', phases: [
    { label: 'Inhalá', sec: 0.7, scale: BIG }, { label: 'Exhalá', sec: 0.7, scale: SMALL },
  ] },
];

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

export function BreathingGuide({ onClose }: { onClose: () => void }) {
  const [patternId, setPatternId] = useState('box');
  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scale, setScale] = useState(SMALL);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [muted, setMuted] = useState(false);
  const reduce = usePrefersReducedMotion();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  function tone(freq: number) {
    if (mutedRef.current) return;
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.14, t + 0.05);
      g.gain.linearRampToValueAtTime(0, t + 0.4);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.45);
    } catch { /* audio not available */ }
  }

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const phases = pattern.phases;

    function runPhase(i: number) {
      if (cancelled) return;
      const ph = phases[i];
      setPhaseIdx(i);
      setScale(ph.scale);
      tone(ph.label === 'Inhalá' ? 528 : ph.label === 'Exhalá' ? 396 : 440);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);

      if (countRef.current) clearInterval(countRef.current);
      if (ph.sec >= 1.5) {
        let left = Math.ceil(ph.sec);
        setCount(left);
        countRef.current = setInterval(() => { left -= 1; setCount(left > 0 ? left : 0); }, 1000);
      } else {
        setCount(0);
      }

      timeoutRef.current = setTimeout(() => {
        const next = (i + 1) % phases.length;
        if (next === 0) setCycles((c) => c + 1);
        runPhase(next);
      }, ph.sec * 1000);
    }

    setCycles(0);
    runPhase(0);
    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countRef.current) clearInterval(countRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternId]);

  function stop() {
    setRunning(false);
    setScale(SMALL);
    setPhaseIdx(0);
    setCount(0);
  }

  const phase = pattern.phases[phaseIdx];
  const label = running ? phase.label : 'Listo';
  const transitionSec = running ? phase.sec : 0.6;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0A1628', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/50">Respiración guiada</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setMuted((m) => !m)} className="p-2 rounded-lg text-white/60 hover:bg-white/10" aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button onClick={onClose} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white" aria-label="Cerrar"><X size={15} /> Cerrar</button>
        </div>
      </div>

      {/* Pattern chips */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setPatternId(p.id); if (running) { /* effect restarts */ } }}
            className="shrink-0 rounded-xl px-3 py-2 text-left border transition-colors"
            style={{
              borderColor: patternId === p.id ? p.accent : 'rgba(255,255,255,.12)',
              background: patternId === p.id ? p.accent + '22' : 'transparent',
            }}
          >
            <span className="block text-[13px] font-semibold" style={{ color: patternId === p.id ? '#fff' : 'rgba(255,255,255,.75)' }}>{p.name}</span>
            <span className="block text-[10px]" style={{ color: 'rgba(255,255,255,.4)' }}>{p.desc}</span>
          </button>
        ))}
      </div>

      {/* Circle */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          <div
            className="absolute rounded-full"
            style={{
              width: 240, height: 240,
              background: `radial-gradient(circle, ${pattern.accent}33, ${pattern.accent}11)`,
              border: `2px solid ${pattern.accent}`,
              transform: `scale(${reduce ? 0.85 : scale})`,
              transition: `transform ${reduce ? 0 : transitionSec}s ease-in-out`,
            }}
          />
          <div className="relative text-center">
            <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{label}</p>
            {count > 0 && <p className="text-4xl font-bold tabular-nums mt-1" style={{ color: pattern.accent, fontFamily: 'DM Mono, monospace' }}>{count}</p>}
          </div>
        </div>

        <p className="text-[11px] font-mono uppercase tracking-wider text-white/30">
          {running ? `${cycles} ciclo${cycles === 1 ? '' : 's'}` : 'Elegí un patrón y empezá'}
        </p>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8">
        {running ? (
          <button onClick={stop} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white bg-white/10 active:scale-[0.98] transition-transform">
            <Pause size={20} /> Pausar
          </button>
        ) : (
          <button onClick={() => setRunning(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold active:scale-[0.98] transition-transform" style={{ background: pattern.accent, color: '#0A1628' }}>
            <Play size={20} /> Empezar
          </button>
        )}
      </div>
    </div>
  );
}
