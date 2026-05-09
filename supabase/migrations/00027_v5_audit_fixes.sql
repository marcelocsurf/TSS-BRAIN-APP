-- 00027 — Close v5 audit gaps: form lessons + cumulative sequence locking
--
-- Two changes, both data-only (no schema changes):
--
--   1. Mark ONB-01 (Goofy or Regular) and ONB-06 (Venue Analysis + Set Goal)
--      as `lesson_type = 'form'`. The LessonViewer already has form
--      components for these two — they were just hard-coded against the
--      legacy IDs PC-002/PC-004 (which no longer exist after the WB
--      Complete Package import in commit 9079562). The form logic is
--      pointed at the new IDs in code; here we flip the column so the
--      LessonViewer enters form mode for them.
--
--   2. Populate `lessons.prerequisites` so that each cumulative sequence
--      (Seq #2, #3, #4, #5) is gated on completion of all steps in the
--      previous sequences. The locking UI already exists in CourseTab,
--      it just had nothing to enforce against. Within a sequence the
--      student can still pick steps in any order.
--
--      Sequence boundaries (per v5 manual + WB_COMPLETE_PACKAGE.json):
--        Seq #1: STP-001..STP-009  (no prereqs — first sequence)
--        Seq #2: STP-010..STP-014  (prereqs = all of Seq #1)
--        Seq #3: STP-015..STP-020  (prereqs = all of Seq #1+#2)
--        Seq #4: STP-021..STP-022  (prereqs = all of Seq #1+#2+#3)
--        Seq #5: STP-023..STP-025  (prereqs = all of Seq #1+#2+#3+#4)
--
--      Pre-Course → Onboarding → White Belt is already gated by the
--      `preCourseCompleted` check in src/lib/actions/course.ts (no
--      `prerequisites` column needed for that gate).

BEGIN;

-- 1. Form lessons
UPDATE lessons SET lesson_type = 'form' WHERE id IN ('ONB-01', 'ONB-06');

-- 2. Cumulative sequence locking — set prereqs on EVERY step of Seq #2..#5
-- (not just the first) so the lock is consistent for the whole sequence
-- block. Within a single sequence the student can pick steps in any
-- order — only the cross-sequence boundary is enforced.

-- Seq #2 (STP-010..STP-014): all require all of Seq #1
UPDATE lessons SET prerequisites = ARRAY[
  'STP-001','STP-002','STP-003','STP-004','STP-005',
  'STP-006','STP-007','STP-008','STP-009'
]::TEXT[] WHERE id IN ('STP-010','STP-011','STP-012','STP-013','STP-014');

-- Seq #3 (STP-015..STP-020): all require all of Seq #1+#2
UPDATE lessons SET prerequisites = ARRAY[
  'STP-001','STP-002','STP-003','STP-004','STP-005',
  'STP-006','STP-007','STP-008','STP-009',
  'STP-010','STP-011','STP-012','STP-013','STP-014'
]::TEXT[] WHERE id IN ('STP-015','STP-016','STP-017','STP-018','STP-019','STP-020');

-- Seq #4 (STP-021..STP-022): all require all of Seq #1+#2+#3
UPDATE lessons SET prerequisites = ARRAY[
  'STP-001','STP-002','STP-003','STP-004','STP-005',
  'STP-006','STP-007','STP-008','STP-009',
  'STP-010','STP-011','STP-012','STP-013','STP-014',
  'STP-015','STP-016','STP-017','STP-018','STP-019','STP-020'
]::TEXT[] WHERE id IN ('STP-021','STP-022');

-- Seq #5 (STP-023..STP-025): all require all of Seq #1+#2+#3+#4
UPDATE lessons SET prerequisites = ARRAY[
  'STP-001','STP-002','STP-003','STP-004','STP-005',
  'STP-006','STP-007','STP-008','STP-009',
  'STP-010','STP-011','STP-012','STP-013','STP-014',
  'STP-015','STP-016','STP-017','STP-018','STP-019','STP-020',
  'STP-021','STP-022'
]::TEXT[] WHERE id IN ('STP-023','STP-024','STP-025');

COMMIT;
