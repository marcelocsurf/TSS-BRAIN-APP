'use client';

// ═══ GUÍA DEL PORTAL DEL ALUMNO / ATLETA ═══
// Manual integrado: se abre solo la primera vez y queda en el botón 📖 del
// encabezado. Student-facing → ENGLISH, dark Brand v10 (el portal es oscuro,
// a diferencia de las guías claras del staff). Íconos lucide — sin emojis
// genéricos de cara al alumno (regla de Marcelo, ago 2026).

import {
  Home,
  BookOpen,
  Waves,
  Megaphone,
  MessageCircle,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

function Sec({ Icon, title, children }: { Icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)' }}>
      <p className="font-bold text-[14px] flex items-center gap-2" style={{ color: '#f0f7fa' }}>
        <Icon size={15} style={{ color: CYAN }} className="shrink-0" /> {title}
      </p>
      <div className="mt-1.5 space-y-1.5 text-[12.5px] leading-relaxed" style={{ color: '#b8cad8' }}>{children}</div>
    </div>
  );
}

function Li({ k, children }: { k: string; children: React.ReactNode }) {
  return <p><strong style={{ color: '#eaf4fa' }}>{k}</strong> — {children}</p>;
}

export function AthleteGuide({ onClose, hpAccess = false }: { onClose: () => void; hpAccess?: boolean }) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: INK }}>
      <div className="px-4 pt-5 pb-4 sticky top-0 z-10" style={{ background: INK, borderBottom: '1px solid rgba(0,210,255,.25)' }}>
        <div className="flex items-start justify-between gap-2 max-w-md lg:max-w-3xl mx-auto">
          <div>
            <p style={{ ...F_M, color: CYAN }} className="text-[9px]">The Surf Sequence · How your portal works</p>
            <h1 style={{ ...F_D, color: '#f0f7fa' }} className="text-[22px] mt-1">Quick guide</h1>
          </div>
          <button type="button" onClick={onClose}
            className="shrink-0 rounded-full px-4 py-2 text-[10px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
            Got it ✓
          </button>
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-4 py-4 space-y-3">
        <p className="text-[12.5px] leading-relaxed" style={{ color: '#8aa0b2' }}>
          This is your surfing home base: your progress, your training and your coaches — all in one place.
          Come back to this guide anytime with the book button at the top.
        </p>

        <Sec Icon={Home} title="Home — what to do today">
          <Li k="The card on top">The one thing for today. In a camp it is your class with your coach: the day, the hour, the sequence you will work on, and what to study before. Between camps it is what your coach left you, or the sequence to train next. One button.</Li>
          <Li k="Your progress">One row: your belt, how many sequences are yours, your hours in the water. Tap it (or your belt) for the full picture — level, what your next belt takes, your sessions and your feedback.</Li>
          <Li k="Log free surf">Surfed on your own? Two seconds and it counts toward your hours.</Li>
          <Li k="Below">Your last class, a belt promotion, your camp result, your book. They come when they matter and leave on their own.</Li>
        </Sec>

        <Sec Icon={Megaphone} title="The Lineup — your community channel">
          <p>Live classes, seminars, videos and notes from Marcelo — all in one channel. Anything you haven&apos;t seen yet waits on your Home; open The Lineup and it clears itself.</p>
          <Li k="Coming up">Lives and seminars sit at the top with the date, the hour and a <strong style={{ color: '#eaf4fa' }}>Join the live</strong> button — which stays up for late paddlers too.</Li>
          <Li k="The archive">Everything ever published stays here. Missed a live? The recording lands in the same card.</Li>
          <Li k="The wave">One tap to let Marcelo know it landed. That&apos;s the whole reaction — this is a channel, not a social network.</Li>
        </Sec>

        <Sec Icon={BookOpen} title="Course">
          <p>Your level&apos;s lessons: technique, ocean knowledge and mindset. Short reads — do one whenever you have 5 minutes. Any presentations or books your coach shares with you (like <strong style={{ color: '#eaf4fa' }}>One Wave</strong>) live here too, in order.</p>
        </Sec>

        <Sec Icon={Waves} title="Let's Play — train &amp; log your sessions">
          <Li k="My Sequence">The exact skills you&apos;re working on, straight from your coach&apos;s evaluations. Tap a drill to practice it — and rate yourself honestly: your stars show you where you stand; only your coach can move the official ones.</Li>
          <Li k="Log it">Surfed on your own? Trained at home? Log it — it counts toward your hours and your coach sees it. During a camp you train with your coach; Let&apos;s Play is for the days in between.</Li>
        </Sec>

        {/* Solo para quien tiene el ACCESO de alto rendimiento. Prometerle "tu
            año", "tu programa" y "tu equipo" a un alumno que nunca los va a
            ver es peor que no decir nada: le enseña que le falta algo. */}
        {hpAccess && (
        <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,209,102,.08)', border: '1px solid rgba(255,209,102,.4)' }}>
          <p className="text-[9px] mb-1" style={{ ...F_M, color: GOLD }}>For athletes on a training program</p>
          <div className="space-y-1.5 text-[12.5px] leading-relaxed" style={{ color: '#b8cad8' }}>
            <Li k="My year">Your whole season on one strip: training phases in color, peaks, competitions and trips — with <strong style={{ color: '#eaf4fa' }}>YOU</strong> marking where you are today.</Li>
            <Li k="Your program">Three views: <strong style={{ color: '#eaf4fa' }}>TODAY</strong> (what to do right now), <strong style={{ color: '#eaf4fa' }}>WEEK</strong> (your full week) and <strong style={{ color: '#eaf4fa' }}>SEASON</strong> (the whole road to your competitions).</Li>
            <Li k="Daily check-in">Takes 30 seconds: water, sleep, energy, whether you <strong style={{ color: '#eaf4fa' }}>ate clean</strong>, <strong style={{ color: '#eaf4fa' }}>hours surfed</strong>, whether you hit today&apos;s goal, and your focus. It feeds your <strong style={{ color: '#eaf4fa' }}>weekly ranking</strong> — consistency wins.</Li>
            <Li k="My Team">One thread shared with your whole team — coach, psychologist, physical trainer, nutritionist. Everyone reads it. Use it.</Li>
            <Li k="From your team">Your nutrition plan and any tasks or video sessions your team leaves for you show up right on your Home. Mark them <strong style={{ color: '#eaf4fa' }}>Done ✓</strong>.</Li>
            <Li k="Your athlete profile">Fill it once, keep it at 100% — passport, insurance, emergency contact. It&apos;s what travels with you to every competition.</Li>
          </div>
        </div>
        )}

        <Sec Icon={MessageCircle} title="Feedback & My Coach">
          <p>After a class, rate your coach — it unlocks the coach&apos;s feedback on that session, and your coach reads every word. Your full session history lives in <strong style={{ color: '#eaf4fa' }}>Your progress → My Sessions</strong>. Messages from your coach land in the bell at the top.</p>
        </Sec>

        <Sec Icon={Smartphone} title="Install it on your phone">
          <p><strong style={{ color: '#eaf4fa' }}>iPhone:</strong> open this page in Safari → Share → <strong style={{ color: '#eaf4fa' }}>&quot;Add to Home Screen&quot;</strong>.</p>
          <p><strong style={{ color: '#eaf4fa' }}>Android:</strong> open it in Chrome → menu ⋮ → <strong style={{ color: '#eaf4fa' }}>&quot;Install app&quot;</strong>.</p>
          <p style={{ color: '#8aa0b2' }}>One tap and you&apos;re in — no passwords.</p>
        </Sec>

        <button type="button" onClick={onClose}
          className="w-full rounded-full py-3.5 text-[10px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
          Let&apos;s surf →
        </button>
      </div>
    </div>
  );
}
