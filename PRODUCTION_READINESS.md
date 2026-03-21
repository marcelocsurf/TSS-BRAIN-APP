# Production Readiness Report
Date: 2026-03-21

## Status: READY WITH CAVEATS

The app builds cleanly, all critical paths have working code, and the architecture is sound. However, before the first real session, the database migration `00012_production_fixes.sql` MUST be executed in Supabase SQL Editor to add missing tables and columns.

---

## Critical Issues (fixed in this audit)

### 1. FIXED: `getStudentWithCascadeContext` queried non-existent columns
- **File**: `src/lib/actions/cascade-sessions.ts`
- **Problem**: Queried `student_path`, `age_group`, `board_clearance_hardtop` from `students` table -- columns that do not exist in any migration.
- **Impact**: Would crash Step 1 of the 22-step cascade session for every student.
- **Fix**: Removed the three non-existent columns from the query and the `StudentCascadeContext` type.

### 2. FIXED: Cascade session results violated CHECK constraint
- **File**: `src/lib/actions/cascade-sessions.ts`
- **Problem**: `student_session_results` insert set `standalone_session_id: null` without setting `camp_session_id`, violating the CHECK constraint `(camp_session_id IS NOT NULL OR standalone_session_id IS NOT NULL)`.
- **Impact**: Every completed cascade session would fail to create a student result row.
- **Fix**: Added `cascade_session_id` column to `student_session_results` table (in migration) and updated the insert to use it. Relaxed the CHECK constraint to allow `cascade_session_id` as a valid third option.

### 3. FIXED: Survey responses ordered by wrong column
- **File**: `src/lib/actions/portal.ts`
- **Problem**: `getSubmittedSurveys` ordered by `created_at` but `survey_responses` table uses `submitted_at`.
- **Impact**: Survey listing in the student portal would return results in undefined order.
- **Fix**: Changed order column to `submitted_at`.

### 4. FIXED: Camp session results missing `coach_id`
- **File**: `src/lib/actions/camps.ts`
- **Problem**: `closeCampSessionResult` did not include `coach_id` in the insert to `student_session_results`, even though the column was added in `phase2_sql.sql`.
- **Impact**: Coach attribution would be missing for all camp results.
- **Fix**: Added `coach_id` to the insert payload.

### 5. FIXED: View column mismatches
- **Files**: `phase2_sql.sql` views `coach_rating_stats` and `coach_student_feedback`
- **Problem**: Views referenced columns (`overall_rating`, `enjoyment_rating`, `open_feedback`) that don't exist in `survey_responses`. Code expected columns (`avg_rating`, `five_star`, etc.) not in the views.
- **Impact**: Coach profile pages would show zero ratings.
- **Fix**: Recreated both views in migration `00012` with correct column references.

---

## Database Migration Required Before Production

**Run `supabase/migrations/00012_production_fixes.sql` in Supabase SQL Editor.**

This migration:
- Adds missing columns to `students` (`intake_tier`, `waiver_signed_at`, `waiver_signed_by`)
- Adds `cascade_session_id`, `internal_notes`, `incident_type`, `incident_description`, `incident_action`, `duration_minutes` to `student_session_results`
- Relaxes the CHECK constraint on `student_session_results` to allow cascade sessions
- Adds `simulation`, `mission_time`, `repetitions` columns to `standalone_sessions`
- Creates `session_missions` table (multi-mission standalone sessions)
- Creates `student_level_access` table (admin-granted portal access)
- Creates `pilar_parts` table (cascade Step 6)
- Creates `rating_scales` table (cascade Step 16)
- Creates `dropdown_options` table (cascade dropdowns)
- Creates `get_drills_for_belt` and `get_pilar_parts_for_belt` RPC functions
- Fixes `coach_rating_stats` and `coach_student_feedback` views

---

## Known Limitations (acceptable for initial launch)

1. **No real-time notifications**: Session completion emails depend on Resend API key being configured. Without `RESEND_API_KEY`, sessions save correctly but emails silently fail. Non-blocking.

2. **Coach rating stats may show zeros initially**: Until students submit surveys through the portal, coach rating stats will be empty. This is expected behavior.

3. **RLS policies are permissive**: Most tables use `TO authenticated USING (true)` policies. Any logged-in coach can see all students and sessions. This is by design for Stage 1 (small team) but should be tightened for multi-academy deployment.

4. **No password reset flow**: Coaches receive invite emails via Supabase Auth. If they lose access, an admin must re-invite. There is a `/set-password` page but no "forgot password" link on the login page.

