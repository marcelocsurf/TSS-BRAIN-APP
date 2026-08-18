'use client';

import { useState } from 'react';
import {
  QUESTIONS, LEVELS, MAX_SCORE,
  scoreFromAnswers, levelForScore, skillMap,
} from '@/lib/quiz/surf-level';
import { createLeadFromQuiz } from '@/lib/actions/quiz-lead';

// Brand Manual v10: cyan oficial + ink · Archivo Expanded display · Plex Mono
// labels · Lora itálica RESERVADA al tagline (regla 3.5).
const ACCENT = '#00D2FF';
const DEEP = '#061C2B';
const BODY = "var(--font-archivo), 'Archivo', system-ui, sans-serif";
const MONO = "var(--font-plex), 'IBM Plex Mono', monospace";
const DISPLAY: React.CSSProperties = { fontFamily: BODY, fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.06 };
const TAGLINE: React.CSSProperties = { fontFamily: "var(--font-lora), Lora, serif", fontStyle: 'italic' };

// Marca arriba de cada pantalla — la onda original + wordmark.
function BrandHeader({ big = false }: { big?: boolean }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: big ? 0 : 8, marginBottom: big ? 8 : 18 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/venue-scout/tss-wave.png?v=1" alt="The Surf Sequence" style={{ height: big ? 84 : 40, width: 'auto', filter: 'drop-shadow(0 0 22px rgba(0,210,255,.35))' }} />
      <div style={{ ...DISPLAY, fontSize: big ? '1.35rem' : '.8rem', color: '#F7F9FA', marginTop: big ? 12 : 6 }}>The Surf Sequence</div>
      {big && <div style={{ ...TAGLINE, fontSize: '.85rem', color: 'rgba(0,210,255,.7)', marginTop: 6 }}>Evolve through play</div>}
    </div>
  );
}

type Screen = 'intro' | 'prime' | 'gate' | 'quiz' | 'result';

const GATE = [
  { emoji: '🏖️', txt: "I've never surfed — or only tried once or twice on vacation" },
  { emoji: '🌊', txt: "I'm learning — I stand up sometimes but I'm still on the basics" },
  { emoji: '🏄', txt: 'I surf green waves — I ride the face and do some turns' },
  { emoji: '⚡', txt: 'I surf with power — maneuvers, hitting the lip, varied conditions' },
];

