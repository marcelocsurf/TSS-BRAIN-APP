'use client';

import { useEffect, useState } from 'react';
import { getFinalQuiz, getFinalQuizResult, submitFinalQuiz, type FinalQuizQuestion } from '@/lib/actions/course-final-quiz';
import { Brain, Trophy, Lock } from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function CourseFinalQuiz({ courseKey, studentId, label, locked = false }: { courseKey: string; studentId: string; label: string; locked?: boolean }) {
  const [questions, setQuestions] = useState<FinalQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; correct?: Record<string, number> } | null>(null);
  const [lastResult, setLastResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getFinalQuiz(courseKey), getFinalQuizResult(studentId, courseKey)]).then(([q, r]) => {
      setQuestions(q.questions);
      setLastResult(r as any);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [courseKey, studentId]);

  if (!loaded || questions.length === 0) return null;

  // Locked until the student finishes the belt's sequences + modules.
  if (locked && !result) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg,#0F1E33,#0A1628)', border: '1px solid rgba(255,255,255,.1)' }}>
        <Lock size={28} strokeWidth={1.75} className="mx-auto text-white/40" />
        <h3 className="text-lg font-bold text-white mt-2">{label} — Exit Test</h3>
        <p className="text-[13px] text-white/60 mt-1">{questions.length} key questions · 80% to pass</p>
        <p className="text-[12px] text-amber-300 mt-3">
          Complete all the {label} sequences and modules to unlock the exit test.
        </p>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const submit = async () => {
    setSubmitting(true);
    const res = await submitFinalQuiz(studentId, courseKey, answers);
    setResult(res);
    setLastResult({ score: res.score, total: res.total, passed: res.passed });
    setSubmitting(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Collapsed entry card (not started yet)
  if (!started) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg,#0F1E33,#0A1628)', border: '1px solid rgba(90,195,231,.2)' }}>
        <Brain size={30} strokeWidth={1.75} className="mx-auto text-[var(--tss-cyan)]" />
        <h3 className="text-lg font-bold text-white mt-2">{label} — Final Quiz</h3>
        <p className="text-[13px] text-white/60 mt-1">{questions.length} key questions · {Math.round(0.8 * 100)}% to pass</p>
        {lastResult && (
          <p className={`text-[12px] mt-2 ${lastResult.passed ? 'text-green-400' : 'text-amber-300'}`}>
            Last: {lastResult.score}/{lastResult.total} · {lastResult.passed ? 'Passed ✓' : 'Not passed yet'}
          </p>
        )}
        <button onClick={() => setStarted(true)} className="mt-4 w-full py-3 rounded-xl bg-[var(--tss-cyan)] text-[var(--tss-navy)] font-bold text-sm">
          {lastResult ? 'Retake quiz' : 'Start final quiz'}
        </button>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: '#0F1E33', border: '1px solid rgba(90,195,231,.2)' }}>
        <Trophy size={34} strokeWidth={1.5} className={`mx-auto ${result.passed ? 'text-[var(--tss-gold,#EAB308)]' : 'text-white/40'}`} />
        <h3 className="text-xl font-bold text-white mt-2">{result.passed ? 'Passed!' : 'Almost there'}</h3>
        <p className="text-2xl font-bold mt-1" style={{ color: result.passed ? '#EAB308' : '#fff' }}>
          {result.score}/{result.total}
        </p>
        <p className="text-[12px] text-white/50 mt-1">{Math.round((result.score / result.total) * 100)}% · need 80% to pass</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setResult(null); setAnswers({}); setStarted(false); }} className="flex-1 py-2.5 rounded-xl border border-white/15 text-white text-sm">Done</button>
          {!result.passed && (
            <button onClick={() => { setResult(null); setAnswers({}); }} className="flex-1 py-2.5 rounded-xl bg-[var(--tss-cyan)] text-[var(--tss-navy)] font-bold text-sm">Try again</button>
          )}
        </div>
      </div>
    );
  }

  // Quiz
  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: '#0F1E33', border: '1px solid rgba(90,195,231,.2)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">{label} — Final Quiz</h3>
        <span className="text-[11px] text-white/50">{Object.keys(answers).length}/{questions.length}</span>
      </div>
      {questions.map((q, qi) => (
        <div key={q.id} className="border-t border-white/10 pt-3">
          <p className="text-sm text-white mb-2"><span className="text-[var(--tss-cyan)] font-bold mr-1">{qi + 1}.</span>{q.question}</p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => {
              const sel = answers[q.id] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] border transition-colors flex items-start gap-2 ${
                    sel ? 'bg-[var(--tss-cyan)] text-[var(--tss-navy)] border-[var(--tss-cyan)] font-medium' : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="font-bold">{LETTERS[oi]}.</span> {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button
        onClick={submit}
        disabled={!allAnswered || submitting}
        className={`w-full py-3.5 rounded-xl text-sm font-bold ${allAnswered ? 'bg-[var(--tss-cyan)] text-[var(--tss-navy)]' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
      >
        {submitting ? 'Grading…' : allAnswered ? 'Submit final quiz' : `Answer all ${questions.length} to submit`}
      </button>
    </div>
  );
}
