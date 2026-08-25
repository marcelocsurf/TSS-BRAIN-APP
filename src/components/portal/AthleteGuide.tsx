'use client';

// ═══ GUÍA DEL PORTAL DEL ALUMNO / ATLETA ═══
// Manual integrado: se abre solo la primera vez y queda en el botón 📖 del
// encabezado. Student-facing → ENGLISH, dark Brand v10 (el portal es oscuro,
// a diferencia de las guías claras del staff).

const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

function Sec({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)' }}>
      <p className="font-bold text-[14px]" style={{ color: '#f0f7fa' }}>{icon} {title}</p>
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
            <h1 style={{ ...F_D, color: '#f0f7fa' }} className="text-[22px] mt-1">📖 Quick guide</h1>
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
          Come back to this guide anytime with the <strong style={{ color: '#dce8f0' }}>📖</strong> button at the top.
        </p>

        <Sec icon="🏠" title="Home — your dashboard">
          <Li k="Hours ring">Every minute you spend in the water — sessions with your coach and sessions you log yourself. Watch it grow.</Li>
          <Li k="Level progress">Your current level of 6 and the next one you&apos;re chasing. Your coach promotes you when you&apos;re ready.</Li>
          <Li k="Training / Free Surf">How your water time splits between guided training and free surfing.</Li>
        </Sec>

        <Sec icon="📚" title="Course">
          <p>Your level&apos;s lessons: technique, ocean knowledge and mindset. Short reads — do one whenever you have 5 minutes.</p>
        </Sec>

        <Sec icon="🏄" title="Let's Play — train &amp; log your sessions">
          <Li k="My Sequence">The exact skills you&apos;re working on, straight from your coach&apos;s evaluations. Tap a drill to practice it.</Li>
          <Li k="Log it">Surfed on your own? Trained at home? Log it here — it counts toward your hours and your coach sees it. The more honest the log, the better your coaching gets.</Li>
        </Sec>

        {/* Solo para quien tiene el ACCESO de alto rendimiento. Prometerle "tu
            año", "tu programa" y "tu equipo" a un alumno que nunca los va a
            ver es peor que no decir nada: le enseña que le falta algo. */}
        {hpAccess && (
        <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,209,102,.08)', border: '1px solid rgba(255,209,102,.4)' }}>
          <p className="text-[9px] mb-1" style={{ ...F_M, color: GOLD }}>For athletes on a training program</p>
          <div className="space-y-1.5 text-[12.5px] leading-relaxed" style={{ color: '#b8cad8' }}>
            <Li k="🗓 My year">Your whole season on one strip: training phases in color, peaks ▲, competitions 🏆 and trips ✈️ — with <strong style={{ color: '#eaf4fa' }}>YOU</strong> marking where you are today.</Li>
            <Li k="Your program">Three views: <strong style={{ color: '#eaf4fa' }}>TODAY</strong> (what to do right now), <strong style={{ color: '#eaf4fa' }}>WEEK</strong> (your full week) and <strong style={{ color: '#eaf4fa' }}>SEASON</strong> (the whole road to your competitions).</Li>
            <Li k="Daily check-in">Takes 30 seconds: water, sleep, energy, whether you <strong style={{ color: '#eaf4fa' }}>ate clean</strong>, <strong style={{ color: '#eaf4fa' }}>hours surfed</strong>, whether you hit today&apos;s goal, and your focus. It feeds your <strong style={{ color: '#eaf4fa' }}>weekly ranking</strong> — consistency wins.</Li>
            <Li k="💬 My Team">One thread shared with your whole team — coach, psychologist, physical trainer, nutritionist. Everyone reads it. Use it.</Li>
            <Li k="🥗 & 📌 From your team">Your nutrition plan and any tasks or video sessions your team leaves for you show up right on your Home. Mark them <strong style={{ color: '#eaf4fa' }}>Done ✓</strong>.</Li>
            <Li k="🪪 Your athlete profile">Fill it once, keep it at 100% — passport, insurance, emergency contact. It&apos;s what travels with you to every competition.</Li>
          </div>
        </div>
        )}

        <Sec icon="💬" title="Feedback & My Coach">
          <p>After your sessions, tell us how it went — your coach reads every word. And in <strong style={{ color: '#eaf4fa' }}>My Coach</strong> you can see who&apos;s guiding you and their credentials.</p>
        </Sec>

        <Sec icon="📲" title="Install it on your phone">
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
