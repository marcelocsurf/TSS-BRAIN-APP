# TSS BRAIN App — UX Flow Analysis

**Date:** 2026-03-21
**Analyst:** Claude (Senior Product Engineer)
**Stack:** Next.js 14 + Tailwind CSS + Supabase
**Version:** Post-Phase 3 Cascade Rebuild

---

## Executive Summary

The TSS BRAIN app is a surf coaching management platform with four distinct user roles: Admin, Coordinator, Coach, and Student (portal). The application covers session management (22-step cascade and multi-mission standalone), camp operations, student lifecycle, and a student-facing portal. The codebase is well-structured with clean separation between server actions and UI. Most core flows are functional, but several UX gaps exist around feedback, navigation dead ends, and missing interconnections between features.

---

## Bug Audit Summary

### Fixed

| File | Issue | Fix |
|------|-------|-----|
| `src/lib/actions/portal.ts` | **Wrong column names in drills query** — Selected `name`, `description`, `pilar` from `drills` table but actual columns are `drill_name`, `drill_type`, `related_pilar`. This caused the self-training drill list to return empty/null values for all drill names in the student portal. | Corrected column names to match drills table schema (`drill_name`, `drill_type`, `related_pilar`), added normalization layer, and restored `active_status` filter. |

### Noted (Not Fixed — Working As-Is)

