# CLAUDE.md — TSS BRAIN Operating Memory

Critical context to resume work on this codebase from scratch on any machine. Read top-to-bottom once, then keep open as reference.

---

## 1. What this app is

**TSS BRAIN** = the operating system for **The Surf Sequence** (TSS), Marcelo Castellanos's methodology + certification system for surf coaching. The platform serves four roles:

- **Platform admin (Marcelo)** — owns templates, doctrine, global content.
- **Academy coordinator** — runs a specific surf academy (e.g. Puro Surf, TSS El Salvador). Schedules services, enrols students, assigns coaches.
- **Coach** — runs sessions, follows TSS doctrine, evaluates students. Has a portal at `/coach-portal/[token]`.
- **Student** — receives a portal at `/portal/[token]`. Tracks belt progression, sees upcoming services, completes intake forms.

Public-facing access is **token-based** (no auth for students/coaches; their `portal_token` is the credential). Admin/coordinator log in via Supabase Auth.

---

## 2. Stack

- **Next.js 15** (App Router), React 18, TypeScript strict
- **Supabase** (Postgres + Auth + Storage). Two clients: `createClient()` (RLS-aware, default) and `createAdminClient()` (service-role, used only for portal-token resolution where no auth header is present)
- **Tailwind 4** + design tokens in `src/app/globals.css`
- **Resend** for transactional email (intake invitations, session reports)
- **Vercel** hosting. The user always says **"succes"** to confirm a migration has been applied in Supabase Editor (no migration runner — manual paste each time).
- **No tests**. The verification loop is: typecheck (`npx tsc --noEmit`) → push → Vercel deploys → Marcelo validates → reports back.

---

## 3. Architecture

### Routes
- `/portal/[token]` — student portal (PortalTabs.tsx with 7 tabs).
- `/coach-portal/[token]` — coach portal (CoachPortalTabs.tsx with 5 tabs + sub-routes for tools).
- `/(dashboard)/*` — Supabase-auth-protected admin/coordinator UI. Nested layout sets sidebar + bottom nav.
  - `/dashboard` — role-aware home (admin/coordinator/coach/assistant variants).
  - `/students`, `/coaches`, `/camps`, `/audit`, `/admin/*` — admin/coord-only.
  - `/camps` is the **calendar panorama** (Week/Month/Year toggle). Replaces a previous flat-list.
- `/lead/[token]` — public lead safety-intake form (a new lead enrolled from a camp lands here).
- `/intake/[token]` — full student intake (ocean quiz + waiver + medical).

### Multi-tenancy / academy scoping
- Most listing actions check `currentCoach.is_platform_admin`. If false, filter by `academy_id = currentCoach.academy_id`.
- `students.academy_id`, `coaches.academy_id`, `camp_instances.academy_id` are all set on create.
- `camp_templates` is **per-academy or global** (per M73). `academy_id IS NULL` = global, with explicit assignment via `academy_template_assignments` junction. Coordinator sees own customs ∪ globals assigned to their academy.

### Data model — critical tables
- `students`, `coaches`, `academies` — core actors.
- `lessons` — text-id keyed (e.g. `STP-013`, `COACH-STP-027`). Holds course content. Coach lessons use `course_section LIKE 'coach_%'`. Belt content uses `course_section IN ('white_belt','yellow_belt')`. `description_md` + 4 coach-tab fields (`coach_what_md`, `coach_deliver_md`, `coach_errors_md`, `coach_validate_md`).
- `drills_missions` — global drill/mission catalog, scoped by `step_id` (the STP it belongs to) + `belt` filter.
- `camp_templates` — services that academies can run. `service_kind` (surf_camp/surf_lesson/custom), `level_name` (TSS vocabulary: Beginner/Novice/Foundation/Emerging/Pre-Elite/Elite), `card_color`, `accent_color` (M72 — colors live on the template), `session_duration_minutes` (M71).
- `camp_instances` — scheduled service. `status` enum (draft/planned/active/completed/cancelled). `scheduled_time TEXT` ("HH:MM" or "HH:MM - HH:MM"), `head_coach_id`, `academy_id`.
- `camp_participants` — student↔camp join. `enrollment_status` (active/removed).
- `week_templates` + `week_template_slots` (M74) — recipe per academy. Apply to any week → bulk-creates camp_instances via existing `createCampInstance()`.
- `content_videos` (M64) — media attached to a lesson, drill_mission, OR step (one-parent CHECK). `media_type` (video/image/diagram).
- `coach_lesson_progress` — per-coach lesson read/quiz/completion state.