export function QuizClient({ academySlug }: { academySlug: string | null }) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [start, setStart] = useState(0);
  const [cur, setCur] = useState(0);

  // contact capture — nombre y apellido SEPARADOS y ambos obligatorios: el
  // campo único "Your name" partido por espacios dejaba last_name null cuando
  // escribían solo el nombre (los perfiles sin apellido que veía el mostrador).
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const score = scoreFromAnswers(answers);
  const level = levelForScore(score);
  const skills = skillMap(answers);

  const gateSelect = (g: number) => {
    const a = new Array(QUESTIONS.length).fill(-1);
    if (g === 0) { setAnswers(a); setScreen('result'); return; }       // never surfed → Beginner
    let s = 0;
    if (g === 2) { a[0] = 7; a[1] = 7; s = 2; }
    if (g === 3) { a[0] = 10; a[1] = 10; a[2] = 7; a[3] = 7; s = 4; }
    setAnswers(a); setStart(s); setCur(s); setScreen('quiz');
  };

  const pick = (i: number) => {
    const a = [...answers]; a[cur] = i; setAnswers(a);
    setTimeout(() => {
      if (cur >= QUESTIONS.length - 1) setScreen('result');
      else setCur(cur + 1);
    }, 250);
  };

  const submitLead = async () => {
    setErr('');
    if (!firstName.trim()) { setErr('Enter your first name.'); return; }
    if (!lastName.trim()) { setErr('Enter your last name.'); return; }
    if (!email.trim() && !phone.trim()) { setErr('Enter email or phone.'); return; }
    setSaving(true);
    const res = await createLeadFromQuiz({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      academy_slug: academySlug,
      belt: level.belt,
      score,
      skillmap: skills,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setErr(res.error || 'Could not save.');
  };

  return (
    <div style={{ minHeight: '100vh', background: DEEP, color: '#f0f7fa', fontFamily: BODY }}>
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {screen === 'intro' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BrandHeader big />
            <span style={chip}>⚡ 60-second assessment</span>
            <h1 style={{ ...DISPLAY, fontSize: '2.3rem', margin: '20px 0' }}>
              What&apos;s your <em style={{ color: ACCENT }}>real</em> surf level?
            </h1>
            <p style={{ color: '#c4d9e8', opacity: 0.8, lineHeight: 1.5, maxWidth: 380, margin: '0 auto 28px' }}>
              Most surfers think they&apos;re 1-2 levels above where they actually are. Knowing your real level is the fastest shortcut to improving. We use real scenarios, not self-rating.
            </p>
            <button style={btnPrimary} onClick={() => setScreen('prime')}>Find my level →</button>
          </div>
        )}

        {screen === 'prime' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BrandHeader />
            <div style={{ fontSize: '2.2rem' }}>🧠</div>
            <h2 style={{ ...DISPLAY, fontSize: '1.45rem', margin: '10px 0 10px' }}>
              Before we start — <em style={{ color: ACCENT }}>be honest</em>
            </h2>
            <p style={{ color: '#c4d9e8', opacity: 0.8, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 14px' }}>
              About <strong style={{ color: '#f0f7fa' }}>37% of surfers rate themselves 1-2 levels higher</strong> than they really are. It’s not ego — we remember our best waves, not our average ones.
            </p>
            <p style={{ color: '#c4d9e8', opacity: 0.8, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 14px' }}>
              Training above your real level builds gaps in your foundation that show up later as plateaus and bad habits. Owning where you are is the fastest way to progress.
            </p>
            <p style={{ color: ACCENT, fontWeight: 600, lineHeight: 1.5, maxWidth: 400, margin: '0 auto 24px' }}>
              This quiz uses real scenarios — just pick what honestly happens. No judgment, only clarity.
            </p>
            <button style={btnPrimary} onClick={() => setScreen('gate')}>I’ll be honest →</button>
          </div>
        )}

        {screen === 'gate' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BrandHeader />
            <div style={{ fontSize: '2.2rem' }}>🌊</div>
            <h2 style={{ ...DISPLAY, fontSize: '1.45rem', margin: '10px 0 6px' }}>
              Where are you in your journey?
            </h2>
            <p style={{ color: '#c4d9e8', opacity: 0.7, marginBottom: 20 }}>Pick the most honest one.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GATE.map((g, i) => (
                <button key={i} onClick={() => gateSelect(i)} style={gateOpt}>
                  <span style={{ fontSize: '1.3rem', marginRight: 12 }}>{g.emoji}</span>
                  <span style={{ fontSize: '.9rem', color: '#c4d9e8' }}>{g.txt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'quiz' && (() => {
          const q = QUESTIONS[cur];
          const total = QUESTIONS.length - start;
          const idx = cur - start;
          return (
            <div style={{ padding: '24px 0' }}>
              <BrandHeader />
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < idx ? ACCENT : i === idx ? 'rgba(90,195,231,.35)' : 'rgba(255,255,255,.08)' }} />
                ))}
              </div>
              <div style={{ fontFamily: MONO, fontSize: '.64rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.18em', color: ACCENT, opacity: 0.75, marginBottom: 8 }}>{q.phase} · {idx + 1}/{total}</div>
              <div style={scenario}><div style={{ fontFamily: BODY, fontWeight: 600, fontSize: '1.15rem', lineHeight: 1.4 }}>{q.scenario}</div></div>
              <p style={{ color: '#c4d9e8', opacity: 0.6, margin: '14px 0' }}>{q.prompt}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.opts.map((o, i) => (
                  <button key={i} onClick={() => pick(i)} style={{ ...opt, ...(answers[cur] === i ? optSel : {}) }}>
                    <span style={{ fontSize: '.88rem', color: '#c4d9e8', lineHeight: 1.35, textAlign: 'left' }}>{o.t}</span>
                  </button>
                ))}
              </div>
              {cur > start && (
                <button onClick={() => setCur(cur - 1)} style={{ ...btnGhost, marginTop: 14 }}>Back</button>
              )}
            </div>
          );
        })()}

        {screen === 'result' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BrandHeader />
            <div style={{ width: 110, height: 110, borderRadius: '50%', border: `3px solid ${level.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: level.color }}>{score}</span>
              <span style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.4 }}>/ {MAX_SCORE}</span>
            </div>
            <div style={{ ...DISPLAY, fontSize: '1.8rem', color: level.color }}>{level.name}</div>
            <p style={{ color: '#c4d9e8', opacity: 0.65, fontSize: '.85rem', marginTop: 4 }}>Your entry level (your coach confirms it)</p>

            {/* skill map */}
            <div style={{ maxWidth: 400, margin: '20px auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {skills.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 85, textAlign: 'right', fontSize: '.73rem', color: '#c4d9e8', opacity: 0.55 }}>{s.name}</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: level.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* contact capture → creates the lead */}
            {!saved ? (
              <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
                <p style={{ fontSize: '.85rem', color: '#c4d9e8', opacity: 0.8, marginBottom: 10, textAlign: 'center' }}>
                  Leave your details and we&apos;ll build your path from <strong style={{ color: level.color }}>{level.name}</strong>.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name *" style={{ ...inp, flex: 1 }} />
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name *" style={{ ...inp, flex: 1 }} />
                </div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inp} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" style={inp} />
                {err && <p style={{ color: '#ff6b6b', fontSize: '.8rem', margin: '6px 0' }}>{err}</p>}
                <button onClick={submitLead} disabled={saving} style={{ ...btnPrimary, width: '100%', marginTop: 6 }}>
                  {saving ? 'Saving…' : 'Build my path →'}
                </button>
              </div>
            ) : (
              <div style={{ maxWidth: 400, margin: '0 auto' }}>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: ACCENT }}>Done! 🤙</p>
                <p style={{ fontSize: '.85rem', color: '#c4d9e8', opacity: 0.8, marginTop: 6 }}>
                  We&apos;ll reach out to start your path from {level.name}.
                </p>
              </div>
            )}

            <p style={{ fontFamily: MONO, textTransform: 'uppercase', letterSpacing: '.16em', fontSize: '.58rem', color: '#c4d9e8', opacity: 0.35, marginTop: 24 }}>The Surf Sequence® · Official Method</p>
          </div>
        )}
      </div>
    </div>
  );
}

const chip: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,210,255,.1)', border: '1.5px solid rgba(0,210,255,.3)', borderRadius: 999, padding: '7px 16px', fontSize: '.68rem', fontWeight: 500, color: ACCENT, letterSpacing: '.16em', textTransform: 'uppercase', fontFamily: MONO };
const btnPrimary: React.CSSProperties = { background: ACCENT, color: DEEP, border: 'none', borderRadius: 999, padding: '16px 38px', fontSize: '.78rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: MONO };
const btnGhost: React.CSSProperties = { background: 'rgba(247,249,250,.04)', border: '1.5px solid rgba(247,249,250,.15)', color: '#c4d9e8', borderRadius: 999, padding: '12px 26px', fontSize: '.72rem', fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: MONO };
const gateOpt: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '16px 18px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.07)', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit' };
const scenario: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 20, borderLeft: `3px solid ${ACCENT}` };
const opt: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.07)', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit' };
const optSel: React.CSSProperties = { background: 'rgba(90,195,231,.12)', borderColor: 'rgba(90,195,231,.4)' };
const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', marginBottom: 8, borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)', color: '#f0f7fa', fontSize: '.9rem', fontFamily: 'inherit' };
