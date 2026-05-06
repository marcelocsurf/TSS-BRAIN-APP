'use client';

import { useState } from 'react';
import { submitQuiz } from '@/lib/actions/course';

interface QuizQuestion {
  id: string;
  question: string;
  options: { text: string; correct: boolean }[];
  display_order: number;
}

interface QuizProps {
  lessonId: string;
  studentId: string;
  quizzes: QuizQuestion[];
  existingScore?: number;
  existingAttempts?: number;
  isCompleted?: boolean;
  onComplete: () => void;
}

export function CourseQuiz({
  lessonId,
  studentId,
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
    const res = await submitQuiz(studentId, lessonId, answerArr);
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
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="font-bold text-lg mb-2">Quiz Passed</h3>
        <p className="text-sm text-gray-600 mb-1">
          You scored <strong>{existingScore}%</strong> on this quiz.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          {existingAttempts} {existingAttempts === 1 ? 'attempt' : 'attempts'}
        </p>
        <button
          onClick={() => setShowRetake(true)}
          className="text-sm text-gray-500 underline"
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
        <div className={`text-5xl mb-3 ${result.passed ? '' : 'opacity-50'}`}>
          {result.passed ? '🎉' : '🙁'}
        </div>
        <h3 className="font-bold text-lg mb-2">
          {result.passed ? 'Passed!' : 'Not yet'}
        </h3>
        <p className="text-3xl font-bold mb-1">
          {result.score}%
        </p>
        <p className="text-sm text-gray-600 mb-4">
          {result.correctCount} of {result.total} correct
        </p>
        {!result.passed && (
          <>
            <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
              You need {passingScore}% to pass. Review the lesson and try again.
            </p>
            <button
              onClick={handleRetake}
              className="bg-[var(--tss-navy)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90"
            >
              Try again
            </button>
          </>
        )}
        {result.passed && (
          <p className="text-xs text-green-600 italic">
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
        <h3 className="font-bold text-base mb-1">Quick Knowledge Check</h3>
        <p className="text-xs text-gray-500">
          Answer all {quizzes.length} questions. You need {passingScore}%+ to pass and unlock the next lesson.
        </p>
      </div>

      <div className="space-y-5">
        {quizzes.map((quiz, qIdx) => (
          <div key={quiz.id} className="border-l-4 border-[var(--tss-navy)] pl-4">
            <div className="text-[10px] text-gray-400 mb-1">QUESTION {qIdx + 1}</div>
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
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                      selected
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="inline-block w-5 h-5 rounded-full border-2 mr-2 align-middle" style={{
                      borderColor: selected ? 'var(--tss-navy)' : '#d1d5db',
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
        className={`w-full mt-6 py-3 rounded-lg text-sm font-medium transition-all ${
          allAnswered
            ? 'bg-[var(--tss-navy)] text-white hover:opacity-90'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {submitting ? 'Submitting...' : allAnswered ? 'Submit Quiz' : `Answer all questions (${Object.keys(answers).length}/${quizzes.length})`}
      </button>
    </div>
  );
}