### Server actions
All sit under `src/lib/actions/`. Naming convention: `camps.ts`, `students.ts`, `leads.ts`, `coach-portal.ts`, `dashboard.ts`, `week-templates.ts`, `lead-invitation.ts`, etc. Every public action is `'use server'`. Pattern: do query → `revalidatePath(...)` → return data or throw.

---

## 4. Design system (locked in — never reinvent)

### Typography
- `--font-heading: 'Lora'` (was Playfair Display — Marcelo found it too decorative/"colocha"). All titulares use Lora 500/600/700.
- `--font-body: 'DM Sans'`. Body copy everywhere.
- `--font-mono: 'DM Mono'`. All labels/metadata/telemetry. Uppercase, tracking-wider, `text-[10px]`.
- `--font-tagline: 'Lora'` italic. Exclusively for taglines + doctrinal quotes ("Mental Cue of the Day", etc.).
- **Never use Playfair Display**. **Never inline `'Playfair Display, Georgia, serif'`** — always `'var(--font-heading)'`.

### Color palette
- `--tss-navy: #0A1628` (primary / hero backgrounds / CTAs).
- `--tss-cyan: #5AC3E7` (accent / active state / rails).
- Belt colors: `--belt-white #E8E8E8`, `--belt-yellow #F5C518`, `--belt-blue #1E6FBF`, `--belt-purple #7B4FBE`, `--belt-brown #7D4E27`, `--belt-black #111111`. Exported via `LEVEL_BELT_COLOR` in `src/lib/constants/belts.ts`.
- `--tss-gold` is **intentionally aliased to cyan** (per Brand Manual: gold is NOT a TSS color). Use `--tss-golden #FFD166` only for achievements/success semantics.
- **No `linear-gradient`** anywhere on cards/buttons. Only allowed gradient: `.tss-portal-bg` (gray-50 → white vertical, subtle).

### Component patterns (utilities in globals.css)
- `.tss-section-label` — mono uppercase + Lucide icon + thin horizontal rule. Use above every block.
- `.tss-stat-number` — Lora 600, size 1.875rem, tight tracking. Editorial telemetry numerals.
- `.tss-stat-suffix` — DM Mono unit qualifier ("h", "min").
- `.tss-portal-bg` — body bg gradient.
- `.tss-tagline` — Lora italic helper.

### Card hierarchy (3 types — don't invent new variants)
1. **Hero card**: `bg-[var(--tss-navy)] rounded-2xl p-5 shadow-md` + Lora titles white. For BeltJourney, Upcoming Camp.
2. **Content card**: `bg-white border border-gray-100 rounded-2xl shadow-sm p-5`. The default.
3. **Cue card**: `bg-white border-l-4 border-[var(--tss-cyan)]` + Lora italic content. For doctrinal quotes / Mental Cue.

### Stats = telemetry strip (no individual boxes)
One unified card with internal `border-l border-gray-100` dividers. Cells stack `tss-stat-number` + mono label.

### Belt Journey pattern
**Not** a horizontal 6-dot timeline (Marcelo rejected it). Solid "You are here" card with: big level name in Lora + linear progress bar in belt color + "Next:" hint row.

### Header chrome (all 3 portals)
Logo `h-12` centered + tagline in Lora italic. **Never** repeat the academy name as `<h1>` below the logo.

### Bottom tab bar (student + coach)
Active = 2px cyan top-rule (not navy fill). Labels DM Mono uppercase `text-[10px]`. Icons stroke 1.75 size 19.

### Service card visual language (`/camps` calendar)
- Card color = `camp_templates.card_color` (template-driven, M72).
- Capacity dots: filled = `emerald-500` ring, empty = translucent. Counter goes emerald when full.
- Coach signal: green check + name when assigned; amber alert + "No coach assigned" when missing.
- `paletteFor(card_color, accent_color)` in `src/components/camps/ServiceCard.tsx` auto-derives onDark from sRGB luminance.

