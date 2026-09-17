'use client';

import { useState } from 'react';
import { submitQuiz } from '@/lib/actions/course';
import { Trophy, XCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: { text: string; correct: boolean }[];
  display_order: number;
}

interface QuizProps {
  lessonId: string;
  portalToken: string;
  quizzes: QuizQuestion[];
  existingScore?: number;
  existingAttempts?: number;
  isCompleted?: boolean;
  onComplete: () => void;
}

export function CourseQuiz({
  lessonId,
  portalToken,
  quizzes,
  existingScore,
  existingAttempts = 0,
  isCompleted = false,
  onComplete,
}: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showRetake, setShowRetake] = useState(false);

  const allAnswered = quizzes.every((q) => answers[q.id] !== undefined);
  const passingScore = 80;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    const answerArr = Object.entries(answers).map(([quizId, selectedIndex]) => ({
      quizId,
      selectedIndex,
    }));
    const res = await submitQuiz(portalToken, lessonId, answerArr);
    setResult(res);
    setSubmitting(false);
    if (res.passed) {
      // Refresh parent
      setTimeout(() => onComplete(), 1500);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setShowRetake(false);
  };

  // Show completed state
  if (isCompleted && !result && !showRetake) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} strokeWidth={1.75} className="mx-auto mb-3 text-[var(--tss-cyan,#00D2FF)]" />
        <h3 className="font-black uppercase text-[20px] mb-2 text-[#10263B]" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>Quiz Passed</h3>
        <p className="text-sm text-[#55666E] mb-1">
          You scored <strong>{existingScore}%</strong> on this quiz.
        </p>
        <p className="text-xs text-[#55666E] mb-6">
          {existingAttempts} {existingAttempts === 1 ? 'attempt' : 'attempts'}
        </p>
        <button
          onClick={() => setShowRetake(true)}
          className="text-sm text-[#55666E] underline"
        >
          Retake quiz
        </button>
      </div>
    );
  }

  // Show result after submission
  if (result) {
    return (
      <div className="text-center py-6">
        <div className="mb-3 flex justify-center">
          {result.passed ? (
            <Trophy size={48} strokeWidth={1.75} className="text-[var(--tss-cyan,#00D2FF)]" />
          ) : (
            <XCircle size={48} strokeWidth={1.75} className="text-red-500" />
          )}
        </div>
        <h3 className="font-black uppercase text-[20px] mb-2 text-[#10263B]" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>
          {result.passed ? 'Passed!' : 'Not yet'}
        </h3>
        <p className="text-3xl font-bold mb-1">
          {result.score}%
        </p>
        <p className="text-sm text-[#55666E] mb-4">
          {result.correctCount} of {result.total} correct
        </p>
        {!result.passed && (
          <>
            <p className="text-xs text-[#55666E] mb-4 max-w-sm mx-auto">
              You need {passingScore}% to pass. Review the lesson and try again.
            </p>
            <button
              onClick={handleRetake}
              className="bg-[var(--tss-navy)] text-white px-6 py-2.5 rounded-[5px] text-sm font-bold hover:opacity-90"
            >
              Try again
            </button>
          </>
        )}
        {result.passed && (
          <p className="text-xs text-[#1B5E3A] italic">
            Lesson completed. Moving on...
          </p>
        )}
      </div>
    );
  }

  // Show quiz form
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-black uppercase text-[18px] mb-1 text-[#10263B]" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>Quick Knowledge Check</h3>
        <p className="text-xs text-[#55666E]">
          Answer all {quizzes.length} questions. You need {passingScore}%+ to pass and unlock the next lesson.
        </p>
      </div>

      <div className="space-y-5">
        {quizzes.map((quiz, qIdx) => (
          <div key={quiz.id} className="border-l-4 border-[var(--tss-navy)] pl-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#55666E] mb-1" style={{ fontFamily: 'var(--font-plex)' }}>QUESTION {qIdx + 1}</div>
            <p className="font-medium text-sm mb-3">{quiz.question}</p>
            <div className="space-y-2">
              {quiz.options.map((opt, idx) => {
                const selected = answers[quiz.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [quiz.id]: idx }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-[5px] border-2 transition-all text-sm ${
                      selected
                        ? 'border-[var(--tss-navy)] bg-[#B3F1FF]'
                        : 'border-[#DCD7C6] bg-[#F7F9FA]'
                    }`}
                  >
                    <span className="inline-block w-5 h-5 rounded-full border-2 mr-2 align-middle" style={{
                      borderColor: selected ? 'var(--tss-navy)' : '#B8C7D1',
                      background: selected ? 'var(--tss-navy)' : 'transparent',
                    }} />
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className={`w-full mt-6 py-3 rounded-[5px] text-sm font-bold transition-all ${
          allAnswered
            ? 'bg-[var(--tss-navy)] text-white hover:opacity-90'
            : 'bg-[#DCD7C6] text-[#55666E] cursor-not-allowed'
        }`}
      >
        {submitting ? 'Submitting...' : allAnswered ? 'Submit Quiz' : `Answer all questions (${Object.keys(answers).length}/${quizzes.length})`}
      </button>
    </div>
  );
}
