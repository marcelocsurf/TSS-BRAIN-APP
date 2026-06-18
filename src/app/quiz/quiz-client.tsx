'use client';

import { useState } from 'react';
import {
  QUESTIONS, LEVELS, MAX_SCORE,
  scoreFromAnswers, levelForScore, skillMap,
} from '@/lib/quiz/surf-level';
import { createLeadFromQuiz } from '@/lib/actions/quiz-lead';

const ACCENT = '#00d4aa';
const DEEP = '#0a1628';

type Screen = 'intro' | 'gate' | 'quiz' | 'result';

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

  // contact capture
  const [name, setName] = useState('');
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
    if (!name.trim()) { setErr('Poné tu nombre.'); return; }
    if (!email.trim() && !phone.trim()) { setErr('Poné email o teléfono.'); return; }
    setSaving(true);
    const parts = name.trim().split(' ');
    const res = await createLeadFromQuiz({
      first_name: parts[0],
      last_name: parts.slice(1).join(' ') || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      academy_slug: academySlug,
      belt: level.belt,
      score,
      skillmap: skills,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setErr(res.error || 'No se pudo guardar.');
  };

  return (
    <div style={{ minHeight: '100vh', background: DEEP, color: '#f0f7fa', fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {screen === 'intro' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={chip}>⚡ 60-second assessment</span>
            <h1 style={{ fontFamily: 'Instrument Serif, Playfair Display, serif', fontSize: '2.6rem', lineHeight: 1.1, margin: '20px 0' }}>
              What&apos;s your <em style={{ color: ACCENT }}>real</em> surf level?
            </h1>
            <p style={{ color: '#c4d9e8', opacity: 0.8, lineHeight: 1.5, maxWidth: 380, margin: '0 auto 28px' }}>
              Most surfers think they&apos;re 1-2 levels above where they actually are. Knowing your real level is the fastest shortcut to improving. We use real scenarios, not self-rating.
            </p>
            <button style={btnPrimary} onClick={() => setScreen('gate')}>Find my level →</button>
          </div>
        )}

        {screen === 'gate' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '2.2rem' }}>🌊</div>
            <h2 style={{ fontFamily: 'Instrument Serif, Playfair Display, serif', fontSize: '1.7rem', margin: '10px 0 6px' }}>
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
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < idx ? ACCENT : i === idx ? 'rgba(0,212,170,.35)' : 'rgba(255,255,255,.08)' }} />
                ))}
              </div>
              <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: ACCENT, opacity: 0.65, marginBottom: 8 }}>{q.phase} · {idx + 1}/{total}</div>
              <div style={scenario}><div style={{ fontFamily: 'Instrument Serif, Playfair Display, serif', fontSize: '1.3rem', lineHeight: 1.35 }}>{q.scenario}</div></div>
              <p style={{ color: '#c4d9e8', opacity: 0.6, margin: '14px 0' }}>{q.prompt}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.opts.map((o, i) => (
                  <button key={i} onClick={() => pick(i)} style={{ ...opt, ...(answers[cur] === i ? optSel : {}) }}>
                    <span style={{ fontSize: '.88rem', color: '#c4d9e8', lineHeight: 1.35, textAlign: 'left' }}>{o.t}</span>
                  </button>
                ))}
              </div>
              {cur > start && (
                <button onClick={() => setCur(cur - 1)} style={{ ...btnGhost, marginTop: 14 }}>Atrás</button>
              )}
            </div>
          );
        })()}

        {screen === 'result' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', border: `3px solid ${level.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: level.color }}>{score}</span>
              <span style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.4 }}>/ {MAX_SCORE}</span>
            </div>
            <div style={{ fontFamily: 'Instrument Serif, Playfair Display, serif', fontSize: '2rem', color: level.color }}>{level.name}</div>
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
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inp} />
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

            <p style={{ fontSize: '.65rem', color: '#c4d9e8', opacity: 0.25, marginTop: 24 }}>Based on The Surf Sequence™ methodology</p>
          </div>
        )}
      </div>
    </div>
  );
}

const chip: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,170,.12)', border: '1px solid rgba(0,212,170,.2)', borderRadius: 24, padding: '6px 16px', fontSize: '.72rem', fontWeight: 700, color: ACCENT, letterSpacing: '.8px', textTransform: 'uppercase' };
const btnPrimary: React.CSSProperties = { background: ACCENT, color: DEEP, border: 'none', borderRadius: 14, padding: '15px 36px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
const btnGhost: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#c4d9e8', borderRadius: 12, padding: '12px 24px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
const gateOpt: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '16px 18px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.07)', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit' };
const scenario: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 20, borderLeft: `3px solid ${ACCENT}` };
const opt: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.07)', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit' };
const optSel: React.CSSProperties = { background: 'rgba(0,212,170,.12)', borderColor: 'rgba(0,212,170,.4)' };
const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', marginBottom: 8, borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)', color: '#f0f7fa', fontSize: '.9rem', fontFamily: 'inherit' };