### Anti-patterns to NEVER repeat
- ❌ Emojis in UI (use Lucide icons everywhere). Already swept via M67, dashboard nav, coach portal nav, brand.ts incident types.
- ❌ Roman numerals in lessons/drills (multiple cleanup migrations: M63 → M70). Always Arabic.
- ❌ Gradient on a button/card (only `.tss-portal-bg` is allowed).
- ❌ Playfair Display.
- ❌ Hard-coded colors on stat tiles — use the telemetry strip pattern.
- ❌ Double labels (label inside card + above card).

---

## 5. Build state (as of latest deploy)

### ✅ Completed (P1 — operational core)
- Multi-belt course system (WB STP-001..025 + YB STP-027..034 + YB onboarding/exit). Student + coach versions.
- Coach portal with Home/Courses/Tools/Plan/Rating tabs. Per-STP "What/Deliver/Errors/Validate" tab structure.
- Student portal with Home/Course/Let's Play/Sessions/Feedback/Glossary/My Coach tabs. Belt Journey, Mental Cue, telemetry stats.
- Lead lifecycle: `createLead()` + intake form at `/lead/[token]` + auto-email via Resend (`sendLeadInvitation`).
- Camp templates with day/block structure, service kind, capacity, duration (days + per-day H/M), card+accent colors, per-academy scope (M73 globals + assignments OR academy-owned customs).
- Camp instance: create empty from template, head-coach swap inline, schedule (start/end time) inline edit, cancel (soft delete via status='cancelled'), enrol existing student OR create lead inline + send intake link, lead status badge on detail page.
- **Calendar panorama** at `/camps` with Week / Month / Year toggle. Filters (kind/level/min-spots/date). Color-coded cards driven by template colors. Empty-day "+Add service" affordance. Today panel on the coordinator dashboard.
- **Week templates** (M74): academy-scoped recipe, "Apply to this week" stamps N camp_instances. UI at `/camps/week-templates`.
- Visual rebrand applied across student + coach + coordinator surfaces.

### ✅ Completed (P2 — encoding + brand polish)
- M63–M70: Roman → Arabic sweep across `lessons.title/subtitle/description_md/errors_md/coach_*_md/drill_md` + `drills_missions.title/description_md`.
- M70: literal `###Foo` → `### Foo` space fix.
- Emoji → Lucide migration (dashboard nav, coach portal nav, brand.ts incidents).
- TSS vocabulary: levels renamed Beginner/Novice/Foundation/Emerging/Pre-Elite/Elite (centralised in `LEVEL_NAMES`).
- Lora replaces Playfair as `--font-heading` everywhere (sed sweep of all `.tsx`).

### 🟡 Next (P3 — operational extensions, none started)
1. **Coach intake-pending visibility on the coach portal**. Lead badge currently shows on `/camps/[id]` but not when the coach opens the camp from their portal. Mirror the LeadStatusBadge there.
2. **Waiting list**: when `camp_participants.length === capacity_max`, the form blocks enrolment. Add a `waitlist_status` enum (`waiting` | `confirmed` | `declined`) and surface a "Waitlist" tab on `CampStudentManager`.
3. **Pricing / payment per enrolment**: `course_prices` exists but isn't tied to `camp_participants`. Need `price_cents` + `payment_status` columns + UI on the participant row.
4. **Seasonal bands on Year view**: wave season + vacation seasons + temporada baja as colored strips above the matrix. Per-academy table `academy_season_bands(start_date, end_date, label, color)`.
5. **Year view editable inline**: today read-only. Click a cell → set N → auto-create N camp_instances. Requires a sync algorithm (idempotent diff against existing instances that week).
6. **Bulk-clone last week**: shortcut button on an empty week → clones the previous week's structure (templates + coaches, no participants).

### Open architectural calls (need Marcelo's input before building)
- Whether the Year view's cells should be editable or stay read-only.
- Whether per-academy student rosters need a UI surface (today filtered server-side but no "my academy's students" header).
- Should Coach role be allowed to create custom drills (today only platform admin seeds via SQL)?

---

## 6. Conventions