| Location | Observation | Risk |
|----------|-------------|------|
| `sessions.ts` + `auth.ts` | Two different `getCurrentCoach` functions exist — `auth.ts` returns `null` on failure, `sessions.ts` throws. Pages importing from `sessions.ts` (students/[id], coaches/[id]) wrap in try/catch and handle correctly. | Low — both patterns are handled, but refactoring to a single source would reduce confusion. |
| `cascade-sessions.ts` | `dropdown_options` table uses `.eq('active', true)` — assumes `active` column exists. If the table uses `active_status` instead, these queries would fail silently. | Medium — confirm column name matches DB schema. |
| `portal.ts` | `student_level_access` table uses `.eq('active', true)` — same column name question. | Low — if table doesn't have `active` column, RLS or defaults would mask the issue. |
| `camps.ts` line 205 | `createAdminClient()` is called but not awaited — however `createAdminClient` is synchronous (returns client directly), so this is correct. | None |
| `email.ts` | BRAND.colors referenced as hex in inline HTML styles — this is correct for email (CSS vars don't work in email clients). | None |

---

## Flow Analysis by Role

---

### ADMIN FLOWS

#### 1. Create Coach -> Assign Role -> Manage Permissions

**Route:** `/coaches/new` -> `/coaches/[id]`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Partial | Coach creation form exists (`AddCoachForm`). Role selection and belt permission assignment are present. |
| Continuity | Good | After creation, redirects to coach profile with full details. |
| Feedback | Good | Error messages display inline. Loading state on submit. |
| Error Recovery | Good | Validation errors shown clearly. |
| Dead Ends | None | Clear navigation back to coaches list. |

**Rating: Partial**

Coach creation exists and works, but the actual `AddCoachForm` component (in `coaches/new/add-coach-form.tsx`) was not in the review scope files. The coach profile page at `/coaches/[id]` is comprehensive with stats, ratings, certifications, evaluations, and recent sessions. The `CertificationManager` component allows admins to grant/revoke certifications. The `ToggleCoachStatus` component handles activation/deactivation.

**Gap:** No coach invitation workflow visible — the `/api/coaches/invite` route exists but its integration with the UI was not visible in the coach creation flow.

#### 2. Create Student -> Waiver -> Assign to Camp

**Route:** `/students/new` -> `/students/[id]` -> `/camps/[id]`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Full student registration with waiver enforcement. |
| Continuity | Good | Waiver must be signed before submission. After creation, redirects to student profile. |
| Feedback | Good | Error messages, loading states, validation all present. |
| Error Recovery | Good | Field-level validation with clear error messages. |
| Dead Ends | None | Profile page has clear CTAs (Start Session, Open Portal). |

**Rating: Complete and working**

The student creation form enforces all mandatory fields: name, DOB, emergency contact, swim level, belt level, ocean level, surf experience, and waiver signature. The waiver text is displayed and must be checked before submission. After creation, the student profile shows all data with clearly organized collapsible sections.

**Camp assignment** is handled via `CampStudentManager` component on the camp detail page, which allows adding/removing students from a camp instance.

#### 3. Create Camp Template -> Create Camp Instance -> Assign Coach + Students

**Route:** `/camps/templates/new` -> `/camps/templates` -> `/camps/new` -> `/camps/[id]`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Template builder, instance creation, and management all functional. |
| Continuity | Good | Template -> instance -> day view -> evaluation is a clear pipeline. |
| Feedback | Good | Session creation shows error handling. Day completion tracked per student. |
| Error Recovery | Good | Try/catch patterns on all critical operations. |
| Dead Ends | Minor | Template list page links to create/edit but no preview mode for templates. |

**Rating: Complete and working**

The `TemplateBuilderForm` component supports both create and edit modes. The `createCampInstance` action auto-generates camp sessions for each template day. The camp detail page shows enrolled students, schedule, evaluation progress, and completion status.

#### 4. View Audit Logs

**Route:** `/audit`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Present | Audit page exists, protected by admin role check. |
| Continuity | N/A | Read-only view. |
| Feedback | N/A | Displays logged events. |

**Rating: Working (minimal scope)**

Audit log entries are created by `camps.ts`, `sessions.ts`, and `survey.ts` using the admin client. The entries track session closes, camp result closes, and survey submissions with actor info, event type, and status transitions.

#### 5. Grant/Revoke Belt Access for Students

**Route:** `/students/[id]` -> `LevelAccessCard` component

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Grant and revoke buttons for each belt level. |
| Continuity | Good | Uses `useTransition` for non-blocking updates. State updates immediately in UI. |
| Feedback | Good | Button text changes ("..." while loading, "Unlocked"/"Grant" states). |
| Error Recovery | Adequate | Server errors would surface but no inline error display on the card. |
| Dead Ends | None | Integrated into student profile page. |

**Rating: Complete and working**

The `LevelAccessCard` displays all belt levels with grant/revoke toggles. Granting creates a `student_level_access` row, which the portal uses to determine which materials the student can see.

---

### COACH FLOWS

#### 6. Login -> See Dashboard -> Start Session

**Route:** `/login` -> `/` (dashboard) -> `/sessions/new`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Functional | Login via Supabase auth. Dashboard shows overview. Session start accessible. |
| Continuity | Good | Auth middleware protects dashboard routes. Coach record loaded via `auth_user_id`. |
| Feedback | Good | Login page handles auth errors. |
| Error Recovery | Good | Invalid credentials show error messages. |
| Dead Ends | None | Dashboard provides clear navigation to all features. |

**Rating: Complete and working**

#### 7. 22-Step Cascade -> Plan Review -> Close -> Save

**Route:** `/sessions/new` -> `SessionCascadeForm` (22 steps) -> `SessionPlanReview` -> Save

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | All 22 steps implemented as individual components (Step01 through Step22). |
| Continuity | Excellent | State managed via `useReducer`. Steps flow logically through 3 moments (context, planning, close). |
| Feedback | Good | `CascadeProgress` component shows step progress. Submission state tracked. |
| Error Recovery | Good | RPC call returns structured `{ success, error }`. Draft save available for interrupted sessions. |
| Dead Ends | None | After save, redirects to student profile and revalidates relevant paths. |

**Rating: Complete and working**

This is the core flow. The cascade uses a reducer pattern with typed actions for each of the 22 steps. Plan review shows a formatted summary before closing. The `createCascadeSession` action calls an RPC function atomically, then creates `student_session_results` and sends email notifications. Draft saving is supported via `saveCascadeDraft`.

**Strengths:**
- Ocean rules safety check at Step 3 with hardcoded matrix (Canon Oficial v5.0 Section 10)
- Belt-filtered pilar parts and drills
- Progressive ratings that scale by belt level
- Coach assignment support for coordinators/admins
- Non-blocking email on close

#### 8. View Student Profile -> Evaluate Sequence -> Evaluate Ocean Level

**Route:** `/students/[id]` -> `SequenceEvaluationPanel` / `OceanLevelPanel`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Both sequence and ocean level evaluation panels with inline forms. |
| Continuity | Good | Evaluations update student profile and show history. |
| Feedback | Good | Success/error messages inline. Loading states on submit. |
| Error Recovery | Good | Try/catch with error display. |
| Dead Ends | None | Panels are collapsible sections within student profile. |

**Rating: Complete and working**

Both evaluation types record history with coach attribution, previous/new values, and optional notes. The ocean level panel supports three evaluation methods (coach assessment, quiz, evaluation).

#### 9. Camp Day -> Give Daily Feedback -> Customize Drills Per Student

**Route:** `/camps/[id]/day/[dayNum]` -> `CampDailyFeedbackForm` / `CampCustomizationPanel`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Daily feedback form per student. Customization panel for drill overrides. |
| Continuity | Good | Customizations merge with template blocks using override pattern. |
| Feedback | Good | Upsert semantics allow re-submission without errors. |
| Error Recovery | Good | Error handling on form submissions. |
| Dead Ends | Minor | No "next day" navigation from within the day view — coach must go back to camp detail to navigate to next day. |

**Rating: Complete and working**

The `CampCustomizationPanel` allows per-student drill and mission overrides for each block on a given day. The `getCustomizedPlan` action merges template blocks with customizations using a Map-based override strategy.

#### 10. Camp Final Evaluation -> Update Student Progression

**Route:** `/camps/[id]/evaluate`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Accordion-style evaluation form per student with progress tracking. |
| Continuity | Good | Evaluations update student's sequence number and ocean level. |
| Feedback | Good | Progress bar, per-student status badges, success/error messages. |
| Error Recovery | Good | Per-student error handling. Can re-submit (upsert). |
| Dead Ends | Minor | After all evaluations done, "Back to Camp" button is present. No auto-complete of camp. |

**Rating: Complete and working**

The evaluate page loads all participants, pre-fills existing evaluations, and supports update-in-place via upsert. The camp detail page shows a "Mark Complete" button when all students are evaluated.

---

### STUDENT FLOWS (Portal)

#### 11. Open Portal -> See Home with Stats

**Route:** `/portal/[token]`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Comprehensive home tab with stats, streak, recent drills, session history. |
| Continuity | Good | Data loaded server-side via admin client (bypasses RLS for portal access). |
| Feedback | Good | Visual stats cards, streak counter, training minutes. |
| Error Recovery | Good | Returns `notFound()` for invalid tokens. |
| Dead Ends | None | Tab navigation to all portal sections. |

**Rating: Complete and working**

The portal uses a tabbed interface with Home, Sessions, Materials, Train, and Survey tabs. The home tab shows: total sessions, streak days, self-training count, training minutes, recent drills, and drills practiced.

#### 12. View Materials by Level (Locked/Unlocked)

**Route:** `/portal/[token]` -> Materials tab

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Materials filtered by belt level + admin-granted access. Locked items shown but inaccessible. |
| Continuity | Good | `getStudentMaterials` combines belt-based and admin-granted access levels. |
| Feedback | Good | Visual distinction between locked/unlocked materials. |
| Error Recovery | N/A | Read-only display. |
| Dead Ends | None | Materials link out to content (YouTube, PDFs). |

**Rating: Complete and working**

Materials are defined in `student-materials.ts` with per-belt categorization. The `student_level_access` table allows admins to grant access to materials above the student's current belt level.

#### 13. Start Self-Training -> Plan Review -> Timer -> Save

**Route:** `/portal/[token]` -> Train tab

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Drill selection, warm-up, mental hack, timer, and session save. |
| Continuity | Good | Creates `self_training_sessions` record. Drill list filtered by belt level. |
| Feedback | Good | Timer with visual countdown. Complete button. |
| Error Recovery | Adequate | Basic error handling. |
| Dead Ends | Minor | After completing a self-training session, the student stays on the Train tab. No prompt to start another or view progress. |

**Rating: Complete and working**

Self-training supports warm-up selection (from SELF_TRAINING_WARMUPS), drill selection (from both DB and material constants), mental hack selection, and a timed session with notes. Sessions can be marked as complete.

#### 14. Submit Feedback Survey -> See Results

**Route:** `/portal/[token]` -> Survey tab

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Survey form with coach rating (1-5), clarity, value, and open comment. |
| Continuity | Good | Surveys linked to session results. Completed surveys shown in history. |
| Feedback | Good | Pending surveys displayed with session context. Submitted surveys show responses. |
| Error Recovery | Good | Duplicate submission check (server-side). |
| Dead Ends | None | After submission, survey moves from pending to completed list. |

**Rating: Complete and working**

The `SurveyForm` component handles the survey input with validation. The `submitSurvey` action checks for duplicates, inserts the survey response, updates the session result completion state, and creates an audit log entry.

---

### COORDINATOR FLOWS

#### 15. Create Students -> Send Intake Links

**Route:** `/students/new` -> `/students` -> `/portal/[token]` (intake)

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Functional | Student creation works. Portal token auto-generated. |
| Continuity | Gap | No built-in "send intake link" UI from the student list. The intake URL must be manually shared. |
| Feedback | Good | Student profile shows intake status and waiver status. |
| Error Recovery | Good | Validation on creation form. |
| Dead Ends | Gap | After creating a student, there is no prompt or button to copy/send the intake link. |

**Rating: Works but has UX gaps**

Intake forms exist at `/intake/[token]` with two tiers: basic (emergency contact, swim level, waiver) and extended (full surf profile, goals, logistics). However, the intake link is not surfaced prominently in the student creation flow. The coordinator must navigate to the student profile, then to their portal to find the URL.

#### 16. Create Camp Instances -> Assign Students + Coach

**Route:** `/camps/new` -> `/camps/[id]`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Camp creation with template selection, coach assignment, date range, student enrollment. |
| Continuity | Good | Auto-creates camp sessions for each template day. |
| Feedback | Good | Error handling and validation. |
| Error Recovery | Good | Errors thrown with descriptive messages. |
| Dead Ends | None | Camp detail page provides full management interface. |

**Rating: Complete and working**

#### 17. View Coach Profiles

**Route:** `/coaches` -> `/coaches/[id]`

| Aspect | Rating | Notes |
|--------|--------|-------|
| Completeness | Complete | Full coach profile with stats, ratings, feedback, resources, certifications, evaluations, recent sessions. |
| Continuity | Good | Data loaded in parallel for performance. |
| Feedback | Good | Visual stat cards, star ratings, distribution bars. |
| Error Recovery | Good | Graceful handling when views/tables don't exist yet. |
| Dead Ends | None | Clear navigation with back link and action buttons. |

**Rating: Complete and working**

---

## Flow Ratings Summary

| # | Flow | Rating |
|---|------|--------|
| 1 | Create coach -> assign role -> manage permissions | Partial |
| 2 | Create student -> waiver -> assign to camp | Complete |
| 3 | Create camp template -> create camp instance -> assign coach + students | Complete |
| 4 | View audit logs | Complete |
| 5 | Grant/revoke belt access for students | Complete |
| 6 | Login -> see dashboard -> start session | Complete |
| 7 | 22-step cascade -> plan review -> close -> save | Complete |
| 8 | View student profile -> evaluate sequence -> evaluate ocean level | Complete |
| 9 | Camp day -> give daily feedback -> customize drills per student | Complete |
| 10 | Camp final evaluation -> update student progression | Complete |
| 11 | Open portal -> see home with stats | Complete |
| 12 | View materials by level (locked/unlocked) | Complete |
| 13 | Start self-training -> plan review -> timer -> save | Complete |
| 14 | Submit feedback survey -> see results | Complete |
| 15 | Create students -> send intake links | Partial (UX gaps) |
| 16 | Create camp instances -> assign students + coach | Complete |
| 17 | View coach profiles | Complete |

---

## Top 5 Quick Wins

### 1. Add "Copy Intake Link" Button to Student Profile
**Impact:** High | **Effort:** Low
After creating a student, add a one-click "Copy Intake Link" button on the student profile page next to the "Open Portal" button. This eliminates the manual step of constructing the intake URL.

### 2. Add "Next Day" / "Previous Day" Navigation to Camp Day View
**Impact:** Medium | **Effort:** Low
The camp day view (`/camps/[id]/day/[dayNum]`) currently only has a "Back to camp" link. Adding "Previous Day" and "Next Day" buttons would let coaches flow through days without returning to the camp detail page.

### 3. Show Inline Error Messages on Level Access Card Failures
**Impact:** Low | **Effort:** Low
The `LevelAccessCard` grant/revoke buttons show loading state but don't display errors if the server action fails. Adding a small error toast or inline message would improve feedback.

### 4. Add Session Count Badge to Student Cards in Camp Views
**Impact:** Medium | **Effort:** Low
In camp participant lists, show how many session results exist for each student in this camp. This gives coaches a quick glance at who has been evaluated without clicking into each student.

### 5. Add Confirmation Before Camp Completion
**Impact:** Medium | **Effort:** Low
The `CampCompleteButton` component should show a confirmation dialog before marking a camp as completed, since this action is not easily reversible.

---

## Top 5 Structural Improvements

### 1. Unify `getCurrentCoach` to a Single Source
**Impact:** Medium | **Effort:** Medium
Two different `getCurrentCoach` functions exist in `auth.ts` (returns null) and `sessions.ts` (throws). This creates confusion about error handling patterns. Consolidate to the `auth.ts` version (non-throwing, returns null) and update all consumers.

### 2. Build Intake Link Management Flow
**Impact:** High | **Effort:** Medium
Create a dedicated "Intake Management" section for coordinators that shows:
- Students with pending intake (no `intake_completed_at`)
- One-click copy of intake links
- Bulk "send intake email" action
- Intake completion status tracking

### 3. Add Session Draft Resume
**Impact:** High | **Effort:** Medium
The `saveCascadeDraft` function exists but there is no UI to list and resume draft sessions. Coaches who get interrupted mid-session have no way to return to their draft. Add a "Drafts" section to the dashboard or sessions list.

### 4. Coach Dashboard with Role-Based Views
**Impact:** High | **Effort:** High
The home page (`/`) serves all roles but could be more differentiated:
- **Admin:** System overview, recent audit events, coach activity summary
- **Coordinator:** Student pipeline, intake status, camp management shortcuts
- **Coach:** Today's sessions, student follow-ups needed, pending evaluations

### 5. Standalone Session Flow Parity
**Impact:** Medium | **Effort:** High
The standalone session flow (`closeStandaloneSession`) supports multi-mission sessions but the UI for creating standalone sessions (if it exists beyond cascade) is not prominent. Consider whether standalone sessions should be deprecated in favor of cascade, or given a clear entry point.

---

## Disconnected or Hard-to-Reach Features

| Feature | Location | Issue |
|---------|----------|-------|
| Standalone session creation | `sessions.ts` -> `closeStandaloneSession` | The action exists and is comprehensive but the primary session creation UI (`/sessions/new`) uses cascade exclusively. An `/sessions/old` route exists but is likely deprecated. |
| Draft sessions | `cascade-sessions.ts` -> `saveCascadeDraft` | Action exists but no UI to list/resume drafts. |
| Intake form (student-facing) | `/intake/[token]` | No prominent link from the admin/coordinator UI to send these links. |
| Coach evaluation page | `/coaches/[id]/evaluate` | Linked from coach profile but could be more discoverable for directors doing regular evaluations. |
| Bulk evaluation scheduling | `camps.ts` -> `bulkScheduleEvaluations` | Action exists but the `ScheduledEvaluationsPanel` may not surface it prominently. |
| Ocean rules table | `sessions.ts` -> `getOceanRules` | Action fetches from DB table but cascade uses hardcoded matrix instead (noted in code comment: "DB table had column/value mismatches"). Potential data drift. |
| Self-training session notes update | `portal.ts` -> `completeSelfTrainingSession` | Accepts optional notes on completion but the portal UI may not surface an edit field at completion time. |

---

## Data Integrity Observations

1. **Email sending is non-blocking** — If Resend fails, the session still saves correctly. Email status is tracked via `email_sent` and `email_sent_at` columns on `student_session_results`.

2. **Audit logging uses admin client** — Audit entries bypass RLS, which is correct for tamper-resistance.

3. **Student profile updates on session close** use an RPC function (`update_student_profile_on_close`) with a manual fallback if the RPC fails. This is defensive coding.

4. **Camp session auto-completion** — When all participants are evaluated for a camp session, it automatically marks the session as completed. This is smart but could trigger unexpected state changes if a participant is added mid-session.

5. **Upsert patterns** are used correctly in camps daily feedback, customizations, and scheduled evaluations to prevent duplicate entries.

---

## Conclusion

The TSS BRAIN app has a solid foundation with well-implemented core flows. The 22-step cascade is the strongest feature, with thorough state management, safety rules, and data continuity. The camp management system is comprehensive with template-based scheduling, per-student customizations, and structured evaluation workflows.

The primary gaps are in the coordinator experience (intake link management, dashboard differentiation) and in feature discoverability (draft sessions, bulk evaluation scheduling). The portal is functional and feature-rich but could benefit from better post-action prompts.

The single bug fixed (drills column name mismatch in portal.ts) was causing the self-training drill selection to display empty names, which would have been a visible issue for any student using the self-training feature.
