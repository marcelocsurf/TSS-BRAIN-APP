'use client';

// M45 — FinalCampEvaluation
//
// Triggered when the coach closes the LAST day of a multi-day camp. The
// coach is asked to rate every STP of each student officially before the
// camp_instance flips to 'completed'. These cyan stars become the
// student's official TSS evaluation for that step in their portal.

import { useState, useTransition } from 'react';
import { BRAND } from '@/lib/constants/brand';
import { StarRating } from '@/components/sequence/StarRating';
import { closeCampFinal } from '@/lib/actions/service-planner';
import type { ServicePlanData, ServicePlanStudent } from '@/lib/actions/service-planner';

interface Props {
  token: string;
  campInstanceId: string;
  campName: string;
  students: ServicePlanStudent[];
  stpCatalog: ServicePlanData['stpCatalog'];
  // Coach ratings already given across the camp days (student → step →
  // rating). Pre-loaded so the final evaluation reflects daily progress
  // and the coach only adjusts what changed.
  initialRatings?: RatingsMap;
  onCancel: () => void;
  onCompleted: () => void;
}

type RatingsMap = Record<string, Record<string, number>>; // student → step → rating

// A student is approved when EVERY part of the sequence has >= 4 stars.
const PASS_THRESHOLD = 4;

export function FinalCampEvaluation({
  token,
  campInstanceId,
  campName,
  students,
  stpCatalog,
  initialRatings,
  onCancel,
  onCompleted,
}: Props) {
  // Seed from the ratings already given during the camp days so they show
  // up here (deep-copied so edits don't mutate the parent's map).
  const [ratings, setRatings] = useState<RatingsMap>(() => {
    const seed: RatingsMap = {};
    for (const sid of Object.keys(initialRatings ?? {})) {
      seed[sid] = { ...(initialRatings![sid] ?? {}) };
    }
    return seed;
  });
  // Per-student written notes: one the student sees in their portal, one
  // private (coach + bitácora/profile only).
  const [notes, setNotes] = useState<Record<string, { visible: string; private: string }>>({});
  const [pending, startTransition] = useTransition();
  const [openStudent, setOpenStudent] = useState<string | null>(students[0]?.student_id ?? null);

  const setRating = (studentId: string, stepId: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [stepId]: rating },
    }));
  };

  const setNote = (studentId: string, field: 'visible' | 'private', value: string) => {
    setNotes((prev) => ({
      ...prev,
      [studentId]: {
        visible: prev[studentId]?.visible ?? '',
        private: prev[studentId]?.private ?? '',
        [field]: value,
      },
    }));
  };

  const studentRatedCount = (studentId: string): number =>
    stpCatalog.filter((stp) => (ratings[studentId]?.[stp.id] ?? 0) > 0).length;

  // Steps that are rated but below the pass threshold (i.e. blocking approval).
  const studentWeakCount = (studentId: string): number =>
    stpCatalog.filter((stp) => {
      const r = ratings[studentId]?.[stp.id] ?? 0;
      return r > 0 && r < PASS_THRESHOLD;
    }).length;

  // Approved = every part of the sequence rated AND all >= 4 stars.
  const studentApproved = (studentId: string): boolean =>
    stpCatalog.every((stp) => (ratings[studentId]?.[stp.id] ?? 0) >= PASS_THRESHOLD);

  const totalRated = students.reduce((sum, s) => sum + studentRatedCount(s.student_id), 0);
  const totalNeeded = students.length * stpCatalog.length;
  const approvedCount = students.filter((s) => studentApproved(s.student_id)).length;

  const submit = () => {
    const payload: Array<{ student_id: string; step_id: string; rating: number }> = [];
    for (const studentId of Object.keys(ratings)) {
      for (const stepId of Object.keys(ratings[studentId])) {
        payload.push({
          student_id: studentId,
          step_id: stepId,
          rating: ratings[studentId][stepId],
        });
      }
    }

    const notesPayload = Object.keys(notes)
      .map((studentId) => ({
        student_id: studentId,
        student_visible_note: notes[studentId]?.visible?.trim() ?? '',
        coach_private_note: notes[studentId]?.private?.trim() ?? '',
      }))
      .filter((n) => n.student_visible_note || n.coach_private_note);

    startTransition(async () => {
      try {
        await closeCampFinal(token, campInstanceId, payload, notesPayload);
        onCompleted();
      } catch (e: any) {
        alert(e.message || 'Failed to finalize camp.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--tss-navy)]/80 backdrop-blur-sm">
      <div className="max-w-lg mx-auto h-[100dvh] bg-[var(--tss-gray-50,#F6F7F9)] flex flex-col">
        <div
          className="text-white px-4 py-5 shrink-0"
          style={{ background: BRAND.colors.navy }}
        >
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">
            Final official evaluation
          </p>
          <h2 className="text-base font-bold mt-0.5">{campName}</h2>
          <p className="text-[11px] text-white/70 mt-1">
            Rate every step of the sequence for every student. These cyan
            stars become the official TSS record in their portal.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[11px] text-[var(--tss-cyan,#5AC3E7)] font-semibold">
              {totalRated} / {totalNeeded} steps rated
            </p>
            <p className="text-[11px] text-white/80 font-semibold">
              {approvedCount} / {students.length} approved
            </p>
          </div>
          <p className="text-[10px] text-white/50 mt-1">
            Approved = at least {PASS_THRESHOLD}★ on every part of the sequence.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {students.map((s) => {
            const isOpen = openStudent === s.student_id;
            const rated = studentRatedCount(s.student_id);
            return (
              <div
                key={s.student_id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenStudent(isOpen ? null : s.student_id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {s.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.photo_url}
                        alt={s.display_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--tss-navy)] text-white text-[10px] font-bold flex items-center justify-center">
                        {s.display_name
                          .split(' ')
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">
                        {s.display_name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {rated}/{stpCatalog.length} steps rated
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {studentApproved(s.student_id) ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        Approved
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                        {rated < stpCatalog.length
                          ? `${stpCatalog.length - rated} unrated`
                          : `${studentWeakCount(s.student_id)} below ${PASS_THRESHOLD}★`}
                      </span>
                    )}
                    <span className={`text-gray-400 text-xs transition ${isOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-3 border-t border-gray-100 space-y-2.5">
                    {stpCatalog.map((stp) => {
                      const current = ratings[s.student_id]?.[stp.id] ?? null;
                      const weak = current != null && current < PASS_THRESHOLD;
                      return (
                        <div key={stp.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-mono text-gray-400">
                              {stp.id}
                              {weak && <span className="ml-1 text-amber-600">· below {PASS_THRESHOLD}★</span>}
                            </p>
                            <p className={`text-[12px] truncate ${weak ? 'text-amber-700 font-medium' : 'text-gray-800'}`}>{stp.title}</p>
                          </div>
                          <StarRating
                            value={current}
                            size="sm"
                            variant="official"
                            onChange={(v) => setRating(s.student_id, stp.id, v)}
                          />
                        </div>
                      );
                    })}

                    {/* Written notes — one the student sees, one private */}
                    <div className="pt-3 mt-1 border-t border-gray-100 space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">
                          Note for {s.display_name.split(' ')[0]} (they will see this)
                        </label>
                        <textarea
                          value={notes[s.student_id]?.visible ?? ''}
                          onChange={(e) => setNote(s.student_id, 'visible', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-cyan,#5AC3E7)]"
                          placeholder="What they achieved, what to keep working on — shows in the student's portal."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                          🔒 Private coach note (bitácora / profile only)
                        </label>
                        <textarea
                          value={notes[s.student_id]?.private ?? ''}
                          onChange={(e) => setNote(s.student_id, 'private', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)] bg-gray-50"
                          placeholder="Only the coach and those with profile/bitácora access see this. The student never sees it."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="shrink-0 bg-white border-t border-gray-200 p-3 flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700"
          >
            Later
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || totalRated === 0}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
            style={{ background: 'var(--tss-cyan, #5AC3E7)' }}
          >
            {pending ? 'Saving…' : `Finalize camp · save ${totalRated} ratings`}
          </button>
        </div>
      </div>
    </div>
  );
}
