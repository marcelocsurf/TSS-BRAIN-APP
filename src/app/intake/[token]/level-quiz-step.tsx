'use client';

import { useState } from 'react';
import {
  QUESTIONS, OCEAN_QUESTIONS, MAX_SCORE, scoreFromAnswers, levelForScore, skillMap, oceanLevelFromAnswers,
  type QuizLevel,
} from '@/lib/quiz/surf-level';
import { submitLevelQuiz } from '@/lib/actions/intake';

const GATE = [
  { txt: "I've never surfed — or only tried once or twice" },
  { txt: "I'm learning — I stand up sometimes but I'm still on the basics" },
  { txt: 'I surf green waves — I ride the face and do some turns' },
  { txt: 'I surf with power — maneuvers, hitting the lip, varied conditions' },
];

type Phase = 'gate' | 'tech' | 'ocean' | 'result';

interface ResultData {
  score: number;
  level: QuizLevel;
  skills: { name: string; pct: number }[];
}

export function LevelQuizStep({
  token,
  onComplete,
}: {
  token: string;
  onComplete: (beltLevel: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>('gate');
  const [tech, setTech] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [ocean, setOcean] = useState<number[]>(new Array(OCEAN_QUESTIONS.length).fill(-1));
  const [techStart, setTechStart] = useState(0);
  const [techCur, setTechCur] = useState(0);
  const [oceanCur, setOceanCur] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResultData | null>(null);

  const finish = async (techAns: number[], oceanAns: number[]) => {
    setSaving(true);
    setError('');
    const score = scoreFromAnswers(techAns);
    const lvl = levelForScore(score);
    const skills = skillMap(techAns);
    try {
      await submitLevelQuiz(token, {
        belt: lvl.belt,
        score,
        skillmap: skills,
        ocean_level: oceanLevelFromAnswers(oceanAns),
      });
      // Show the result before continuing to goals.
      setResult({ score, level: lvl, skills });
      setPhase('result');
      setSaving(false);
    } catch (e: any) {
      setError(e.message || 'Could not save.');
      setSaving(false);
    }
  };

  const gateSelect = (g: number) => {
    if (g === 0) {
      // Never surfed → Beginner. No more questions — we already know.
      const t = new Array(QUESTIONS.length).fill(-1);
      const o = new Array(OCEAN_QUESTIONS.length).fill(-1);
      setTech(t); setOcean(o);
      finish(t, o);
      return;
    }
    const t = new Array(QUESTIONS.length).fill(-1);
    let s = 0;
    if (g === 2) { t[0] = 7; t[1] = 7; s = 2; }
    if (g === 3) { t[0] = 10; t[1] = 10; t[2] = 7; t[3] = 7; s = 4; }
    setTech(t); setTechStart(s); setTechCur(s); setPhase('tech');
  };

  const pickTech = (i: number) => {
    const t = [...tech]; t[techCur] = i; setTech(t);
    setTimeout(() => {
      if (techCur >= QUESTIONS.length - 1) { setPhase('ocean'); setOceanCur(0); }
      else setTechCur(techCur + 1);
    }, 200);
  };

  const pickOcean = (i: number) => {
    const o = [...ocean]; o[oceanCur] = i; setOcean(o);
    setTimeout(() => {
      if (oceanCur >= OCEAN_QUESTIONS.length - 1) finish(tech, o);
      else setOceanCur(oceanCur + 1);
    }, 200);
  };

  const label = phase === 'gate' ? 'Your level' : phase === 'tech' ? 'Technical level' : phase === 'ocean' ? 'Ocean knowledge' : 'Your result';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">Step 1 · {label}</p>
        <h2 className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Let&apos;s find your real level
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Real scenarios, no self-rating. Your coach confirms it later.</p>
      </div>

      {phase === 'gate' && (
        <div className="space-y-2">
          {GATE.map((g, i) => (
            <button key={i} onClick={() => gateSelect(i)}
              className="w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:border-[var(--tss-cyan,#5AC3E7)] transition-colors">
              <span className="text-sm font-medium text-[var(--tss-navy)] leading-snug">{g.txt}</span>
            </button>
          ))}
        </div>
      )}

      {phase === 'tech' && (() => {
        const q = QUESTIONS[techCur];
        const total = QUESTIONS.length - techStart;
        const idx = techCur - techStart;
        return (
          <div className="space-y-3">
            <Progress total={total} idx={idx} />
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{q.phase} · {idx + 1}/{total}</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-base font-semibold text-[var(--tss-navy)] leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>{q.scenario}</div>
            <p className="text-sm font-medium text-gray-600">{q.prompt}</p>
            <div className="space-y-2">
              {q.opts.map((o, i) => (
                <button key={i} onClick={() => pickTech(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${tech[techCur] === i ? 'border-[var(--tss-cyan,#5AC3E7)] bg-cyan-50/40' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {o.t}
                </button>
              ))}
            </div>
            {techCur > techStart && (
              <button onClick={() => setTechCur(techCur - 1)} className="text-xs text-gray-500 hover:text-[var(--tss-navy)]">← Back</button>
            )}
          </div>
        );
      })()}

      {phase === 'ocean' && (() => {
        const q = OCEAN_QUESTIONS[oceanCur];
        return (
          <div className="space-y-3">
            <Progress total={OCEAN_QUESTIONS.length} idx={oceanCur} />
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{q.phase} · {oceanCur + 1}/{OCEAN_QUESTIONS.length}</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-base font-semibold text-[var(--tss-navy)] leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>{q.scenario}</div>
            <p className="text-sm font-medium text-gray-600">{q.prompt}</p>
            <div className="space-y-2">
              {q.opts.map((o, i) => (
                <button key={i} onClick={() => pickOcean(i)} disabled={saving}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors disabled:opacity-50 ${ocean[oceanCur] === i ? 'border-[var(--tss-cyan,#5AC3E7)] bg-cyan-50/40' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {o.t}
                </button>
              ))}
            </div>
            {saving && <p className="text-xs text-gray-400">Saving your level…</p>}
          </div>
        );
      })()}

      {phase === 'result' && result && (
        <div className="space-y-4">
          {/* Score ring */}
          <div className="flex flex-col items-center text-center pt-1">
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
              style={{ border: `4px solid ${result.level.color}` }}
            >
              <span className="text-3xl font-bold leading-none" style={{ color: result.level.color }}>
                {result.score}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">
                / {MAX_SCORE}
              </span>
            </div>
            <p
              className="mt-3 text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: result.level.color }}
            >
              {result.level.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Your provisional level — your coach confirms it.</p>
          </div>

          {/* Narrative card */}
          {result.level.m1 && (
            <div
              className="rounded-2xl bg-white border border-gray-100 p-4"
              style={{ borderLeft: `4px solid ${result.level.color}` }}
            >
              <p
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: result.level.color }}
              >
                {result.level.rt}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.level.m1}</p>
              {result.level.m2 && (
                <p className="text-sm text-gray-700 leading-relaxed mt-2">{result.level.m2}</p>
              )}
              {result.level.q && (
                <p
                  className="text-sm text-[var(--tss-navy)] italic mt-3 pt-3 border-t border-gray-100"
                  style={{ fontFamily: 'var(--font-tagline)' }}
                >
                  “{result.level.q}”
                </p>
              )}
            </div>
          )}

          {/* Skill map */}
          <div className="rounded-2xl bg-white border border-gray-100 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-3">
              Your skill map
            </p>
            <div className="space-y-2">
              {result.skills.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="w-20 text-right text-[11px] text-gray-500 shrink-0">{s.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.pct}%`, background: result.level.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onComplete(result.level.belt)}
            className="w-full py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: 'var(--tss-navy)' }}
          >
            Continue →
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Progress({ total, idx }: { total: number; idx: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`flex-1 h-1 rounded-full ${i < idx ? 'bg-[var(--tss-cyan,#5AC3E7)]' : i === idx ? 'bg-cyan-200' : 'bg-gray-100'}`} />
      ))}
    </div>
  );
}