5. **Dropdown options and pilar_parts tables need seed data**: The `dropdown_options`, `pilar_parts`, and `rating_scales` tables are created empty. For the cascade session flow to offer choices in Steps 2, 4, 6, and 16, these tables need seed data. The app gracefully handles empty tables (shows empty selects), but the coach experience will be limited without seeds.

6. **Legacy standalone session flow**: The old `/sessions/old` page exists alongside the cascade flow. Both work independently. The cascade flow is the canonical path.

7. **Photo upload requires Supabase Storage bucket**: The `avatars` bucket must be created in Supabase Storage with public access for profile photos to work.

---

## Working Features (verified by code trace)

### Path A: Admin Creates Coach
- `/coaches/new` -> `AddCoachForm` -> `POST /api/coaches/invite` -> Supabase Auth invite + coach row
- Admin-only guard verified (role check in API route)
- Duplicate email check present
- Rollback on failure (deletes auth user if coach insert fails)

### Path B: Admin Creates Student with Waiver
- `/students/new` -> `createStudent` -> validates 9 mandatory fields + waiver -> inserts with all profile fields
- Waiver enforced at both client-side (checkbox + disabled submit) and server-side (throws error)
- Date of birth, swim level, ocean level, surf experience all required
- Coach name recorded as `waiver_signed_by`

### Path C: Coach Creates 22-Step Cascade Session
- `/sessions/new` -> `SessionCascadeForm` (22 steps) -> `createCascadeSession` -> `save_cascade_session` RPC
- RPC params match exactly (44 parameters)
- Student continuity updated (last_session_*, next_recommended_focus)
- Student session result created with portal_token
- Email sent (non-blocking)
- Draft save/resume works

### Path D: Student Portal
- `/portal/[token]` -> `getStudentPortalData` -> 5 tabs
- Home: stats (total sessions, streak, training minutes, recent drills)
- Materials: filtered by belt level + admin-granted access
- Self-Training: create/complete self-training sessions with drills
- Surveys: view pending and completed surveys
- Profile: student info
- Correctly uses admin client (bypasses RLS for token-based access)

### Path E: Camp Lifecycle
- Template creation: `/camps/templates/new` -> `TemplateBuilderForm` -> `createCampTemplate`
- Instance creation: `/camps/new` -> `createCampInstance` (auto-creates sessions per template day)
- Daily feedback: `submitDailyFeedback` with upsert
- Daily results: `closeCampSessionResult` per student (validates mandatory fields)
- Final evaluation: `submitFinalEvaluation` updates student progression
- Camp completion: `completeCamp` sets status to 'completed'
- Student management: add/remove participants mid-camp

### Auth & Security
- Middleware protects all dashboard routes (redirects to `/login` if no user)
- Portal (`/portal/*`) and intake (`/intake/*`) correctly bypassed (public, token-based)
- Dashboard layout verifies coach record and filters navigation by role
- API routes have their own auth checks
- Login page redirects to `/` if already authenticated

### Additional Working Features
- Sequence evaluations (coach evaluates student progression)
- Ocean level evaluations (coach assesses ocean competency)
- Student archiving (soft delete)
- Profile photo upload/removal
- Student search with belt/status filters
- Session history with video link editing
- Intake form (2-stage: basic + extended)
- Audit log for all session close events
- Role-specific dashboards (Admin, Coordinator, Coach, Assistant)

---

## Recommended Before First Real Session

1. **Run the migration**: Execute `00012_production_fixes.sql` in Supabase SQL Editor
2. **Seed pilar_parts**: Populate the `pilar_parts` table with TSS methodology pilars and parts for each belt level
3. **Seed dropdown_options**: Add training venue and session type options to `dropdown_options` table (categories: `training_venue`, `session_type`)
4. **Seed rating_scales**: Add progressive rating scales for each belt level
5. **Configure environment variables**: Ensure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` are set for email functionality
6. **Create Supabase Storage bucket**: Create `avatars` bucket with public access
7. **Create admin account**: Use Supabase Auth to create the first admin user, then insert a coach record with `role: 'admin'`
8. **Test with one real session**: Have a coach complete the full 22-step cascade flow end-to-end with a test student before going live

---

## Build Verification

```
npx next build -> PASS (zero errors, zero warnings)
All 30 routes compile successfully
Static pages: 21/21
Dynamic routes: all server-rendered on demand
Middleware: 74.3 kB
```