### Migrations
- Numbered `00NNN_<verb>_<noun>.sql` in `supabase/migrations/`.
- Always idempotent: `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `INSERT … ON CONFLICT DO UPDATE/NOTHING`.
- Marcelo applies manually in the Supabase SQL Editor (no auto-runner). When he says **"succes"**, the migration is live.
- For text-content tweaks (Romans, emojis) prefer pure `REPLACE()` over regex when possible — the Supabase regex flavor has bitten us multiple times (`\m` + lookahead silently no-op'd; only `\y` + literal `REPLACE` work reliably).

### Server actions
- `'use server'` at the top.
- Always check `getCurrentCoach()` for academy/admin scoping.
- `revalidatePath(...)` after mutations so server components refresh.
- Use `createAdminClient()` ONLY when no auth context exists (portal-token resolution); everything else uses `createClient()`.

### UI
- Mobile-first. Test responsive on both phone and desktop.
- Tabs/cards/buttons use existing utilities (`.tss-stat-number`, `.tss-section-label`, etc.) instead of inventing new variants.
- All Lucide icons stroke-width 1.75 by default. Size 11–14 for inline, 16–22 for buttons/headers.
- All mono labels: `font-family: DM Mono, monospace`, `font-size: text-[10px]`, `uppercase`, `tracking-wider`.

### Git workflow
- Push to `main` directly (no PR flow). Vercel auto-deploys.
- Commit messages: imperative subject + body explaining WHY. Co-authored-by Claude Sonnet 4.6 footer.
- Always `npx tsc --noEmit` before push (pre-push hook also runs it).

### Common pitfalls (fix patterns the codebase repeats)
- **Safari `<input type="time">` placeholder bug**: empty input shows "12:30 p.m." visually but state is empty string → Save button stays disabled. Fix: prefill state with defaults like "09:00" + "10:30". Pattern in `CampScheduleManager.tsx`.
- **React rules-of-hooks after early returns**: never call `useMemo`/`useState` after a conditional `return` (broke Month view once). Plain inline computation if you're past an early return.
- **PostgreSQL ARE regex vs PCRE**: `\y` works for word boundaries; `\m` + lookaheads silently no-op. When in doubt, use plain `REPLACE()`.
- **Date timezone footguns**: parse dates as `new Date(dateString + 'T00:00:00')` instead of `new Date(dateString)` to avoid UTC shift back a day.
- **Supabase status `cancelled`** vs `canceled`: this enum uses British spelling.

---

## 7. Key files / where to look first

| What | File |
|---|---|
| Brand tokens + utility classes | `src/app/globals.css` |
| Belt/level constants + colors | `src/lib/constants/belts.ts` |
| Brand voice + vocabulary | `src/lib/constants/brand.ts` |
| Auth / role checks | `src/lib/actions/auth.ts` |
| Camps actions (calendar, templates, schedule, cancel) | `src/lib/actions/camps.ts` |
| Calendar component (Week/Month/Year) | `src/components/camps/CampCalendar.tsx` |
| Service card (color-coded) | `src/components/camps/ServiceCard.tsx` |
| Student portal | `src/app/portal/[token]/portal-tabs.tsx` |
| Coach portal | `src/app/coach-portal/[token]/CoachPortalTabs.tsx` |
| Coordinator dashboard | `src/app/(dashboard)/dashboard/page.tsx` |
| Belt Journey visual | `src/components/portal/BeltJourney.tsx` |
| Lead creation + intake | `src/lib/actions/leads.ts` + `src/lib/actions/lead-invitation.ts` |
| Week Template editor | `src/components/camp/WeekTemplateEditor.tsx` |

Plan file (running design + decision log): `~/.claude/plans/quiero-expresarte-el-flow-transient-dragonfly.md`. Read it before proposing big changes — Marcelo has annotated many decisions there.

---

## 8. Env vars (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (optional, defaults to `onboarding@resend.dev`)
- `NEXT_PUBLIC_APP_URL` — used to build absolute links in transactional emails (intake invitations, session reports). Required for production-quality emails.

---

## 9. The voice (talk to Marcelo this way)

- **Spanish first**, English for code/commit messages.
- **Be honest** — Marcelo will push back hard ("¿sos programador o no?") if a fix sounds like hand-waving. When something is broken, name what you're going to verify before you change it.
- **Don't oversell**. If a feature is 70% there or has open architectural questions, say so.
- **Brand language**: never use "stoke", "shred", "gnarly" (forbidden per Brand Manual §3). Use TSS vocabulary: Mission, Session, Level, Belt, Coach, Evolve.

---

*Last updated after commit `8868caf` — design system applied to coach portal + coordinator dashboard.*
