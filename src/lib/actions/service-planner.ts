'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { BELT_RANK, canCoachBelt, type BeltLevel } from '@/lib/constants/belts';
import { GRADUATION_RULES } from '@/lib/constants/graduation';

// ─── Types ─────────────────────────────────────────────────────────

// M45 — A summary of one day in a multi-day camp. The UI uses this to
// render the day-picker so the coach can switch between planned days.
export interface ServiceDaySummary {
  camp_session_id: string;
  day_number: number;
  session_date: string;
  completion_state: 'planned' | 'in_progress' | 'closed';
}

export interface ServicePlanData {
  camp: {
    id: string;
    camp_name: string;
    start_date: string;
    end_date: string;
    status: string;
    scheduled_time: string | null;
    template_name: string | null;
    service_kind: string | null;
    target_belt: string | null;
    // Accreditation context for the final evaluation UI.
    coach_max_belt: string | null;
    viewer_is_head_coach: boolean;
  };
  // M45 — list of all days (one camp_session per day) so the UI can render
  // a day picker. `selectedDay` is the day currently loaded in `plan` and
  // `students[].block` below.
  daySummaries: ServiceDaySummary[];
  selectedDay: ServiceDaySummary;
  plan: {
    venue_analysis: string | null;
    venue_go_no_go: 'go' | 'modified' | 'no_go' | null;
    venue_wave_size: string | null;
    venue_wind: string | null;
    venue_tide: string | null;
    venue_hazards: string | null;
    // M48 — extra standardized venue fields
    venue_crowd: string | null;
    venue_water_temp: string | null;
    venue_sky: string | null;
    warm_up_drill_id: string | null;
    warm_up_custom: string | null;
    mental_hack: string | null;
    notes_general: string | null;
    completion_state: 'planned' | 'in_progress' | 'closed';
    started_at: string | null;
    closed_at: string | null;
  };
  students: ServicePlanStudent[];
  // Coach's available tools (filtered by max_belt_permission). The
  // detail fields (description_md, success_criteria, reps_recommended)
  // power the DrillDetailModal popover the coach taps to read HOW to
  // teach the drill/mission to the student.
  availableDrills: Array<{
    id: string;
    step_id: string | null;
    title: string;
    type: 'drill' | 'mission';
    block_name: string | null;
    belt: string | null;
    key_words: string[] | null;
    time_estimate: string | null;
    reps_recommended: string | null;
    description_md: string | null;
    success_criteria: string[] | null;
  }>;
  // Canonical STP catalog (for picking sequence focus)
  stpCatalog: Array<{ id: string; title: string; pillar: string | null; display_order: number }>;
  // Belt-specific sequence rated in the FINAL evaluation (graduation check).
  graduationCatalog: Array<{ id: string; title: string; pillar: string | null; display_order: number }>;
  // Academy board inventory available for assignment (M108).
  availableBoards: Array<{ id: string; code: string; board_type: string | null; shape: string | null; length_feet: number | null; length_inches: number | null; volume_liters: string | null; status: string }>;
  // True when the viewer is an accepted assistant (view-only, no edits).
  readOnly: boolean;
  // M108 Fase 4 — board ids already taken by ANOTHER service on the selected
  // day's date (same academy). The picker hides/disables these to prevent
  // double-booking. Date-aware, so a board free today isn't blocked by an
  // unclosed plan on another date.
  boardConflictIds: string[];
  // M50 — per-(student, step) coach_rating so the cyan StarRating in
  // BlockEvalSection can show the current value. Empty when no rating
  // has been given yet.
  coachRatingByStudentStep: Record<string, Record<string, number>>;
  // M44 — template plan (the recipe the coordinator pre-built).
  // Coach sees this as a reference and can apply blocks to all students
  // with one tap so they don't replan from scratch.
  templatePlan: Array<{
    day_number: number;
    day_goal: string | null;
    venue_default: string | null;
    ocean_condition_target: string | null;
    evaluation_focus: string | null;
    day_notes: string | null;
    // M77 — per-day support material (PPT / video / image / diagram).
    media: Array<{
      id: string;
      url: string;
      label: string | null;
      caption: string | null;
      media_type: 'video' | 'image' | 'diagram' | 'document';
      display_order: number;
    }>;
    blocks: Array<{
      block_order: number;
      pilar: string | null;
      pilar_part: string | null;
      block_type: string | null;
      mission_time: string | null;
      repetitions_default: number | null;
      warm_up: string | null;
      simulation: string | null;
      mental_hack: string | null;
      evaluation_focus: string | null;
      step_id: string | null;
      step_title: string | null;
      // Resolved drill (canonical via FK, or custom freeform text).
      drill_id: string | null;
      drill_custom: string | null;
      drill: {
        title: string;
        description_md: string | null;
        key_words: string[] | null;
        success_criteria: string[] | null;
        time_estimate: string | null;
      } | null;
      // Resolved mission.
      mission_id: string | null;
      mission_custom: string | null;
      mission: {
        title: string;
        description_md: string | null;
        key_words: string[] | null;
        success_criteria: string[] | null;
        time_estimate: string | null;
      } | null;
      // M78 — Activity taxonomy fields.
      explain_md: string | null;
      demonstrate_md: string | null;
      simulate_md: string | null;
      feedback_md: string | null;
      equipment: string | null;
      activity_subtype: string | null;
      step_ids: string[] | null;
    }>;
  }>;
  templateMeta: {
    id: string | null;
    name: string | null;
    duration_days: number | null;
  };
}

export interface StudentProfileSnapshot {
  age: number | null;            // computed from date_of_birth if age column is empty
  weight: number | null;
  height: number | null;
  ocean_level: string | null;
  stance: string | null;
  goofy_or_regular: string | null;
  surf_experience_years: number | null;
  surf_frequency: string | null;
  swim_level: string | null;
  board_type: string | null;
  board_length_feet: string | null;
  board_length_inches: string | null;
  board_volume_liters: string | null;
  favorite_wave_size: string | null;
  progression_status: string | null;
  current_sequence_number: number | null;
  current_step_order: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  primary_goal: string | null;
  personal_goal: string | null;
  goal_short_term: string | null;
  goal_mid_term: string | null;
  goal_long_term: string | null;
  fears_phobias: string | null;
  biggest_barrier: string | null;
  injuries: string | null;
  allergies: string | null;
  medical_notes: string | null;
  risk_notes: string | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  current_focus_area: string | null;
  next_recommended_focus: string | null;
  coach_notes_general: string | null;
  learning_profile_primary: string | null;
  ocean_quiz_score: number | null;
}

// One entry in a student's recent training history — coach session or
// self-training, merged + sorted so the coach sees the full picture.
export interface RecentSessionEntry {
  date: string | null;
  type: 'coach' | 'self';
  label: string;
  status: string | null;
}

// Summary of the student's STP self-ratings (and any official coach
// ratings) — lets the coach spot over/under-estimation before planning.
export interface StepRatingSummary {
  selfRatedCount: number;
  avgSelfRating: number | null;
  coachRatedCount: number;
  avgCoachRating: number | null;
}

export interface ServicePlanBlock {
  id: string | null;
  order_index: number;
  step_id: string | null;
  land_drill_id: string | null;
  land_drill_custom: string | null;
  water_drill_id: string | null;
  water_drill_custom: string | null;
  objective_text: string | null;
  notes_pre: string | null;
  status: 'achieved' | 'partial' | 'not_yet' | null;
  notes_post: string | null;
  board_type: string | null;
  board_size_feet: number | null;
  board_size_inches: number | null;
  board_id: string | null;  // linked inventory board (M108)
  // M47 — Coach-rated, per-block-per-student (filled at close).
  focus_level: number | null;   // 1-5, how present + engaged
  flow_channel: number | null;  // 1=bored, 3=optimal, 5=frustrated
  day_objective_status?: string | null; // session-level: achieved | partial | not_yet (block 0)
}

export interface ServicePlanStudent {
  student_id: string;
  display_name: string;
  belt_level: string | null;
  photo_url: string | null;
  profile: StudentProfileSnapshot;
  recentSessions: RecentSessionEntry[];
  stepRatings: StepRatingSummary;
  // M45 — all blocks for the SELECTED day, sorted by order_index. A day
  // can have multiple blocks (multi-mission day, multi-STP focus, etc).
  blocks: ServicePlanBlock[];
}

// ─── Load: plan + students + tools ─────────────────────────────────

export async function getServicePlan(
  token: string,
  campInstanceId: string,
  dayNumberArg?: number
): Promise<ServicePlanData | null> {
  const admin = createAdminClient();

  // Resolve coach + verify they own this camp_instance
  const { data: coach } = await admin
    .from('coaches')
    .select('id, max_belt_permission')
    .eq('portal_token', token)
    .single();
  if (!coach) return null;

  const { data: camp } = await admin
    .from('camp_instances')
    .select(
      'id, camp_name, start_date, end_date, status, scheduled_time, coach_id, head_coach_id, template_id, academy_id, camp_templates:template_id(template_name, service_kind, duration_days, includes_course_key)'
    )
    .eq('id', campInstanceId)
    .single();
  if (!camp) return null;
  // Owner (coach/head coach) gets full edit. An accepted assistant gets
  // read-only access (can view the plan + student info, cannot modify).
  const isOwner = camp.coach_id === coach.id || camp.head_coach_id === coach.id;
  let readOnly = false;
  if (!isOwner) {
    const { data: asg } = await admin
      .from('service_staff')
      .select('id')
      .eq('camp_instance_id', campInstanceId)
      .eq('coach_id', coach.id)
      .eq('role', 'assistant')
      .eq('status', 'accepted')
      .maybeSingle();
    if (!asg) return null;
    readOnly = true;
  }

  const tpl = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;

  // M45 — load all days (camp_sessions) for this camp + their service_plans
  // so the UI can render a day picker. Pick the requested day (or default
  // to the earliest non-closed day) as the "selected" day to load.
  const { data: campSessions } = await admin
    .from('camp_sessions')
    .select('id, day_number, session_date')
    .eq('camp_instance_id', campInstanceId)
    .order('day_number');
  const sessions = campSessions ?? [];
  if (sessions.length === 0) return null;

  const sessionIds = sessions.map((s: any) => s.id);
  const { data: plansForCamp } = await admin
    .from('service_plans')
    .select('*')
    .in('camp_session_id', sessionIds);
  const planBySessionId = new Map<string, any>();
  for (const p of plansForCamp ?? []) planBySessionId.set(p.camp_session_id, p);

  const daySummaries: ServiceDaySummary[] = sessions.map((s: any) => ({
    camp_session_id: s.id,
    day_number: s.day_number,
    session_date: s.session_date,
    completion_state: (planBySessionId.get(s.id)?.completion_state as any) ?? 'planned',
  }));

  // Pick the day to load. Order of preference:
  // 1. The explicit dayNumberArg if it exists
  // 2. The first non-closed day
  // 3. Day 1
  let selectedDay: ServiceDaySummary;
  if (dayNumberArg) {
    selectedDay =
      daySummaries.find((d) => d.day_number === dayNumberArg) ?? daySummaries[0];
  } else {
    selectedDay =
      daySummaries.find((d) => d.completion_state !== 'closed') ?? daySummaries[0];
  }

  const plan = planBySessionId.get(selectedDay.camp_session_id) ?? null;

  // Students enrolled in this camp_instance — pull the full profile
  // snapshot so the coach can review level, goals, fears, injuries,
  // medical info and last-session history before planning.
  // NOTE: students has no display_name column (that's on coaches) — we
  // compose it from first_name + last_name.
  const { data: participants } = await admin
    .from('camp_participants')
    .select(
      'student_id, students:student_id(' +
        'id, first_name, last_name, belt_level, photo_url, age, date_of_birth, weight, height, ocean_level, ' +
        'ocean_quiz_score, stance, goofy_or_regular, surf_experience_years, surf_frequency, swim_level, ' +
        'board_type, board_length_feet, board_length_inches, board_volume_liters, ' +
        'favorite_wave_size, progression_status, ' +
        'current_sequence_number, current_step_order, ' +
        'emergency_contact_name, emergency_contact_phone, ' +
        'primary_goal, personal_goal, goal_short_term, goal_mid_term, goal_long_term, ' +
        'fears_phobias, biggest_barrier, injuries, allergies, medical_notes, risk_notes, ' +
        'last_session_date, last_session_mission, last_session_status, last_homework, ' +
        'current_focus_area, next_recommended_focus, coach_notes_general, learning_profile_primary' +
      ')'
    )
    .eq('camp_instance_id', campInstanceId)
    .eq('enrollment_status', 'active');

  const studentIds = (participants ?? []).map((p: any) => p.student_id);

  // M45 — All blocks for the SELECTED day, grouped per student.
  const { data: blocks } = await admin
    .from('service_plan_blocks')
    .select('*')
    .eq('camp_session_id', selectedDay.camp_session_id)
    .order('order_index');
  const blocksByStudent = new Map<string, any[]>();
  for (const b of blocks ?? []) {
    const arr = blocksByStudent.get(b.student_id) ?? [];
    arr.push(b);
    blocksByStudent.set(b.student_id, arr);
  }

  // Recent training history per student — coach sessions
  // (student_session_results) + self-training (self_training_sessions),
  // merged and sorted so the coach sees the full picture.
  const recentByStudent: Record<string, RecentSessionEntry[]> = {};
  if (studentIds.length > 0) {
    const [coachSessRes, selfSessRes] = await Promise.all([
      admin
        .from('student_session_results')
        .select('student_id, created_at, status, mission, coach_feedback, standalone_sessions(mission)')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }),
      admin
        .from('self_training_sessions')
        .select('student_id, created_at, session_date, drill_name, intention_text, completed')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }),
    ]);
    for (const r of coachSessRes.data ?? []) {
      const ss = Array.isArray(r.standalone_sessions)
        ? r.standalone_sessions[0]
        : r.standalone_sessions;
      // Camp/service sessions have no standalone_sessions row, so fall back
      // to a snippet of the coach's written feedback so the coach sees what
      // the last in-person class actually covered (not a generic label).
      const fbSnippet = r.coach_feedback
        ? r.coach_feedback.replace(/\s+/g, ' ').trim().slice(0, 60)
        : null;
      (recentByStudent[r.student_id] ??= []).push({
        date: r.created_at,
        type: 'coach',
        label: ss?.mission || r.mission || fbSnippet || 'Coach session',
        status: r.status,
      });
    }
    for (const r of selfSessRes.data ?? []) {
      (recentByStudent[r.student_id] ??= []).push({
        date: r.session_date || r.created_at,
        type: 'self',
        label: r.drill_name || r.intention_text || 'Self-training',
        status: r.completed ? 'completed' : 'incomplete',
      });
    }
    for (const sid of Object.keys(recentByStudent)) {
      recentByStudent[sid].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
      recentByStudent[sid] = recentByStudent[sid].slice(0, 10);
    }
  }

  // STP self-rating summary per student (+ official coach ratings)
  // and a per-(student, step) coach_rating map so the eval UI can
  // show the current cyan star value the coach already gave.
  const ratingsByStudent: Record<string, { self: number[]; coach: number[] }> = {};
  const coachRatingByStudentStep: Record<string, Record<string, number>> = {};
  if (studentIds.length > 0) {
    const { data: ratings } = await admin
      .from('student_step_ratings')
      .select('student_id, step_id, current_rating, coach_rating')
      .in('student_id', studentIds);
    for (const r of ratings ?? []) {
      const e = (ratingsByStudent[r.student_id] ??= { self: [], coach: [] });
      if (r.current_rating && r.current_rating > 0) e.self.push(r.current_rating);
      if (r.coach_rating && r.coach_rating > 0) {
        e.coach.push(r.coach_rating);
        const stepMap = (coachRatingByStudentStep[r.student_id] ??= {});
        stepMap[r.step_id] = r.coach_rating;
      }
    }
  }
  const avgOf = (arr: number[]): number | null =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  // Compute age from date_of_birth (fallback when the age column is empty)
  const ageFrom = (age: number | null, dob: string | null): number | null => {
    if (age != null) return age;
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a >= 0 && a < 120 ? a : null;
  };

  const students: ServicePlanStudent[] = (participants ?? []).map((p: any) => {
    const s = Array.isArray(p.students) ? p.students[0] : p.students;
    const studentBlocks = blocksByStudent.get(p.student_id) ?? [];
    const rr = ratingsByStudent[p.student_id] ?? { self: [], coach: [] };
    return {
      student_id: p.student_id,
      display_name:
        `${s?.first_name ?? ''} ${s?.last_name ?? ''}`.trim() || 'Student',
      belt_level: s?.belt_level ?? null,
      photo_url: s?.photo_url ?? null,
      recentSessions: recentByStudent[p.student_id] ?? [],
      stepRatings: {
        selfRatedCount: rr.self.length,
        avgSelfRating: avgOf(rr.self),
        coachRatedCount: rr.coach.length,
        avgCoachRating: avgOf(rr.coach),
      },
      profile: {
        age: ageFrom(s?.age ?? null, s?.date_of_birth ?? null),
        weight: s?.weight ?? null,
        height: s?.height ?? null,
        ocean_level: s?.ocean_level ?? null,
        stance: s?.stance ?? null,
        goofy_or_regular: s?.goofy_or_regular ?? null,
        surf_experience_years: s?.surf_experience_years ?? null,
        surf_frequency: s?.surf_frequency ?? null,
        swim_level: s?.swim_level ?? null,
        board_type: s?.board_type ?? null,
        board_length_feet: s?.board_length_feet ?? null,
        board_length_inches: s?.board_length_inches ?? null,
        board_volume_liters: s?.board_volume_liters ?? null,
        favorite_wave_size: s?.favorite_wave_size ?? null,
        progression_status: s?.progression_status ?? null,
        current_sequence_number: s?.current_sequence_number ?? null,
        current_step_order: s?.current_step_order ?? null,
        emergency_contact_name: s?.emergency_contact_name ?? null,
        emergency_contact_phone: s?.emergency_contact_phone ?? null,
        primary_goal: s?.primary_goal ?? null,
        personal_goal: s?.personal_goal ?? null,
        goal_short_term: s?.goal_short_term ?? null,
        goal_mid_term: s?.goal_mid_term ?? null,
        goal_long_term: s?.goal_long_term ?? null,
        fears_phobias: s?.fears_phobias ?? null,
        biggest_barrier: s?.biggest_barrier ?? null,
        injuries: s?.injuries ?? null,
        allergies: s?.allergies ?? null,
        medical_notes: s?.medical_notes ?? null,
        risk_notes: s?.risk_notes ?? null,
        last_session_date: s?.last_session_date ?? null,
        last_session_mission: s?.last_session_mission ?? null,
        last_session_status: s?.last_session_status ?? null,
        last_homework: s?.last_homework ?? null,
        current_focus_area: s?.current_focus_area ?? null,
        next_recommended_focus: s?.next_recommended_focus ?? null,
        coach_notes_general: s?.coach_notes_general ?? null,
        learning_profile_primary: s?.learning_profile_primary ?? null,
        ocean_quiz_score: s?.ocean_quiz_score ?? null,
      },
      blocks: studentBlocks.map((b: any) => ({
        id: b.id ?? null,
        order_index: b.order_index ?? 0,
        step_id: b.step_id ?? null,
        land_drill_id: b.land_drill_id ?? null,
        land_drill_custom: b.land_drill_custom ?? null,
        water_drill_id: b.water_drill_id ?? null,
        water_drill_custom: b.water_drill_custom ?? null,
        objective_text: b.objective_text ?? null,
        notes_pre: b.notes_pre ?? null,
        status: b.status ?? null,
        notes_post: b.notes_post ?? null,
        whats_next: b.whats_next ?? null,
        board_type: b.board_type ?? null,
        board_size_feet: b.board_size_feet ?? null,
        board_size_inches: b.board_size_inches ?? null,
        board_id: b.board_id ?? null,
        focus_level: b.focus_level ?? null,
        flow_channel: b.flow_channel ?? null,
        day_objective_status: b.day_objective_status ?? null,
      })),
    };
  });

  // Coach's available drills (filtered by belt)
  const beltRank: Record<string, number> = {
    white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6,
  };
  const myBeltShort = (coach.max_belt_permission || '').replace('_belt', '');
  const myRank = beltRank[myBeltShort] ?? 6;
  const { data: drillsRaw } = await admin
    .from('drills_missions')
    .select(
      'id, step_id, title, type, block_name, belt, key_words, time_estimate, ' +
        'reps_recommended, description_md, success_criteria, display_order'
    )
    .eq('active', true)
    .order('display_order');
  const availableDrills = (drillsRaw ?? []).filter(
    (d: any) => (beltRank[d.belt] ?? 1) <= myRank
  );

  // STP catalog for the planner's sequence-focus picker (white belt 25 STPs).
  const { data: stpRows } = await admin
    .from('lessons')
    .select('id, title, pillar, display_order')
    .eq('course_section', 'white_belt')
    .eq('active', true)
    .order('display_order');

  // Graduation catalog — belt-aware. The FINAL evaluation rates the full
  // sequence the belt requires: White Belt = the 25 WB STPs; Yellow Belt =
  // White + Yellow (33 STPs) so all fundamentals are re-confirmed. Driven
  // by the belt's GRADUATION_RULES.sections.
  const gradRule = tpl?.includes_course_key ? GRADUATION_RULES[tpl.includes_course_key] : undefined;
  const gradSections = gradRule?.sections ?? ['white_belt'];
  const { data: gradRows } =
    gradSections.length === 1 && gradSections[0] === 'white_belt'
      ? { data: stpRows }
      : await admin
          .from('lessons')
          .select('id, title, pillar, display_order')
          .in('course_section', gradSections)
          .eq('active', true)
          .order('display_order');

  // M44 — load the template plan if there is a template attached.
  // Days come from camp_template_days, blocks from camp_template_blocks
  // (joined via template_day_id). Phase B (read view) needs drill +
  // mission FULL detail inline so we fetch + merge them here.
  let templatePlan: ServicePlanData['templatePlan'] = [];
  const templateMeta: ServicePlanData['templateMeta'] = {
    id: (camp as any).template_id ?? null,
    name: tpl?.template_name ?? null,
    duration_days: tpl?.duration_days ?? null,
  };
  if ((camp as any).template_id) {
    const { data: tplDays } = await admin
      .from('camp_template_days')
      .select('id, day_number, day_goal, venue_default, ocean_condition_target, evaluation_focus, day_notes')
      .eq('template_id', (camp as any).template_id)
      .order('day_number');
    if (tplDays && tplDays.length > 0) {
      const dayIds = tplDays.map((d: any) => d.id);
      const { data: tplBlocks } = await admin
        .from('camp_template_blocks')
        .select(
          'template_day_id, block_order, pilar, pilar_part, block_type, mission_time, repetitions_default, warm_up, simulation, mental_hack, evaluation_focus, step_id, drill_id, drill_custom, mission_id, mission_custom, explain_md, demonstrate_md, simulate_md, feedback_md, equipment, activity_subtype, step_ids'
        )
        .in('template_day_id', dayIds)
        .order('block_order');

      // Resolve drill + mission + step titles in one round-trip each.
      const drillIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.drill_id).filter(Boolean)));
      const missionIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.mission_id).filter(Boolean)));
      const stepIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.step_id).filter(Boolean)));

      const drillMap = new Map<string, any>();
      const missionMap = new Map<string, any>();
      const stepMap = new Map<string, any>();
      if (drillIds.length > 0 || missionIds.length > 0) {
        const { data: dms } = await admin
          .from('drills_missions')
          .select('id, title, description_md, key_words, success_criteria, time_estimate, type')
          .in('id', [...drillIds, ...missionIds]);
        for (const d of dms ?? []) {
          if (d.type === 'drill') drillMap.set(d.id, d);
          else if (d.type === 'mission') missionMap.set(d.id, d);
        }
      }
      if (stepIds.length > 0) {
        const { data: stps } = await admin
          .from('lessons')
          .select('id, title')
          .in('id', stepIds);
        for (const s of stps ?? []) stepMap.set(s.id, s);
      }

      // M77 — per-day support media so the coach portal CampPlanReader
      // can surface PPT / video / image strips inline. Fail-soft.
      const mediaByDay = new Map<string, any[]>();
      try {
        const { data: mediaRows } = await admin
          .from('content_videos')
          .select('id, template_day_id, url, label, caption, media_type, display_order')
          .in('template_day_id', tplDays.map((d: any) => d.id))
          .order('display_order');
        for (const m of mediaRows ?? []) {
          if (!m.template_day_id) continue;
          const arr = mediaByDay.get(m.template_day_id) ?? [];
          arr.push(m);
          mediaByDay.set(m.template_day_id, arr);
        }
      } catch (e) {
        console.error('[getServicePlan] media fetch failed:', e);
      }

      templatePlan = tplDays.map((d: any) => ({
        day_number: d.day_number,
        day_goal: d.day_goal,
        venue_default: d.venue_default ?? null,
        ocean_condition_target: d.ocean_condition_target ?? null,
        evaluation_focus: d.evaluation_focus ?? null,
        day_notes: d.day_notes ?? null,
        media: mediaByDay.get(d.id) ?? [],
        blocks: (tplBlocks ?? [])
          .filter((b: any) => b.template_day_id === d.id)
          .map((b: any) => {
            const drillRow = b.drill_id ? drillMap.get(b.drill_id) : null;
            const missionRow = b.mission_id ? missionMap.get(b.mission_id) : null;
            const stepRow = b.step_id ? stepMap.get(b.step_id) : null;
            return {
              block_order: b.block_order,
              pilar: b.pilar ?? null,
              pilar_part: b.pilar_part ?? null,
              block_type: b.block_type ?? null,
              mission_time: b.mission_time ?? null,
              repetitions_default: b.repetitions_default ?? null,
              warm_up: b.warm_up ?? null,
              simulation: b.simulation ?? null,
              mental_hack: b.mental_hack ?? null,
              evaluation_focus: b.evaluation_focus ?? null,
              step_id: b.step_id ?? null,
              step_title: stepRow?.title ?? null,
              drill_id: b.drill_id ?? null,
              drill_custom: b.drill_custom ?? null,
              drill: drillRow
                ? {
                    title: drillRow.title,
                    description_md: drillRow.description_md ?? null,
                    key_words: drillRow.key_words ?? null,
                    success_criteria: drillRow.success_criteria ?? null,
                    time_estimate: drillRow.time_estimate ?? null,
                  }
                : null,
              mission_id: b.mission_id ?? null,
              mission_custom: b.mission_custom ?? null,
              mission: missionRow
                ? {
                    title: missionRow.title,
                    description_md: missionRow.description_md ?? null,
                    key_words: missionRow.key_words ?? null,
                    success_criteria: missionRow.success_criteria ?? null,
                    time_estimate: missionRow.time_estimate ?? null,
                  }
                : null,
              // M78 — Activity taxonomy fields.
              explain_md: b.explain_md ?? null,
              demonstrate_md: b.demonstrate_md ?? null,
              simulate_md: b.simulate_md ?? null,
              feedback_md: b.feedback_md ?? null,
              equipment: b.equipment ?? null,
              activity_subtype: b.activity_subtype ?? null,
              step_ids: b.step_ids ?? null,
            };
          }),
      }));
    }
  }

  // Board inventory for the camp's academy — for the planner picker.
  // Exclude retired boards and boards currently rented out to walk-ins
  // (those are held by the rentals engine and aren't available to assign).
  let availableBoards: ServicePlanData['availableBoards'] = [];
  let boardConflictIds: string[] = [];
  if ((camp as any).academy_id) {
    const { data: boardRows } = await admin
      .from('boards')
      .select('id, code, board_type, shape, length_feet, length_inches, volume_liters, status')
      .eq('academy_id', (camp as any).academy_id)
      .not('status', 'in', '(retired,rented)')
      .order('code');
    availableBoards = (boardRows ?? []) as any[];

    // Fase 4 — boards already booked by ANOTHER service on the same date.
    if (selectedDay.session_date) {
      const { data: sameDay } = await admin
        .from('camp_sessions')
        .select('id, camp_instances:camp_instance_id!inner(academy_id)')
        .eq('session_date', selectedDay.session_date)
        .eq('camp_instances.academy_id', (camp as any).academy_id)
        .neq('id', selectedDay.camp_session_id);
      const otherSessionIds = (sameDay ?? []).map((s: any) => s.id);
      if (otherSessionIds.length > 0) {
        const { data: takenRows } = await admin
          .from('service_plan_blocks')
          .select('board_id')
          .in('camp_session_id', otherSessionIds)
          .not('board_id', 'is', null);
        boardConflictIds = Array.from(new Set((takenRows ?? []).map((r: any) => r.board_id)));
      }
    }
  }

  return {
    camp: {
      id: camp.id,
      camp_name: camp.camp_name,
      start_date: camp.start_date,
      end_date: camp.end_date,
      status: camp.status,
      scheduled_time: camp.scheduled_time ?? null,
      template_name: tpl?.template_name ?? null,
      service_kind: tpl?.service_kind ?? null,
      target_belt: tpl?.includes_course_key ?? null,
      coach_max_belt: coach.max_belt_permission ?? null,
      viewer_is_head_coach: camp.head_coach_id === coach.id,
    },
    plan: {
      venue_analysis: plan?.venue_analysis ?? null,
      venue_go_no_go: plan?.venue_go_no_go ?? null,
      venue_wave_size: plan?.venue_wave_size ?? null,
      venue_wind: plan?.venue_wind ?? null,
      venue_tide: plan?.venue_tide ?? null,
      venue_hazards: plan?.venue_hazards ?? null,
      venue_crowd: plan?.venue_crowd ?? null,
      venue_water_temp: plan?.venue_water_temp ?? null,
      venue_sky: plan?.venue_sky ?? null,
      warm_up_drill_id: plan?.warm_up_drill_id ?? null,
      warm_up_custom: plan?.warm_up_custom ?? null,
      mental_hack: plan?.mental_hack ?? null,
      notes_general: plan?.notes_general ?? null,
      completion_state: (plan?.completion_state as any) ?? 'planned',
      started_at: plan?.started_at ?? null,
      closed_at: plan?.closed_at ?? null,
    },
    daySummaries,
    selectedDay,
    students,
    availableDrills: availableDrills as any[],
    stpCatalog: (stpRows ?? []) as any[],
    graduationCatalog: (gradRows ?? stpRows ?? []) as any[],
    availableBoards,
    boardConflictIds,
    readOnly,
    coachRatingByStudentStep,
    templatePlan,
    templateMeta,
  };
}

// ─── Lightweight template-plan fetch for read-only surfaces
// (camp detail page, coach Plan tab). Pulls the same templatePlan +
// templateMeta as getServicePlan but without needing a coach token /
// camp session id — just the camp_instance id.
export async function getCampPlanForRead(
  campInstanceId: string,
): Promise<{
  templatePlan: ServicePlanData['templatePlan'];
  templateMeta: ServicePlanData['templateMeta'];
}> {
  const admin = createAdminClient();

  const { data: camp } = await admin
    .from('camp_instances')
    .select('template_id, camp_templates(template_name, duration_days)')
    .eq('id', campInstanceId)
    .maybeSingle();

  const tpl: any = Array.isArray((camp as any)?.camp_templates)
    ? (camp as any).camp_templates[0]
    : (camp as any)?.camp_templates;

  const templateMeta: ServicePlanData['templateMeta'] = {
    id: (camp as any)?.template_id ?? null,
    name: tpl?.template_name ?? null,
    duration_days: tpl?.duration_days ?? null,
  };

  if (!templateMeta.id) return { templatePlan: [], templateMeta };

  const { data: tplDays } = await admin
    .from('camp_template_days')
    .select('id, day_number, day_goal, venue_default, ocean_condition_target, evaluation_focus, day_notes')
    .eq('template_id', templateMeta.id)
    .order('day_number');

  if (!tplDays || tplDays.length === 0) return { templatePlan: [], templateMeta };

  const dayIds = tplDays.map((d: any) => d.id);
  const { data: tplBlocks } = await admin
    .from('camp_template_blocks')
    .select(
      'template_day_id, block_order, pilar, pilar_part, block_type, mission_time, repetitions_default, warm_up, simulation, mental_hack, evaluation_focus, step_id, drill_id, drill_custom, mission_id, mission_custom, explain_md, demonstrate_md, simulate_md, feedback_md, equipment, activity_subtype, step_ids'
    )
    .in('template_day_id', dayIds)
    .order('block_order');

  const drillIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.drill_id).filter(Boolean)));
  const missionIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.mission_id).filter(Boolean)));
  const stepIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.step_id).filter(Boolean)));

  const drillMap = new Map<string, any>();
  const missionMap = new Map<string, any>();
  const stepMap = new Map<string, any>();
  if (drillIds.length > 0 || missionIds.length > 0) {
    const { data: dms } = await admin
      .from('drills_missions')
      .select('id, title, description_md, key_words, success_criteria, time_estimate, type')
      .in('id', [...drillIds, ...missionIds]);
    for (const d of dms ?? []) {
      if (d.type === 'drill') drillMap.set(d.id, d);
      else if (d.type === 'mission') missionMap.set(d.id, d);
    }
  }
  if (stepIds.length > 0) {
    const { data: stps } = await admin
      .from('lessons')
      .select('id, title')
      .in('id', stepIds);
    for (const s of stps ?? []) stepMap.set(s.id, s);
  }

  // M77 — per-day support media (PPT / video / image / diagram).
  // Fail-soft: if the column doesn't exist yet, render the plan without
  // support material instead of crashing the whole page.
  const mediaByDay = new Map<string, any[]>();
  try {
    const { data: mediaRows } = await admin
      .from('content_videos')
      .select('id, template_day_id, url, label, caption, media_type, display_order')
      .in('template_day_id', dayIds)
      .order('display_order');
    for (const m of mediaRows ?? []) {
      if (!m.template_day_id) continue;
      const arr = mediaByDay.get(m.template_day_id) ?? [];
      arr.push(m);
      mediaByDay.set(m.template_day_id, arr);
    }
  } catch (e) {
    console.error('[getCampPlanForRead] media fetch failed:', e);
  }

  const templatePlan: ServicePlanData['templatePlan'] = tplDays.map((d: any) => ({
    day_number: d.day_number,
    day_goal: d.day_goal,
    venue_default: d.venue_default ?? null,
    ocean_condition_target: d.ocean_condition_target ?? null,
    evaluation_focus: d.evaluation_focus ?? null,
    day_notes: d.day_notes ?? null,
    media: mediaByDay.get(d.id) ?? [],
    blocks: (tplBlocks ?? [])
      .filter((b: any) => b.template_day_id === d.id)
      .map((b: any) => {
        const drillRow = b.drill_id ? drillMap.get(b.drill_id) : null;
        const missionRow = b.mission_id ? missionMap.get(b.mission_id) : null;
        const stepRow = b.step_id ? stepMap.get(b.step_id) : null;
        return {
          block_order: b.block_order,
          pilar: b.pilar ?? null,
          pilar_part: b.pilar_part ?? null,
          block_type: b.block_type ?? null,
          mission_time: b.mission_time ?? null,
          repetitions_default: b.repetitions_default ?? null,
          warm_up: b.warm_up ?? null,
          simulation: b.simulation ?? null,
          mental_hack: b.mental_hack ?? null,
          evaluation_focus: b.evaluation_focus ?? null,
          step_id: b.step_id ?? null,
          step_title: stepRow?.title ?? null,
          drill_id: b.drill_id ?? null,
          drill_custom: b.drill_custom ?? null,
          drill: drillRow
            ? {
                title: drillRow.title,
                description_md: drillRow.description_md ?? null,
                key_words: drillRow.key_words ?? null,
                success_criteria: drillRow.success_criteria ?? null,
                time_estimate: drillRow.time_estimate ?? null,
              }
            : null,
          mission_id: b.mission_id ?? null,
          mission_custom: b.mission_custom ?? null,
          mission: missionRow
            ? {
                title: missionRow.title,
                description_md: missionRow.description_md ?? null,
                key_words: missionRow.key_words ?? null,
                success_criteria: missionRow.success_criteria ?? null,
                time_estimate: missionRow.time_estimate ?? null,
              }
            : null,
          // M78 — Activity taxonomy fields.
          explain_md: b.explain_md ?? null,
          demonstrate_md: b.demonstrate_md ?? null,
          simulate_md: b.simulate_md ?? null,
          feedback_md: b.feedback_md ?? null,
          equipment: b.equipment ?? null,
          activity_subtype: b.activity_subtype ?? null,
          step_ids: b.step_ids ?? null,
        };
      }),
  }));

  return { templatePlan, templateMeta };
}

// ─── Save plan-level (venue + warm-up + mental hack + notes) ──────

export async function saveServicePlanHeader(
  token: string,
  campSessionId: string,
  patch: Partial<{
    venue_analysis: string | null;
    venue_go_no_go: 'go' | 'modified' | 'no_go' | null;
    venue_wave_size: string | null;
    venue_wind: string | null;
    venue_tide: string | null;
    venue_hazards: string | null;
    venue_crowd: string | null;
    venue_water_temp: string | null;
    venue_sky: string | null;
    warm_up_drill_id: string | null;
    warm_up_custom: string | null;
    mental_hack: string | null;
    notes_general: string | null;
  }>
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Resolve the camp_instance + ownership through the session.
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Upsert the plan row for this specific day.
  const { data: existing } = await admin
    .from('service_plans')
    .select('id')
    .eq('camp_session_id', campSessionId)
    .maybeSingle();
  if (existing) {
    await admin
      .from('service_plans')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await admin.from('service_plans').insert({
      camp_instance_id: session.camp_instance_id,
      camp_session_id: campSessionId,
      ...patch,
      completion_state: 'planned',
    });
  }
}

// ─── Save per-student block ────────────────────────────────────────

export async function saveServicePlanBlock(
  token: string,
  campSessionId: string,
  studentId: string,
  orderIndex: number,
  patch: Partial<{
    step_id: string | null;
    land_drill_id: string | null;
    land_drill_custom: string | null;
    water_drill_id: string | null;
    water_drill_custom: string | null;
    objective_text: string | null;
    notes_pre: string | null;
    status: 'achieved' | 'partial' | 'not_yet' | null;
    notes_post: string | null;
    board_type: string | null;
    board_size_feet: number | null;
    board_size_inches: number | null;
    board_id: string | null;
    focus_level: number | null;
    flow_channel: number | null;
    whats_next: string | null;
    day_objective_status: string | null;
  }>
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Resolve camp_instance through the session for ownership check.
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id, academy_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Fase 4 — date-aware double-booking guard. A board can't be on two
  // services the same day (same academy).
  if ('board_id' in patch && patch.board_id && (session as any).session_date && (camp as any).academy_id) {
    const { data: sameDay } = await admin
      .from('camp_sessions')
      .select('id, camp_instances:camp_instance_id!inner(academy_id)')
      .eq('session_date', (session as any).session_date)
      .eq('camp_instances.academy_id', (camp as any).academy_id)
      .neq('id', campSessionId);
    const otherIds = (sameDay ?? []).map((s: any) => s.id);
    if (otherIds.length > 0) {
      const { data: clash } = await admin
        .from('service_plan_blocks')
        .select('id')
        .eq('board_id', patch.board_id)
        .in('camp_session_id', otherIds)
        .limit(1);
      if (clash && clash.length > 0) {
        throw new Error('Esa tabla ya está asignada a otro servicio ese día. Elegí otra.');
      }
    }
  }

  // Verify student is in this camp_instance.
  const { data: participant } = await admin
    .from('camp_participants')
    .select('id')
    .eq('camp_instance_id', session.camp_instance_id)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!participant) throw new Error('Student not enrolled in this service.');

  const ALLOWED = [
    'step_id',
    'land_drill_id',
    'land_drill_custom',
    'water_drill_id',
    'water_drill_custom',
    'objective_text',
    'notes_pre',
    'status',
    'notes_post',
    'board_type',
    'board_size_feet',
    'board_size_inches',
    'board_id',
    'focus_level',
    'flow_channel',
    'whats_next',
    'day_objective_status',
  ] as const;
  const cleanPatch: Record<string, any> = {};
  for (const k of ALLOWED) {
    if (k in patch) cleanPatch[k] = (patch as any)[k];
  }

  // M45 — block is per (session, student, order_index).
  const { data: existing } = await admin
    .from('service_plan_blocks')
    .select('id, board_id')
    .eq('camp_session_id', campSessionId)
    .eq('student_id', studentId)
    .eq('order_index', orderIndex)
    .maybeSingle();

  // Board inventory status flip: when the assigned board changes, free the
  // old one and mark the new one in use. Skipped boards stay available.
  if ('board_id' in patch) {
    const oldId = existing?.board_id ?? null;
    const newId = patch.board_id ?? null;
    if (oldId !== newId) {
      if (oldId) await admin.from('boards').update({ status: 'available' }).eq('id', oldId);
      if (newId) await admin.from('boards').update({ status: 'in_use' }).eq('id', newId);
    }
  }

  if (existing) {
    const { error } = await admin
      .from('service_plan_blocks')
      .update({ ...cleanPatch, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('service_plan_blocks').insert({
      camp_instance_id: session.camp_instance_id,
      camp_session_id: campSessionId,
      student_id: studentId,
      order_index: orderIndex,
      ...cleanPatch,
    });
    if (error) throw new Error(error.message);
  }
}

// M45 — Delete one block of a student's day. Used by the multi-block UI
// when the coach removes an extra block. The day always keeps at least
// one block; UI enforces that.
export async function deleteServicePlanBlock(
  token: string,
  campSessionId: string,
  studentId: string,
  orderIndex: number,
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  await admin
    .from('service_plan_blocks')
    .delete()
    .eq('camp_session_id', campSessionId)
    .eq('student_id', studentId)
    .eq('order_index', orderIndex);
}

// M45 — Replace ALL of a student's blocks for a given day with the
// canonical template blocks of that day. Used by the "Apply ALL blocks
// of this day to every student" button to re-seed an existing camp
// whose template was empty at creation time, or to reset a day.
export async function applyTemplateDayToStudents(
  token: string,
  campSessionId: string,
  templateBlocks: Array<{
    order_index: number;
    step_id: string | null;
    drill_id: string | null;
    drill_custom: string | null;
    mission_id: string | null;
    mission_custom: string | null;
    objective_text?: string | null;
  }>,
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Active participants of the parent camp
  const { data: parts } = await admin
    .from('camp_participants')
    .select('student_id')
    .eq('camp_instance_id', session.camp_instance_id)
    .eq('enrollment_status', 'active');
  const studentIds = (parts ?? []).map((p: any) => p.student_id);
  if (studentIds.length === 0) return;

  // Wipe existing blocks for this session × these students
  await admin
    .from('service_plan_blocks')
    .delete()
    .eq('camp_session_id', campSessionId)
    .in('student_id', studentIds);

  // Re-seed from template
  const rows: any[] = [];
  for (const studentId of studentIds) {
    for (const tb of templateBlocks) {
      rows.push({
        camp_instance_id: session.camp_instance_id,
        camp_session_id: campSessionId,
        student_id: studentId,
        order_index: tb.order_index,
        step_id: tb.step_id ?? null,
        land_drill_id: tb.drill_id ?? null,
        land_drill_custom: tb.drill_id ? null : tb.drill_custom ?? null,
        water_drill_id: tb.mission_id ?? null,
        water_drill_custom: tb.mission_id ? null : tb.mission_custom ?? null,
        objective_text: tb.objective_text ?? null,
      });
    }
  }
  if (rows.length > 0) {
    const { error } = await admin.from('service_plan_blocks').insert(rows);
    if (error) throw new Error(error.message);
  }
}

// M45 — Mark the entire camp as completed after the FinalCampEvaluation
// step. All per-day plans should already be closed by this point; this
// flips the parent camp_instance to 'completed' so it disappears from
// "upcoming" lists everywhere. Optionally accepts a batch of STP ratings
// to write in one shot (Final Eval gives the coach a chance to rate every
// STP of the student's belt level officially).
export async function closeCampFinal(
  token: string,
  campInstanceId: string,
  ratings?: Array<{ student_id: string; step_id: string; rating: number }>,
  results?: Array<{ student_id: string; approved: boolean; readiness_summary?: string; ocean_level?: string; student_visible_note: string; coach_private_note: string }>,
  promotions?: Array<{ student_id: string; belt_level: string }>,
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id, role, display_name, max_belt_permission')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, coach_id, head_coach_id')
    .eq('id', campInstanceId)
    .single();
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Accreditation authority: a coach can only promote UP TO their own
  // certification (max_belt_permission). Admins and the camp's head coach
  // bypass the cap. Anyone else's promotion becomes a pending recommendation
  // for a head coach / admin to confirm. Default cap is black_belt so coaches
  // without the field set keep working as before (no regression).
  const coachCap = ((coach as any).max_belt_permission || 'black_belt') as BeltLevel;
  const canAccreditAny =
    (coach as any).role === 'admin' || camp.head_coach_id === coach.id;

  // Batch-write the official STP ratings, if any
  if (ratings && ratings.length > 0) {
    const rows = ratings.map((r) => ({
      student_id: r.student_id,
      step_id: r.step_id,
      coach_rating: r.rating,
      coach_rated_at: new Date().toISOString(),
      coach_rated_by: coach.id,
      last_updated: new Date().toISOString(),
    }));
    await admin
      .from('student_step_ratings')
      .upsert(rows, { onConflict: 'student_id,step_id' });
  }

  // Per-student "acta" from the final evaluation. One row per (camp,
  // student) in camp_final_evaluations: approved + finalized_at is the
  // frozen graduation record; student_visible_note shows in the student
  // portal; coach_private_note is coach/bitácora-only.
  if (results && results.length > 0) {
    const finalizedAt = new Date().toISOString();
    const rows = results.map((r) => ({
      camp_instance_id: campInstanceId,
      student_id: r.student_id,
      coach_id: coach.id,
      approved: r.approved,
      readiness_summary: r.readiness_summary || null,
      ocean_level_recommendation: r.ocean_level || null,
      finalized_at: finalizedAt,
      student_visible_note: r.student_visible_note || null,
      coach_private_note: r.coach_private_note || null,
    }));
    await admin
      .from('camp_final_evaluations')
      .upsert(rows, { onConflict: 'camp_instance_id,student_id' });

    // In-water level assessment — write it the same way the bitácora's
    // Ocean Level evaluation does (history row + student update) so it shows
    // up in the student's profile and carries to the next camp.
    for (const r of results) {
      if (!r.ocean_level) continue;
      const { data: stu } = await admin
        .from('students')
        .select('ocean_level')
        .eq('id', r.student_id)
        .single();
      if (stu?.ocean_level === r.ocean_level) continue; // no change
      await admin.from('ocean_level_evaluations').insert({
        student_id: r.student_id,
        evaluated_by: coach.id,
        previous_level: stu?.ocean_level ?? null,
        new_level: r.ocean_level,
        method: 'evaluation',
        notes: 'Camp final evaluation',
      });
      await admin
        .from('students')
        .update({ ocean_level: r.ocean_level, ocean_level_provisional: false })
        .eq('id', r.student_id);
    }
  }

  // Belt promotions — coach-confirmed. Only promote UP (never demote): set
  // the new belt when its rank is higher than the student's current belt.
  // If the coach isn't authorized to accredit the target belt, the promotion
  // is saved as a PENDING recommendation instead (a head coach/admin confirms).
  if (promotions && promotions.length > 0) {
    for (const p of promotions) {
      const newBelt = p.belt_level as BeltLevel;
      if (!(newBelt in BELT_RANK)) continue;
      const { data: stu } = await admin
        .from('students')
        .select('belt_level')
        .eq('id', p.student_id)
        .single();
      const currentRank = stu?.belt_level ? BELT_RANK[stu.belt_level as BeltLevel] ?? 0 : 0;
      if (BELT_RANK[newBelt] <= currentRank) continue; // never demote / no-op

      const authorized = canAccreditAny || canCoachBelt(coachCap, newBelt);
      if (authorized) {
        await admin
          .from('students')
          .update({ belt_level: newBelt })
          .eq('id', p.student_id);
      } else {
        // Not authorized → record a pending recommendation for a head
        // coach/admin to confirm. Guarded so a missing table never breaks
        // the camp close (the belt just isn't changed until confirmed).
        try {
          const { data: existing } = await admin
            .from('belt_promotion_recommendations')
            .select('id')
            .eq('student_id', p.student_id)
            .eq('recommended_belt', newBelt)
            .eq('status', 'pending')
            .limit(1);
          if (!existing || existing.length === 0) {
            await admin.from('belt_promotion_recommendations').insert({
              student_id: p.student_id,
              camp_instance_id: campInstanceId,
              recommended_belt: newBelt,
              from_belt: stu?.belt_level ?? null,
              recommended_by: coach.id,
              recommended_by_name: (coach as any).display_name ?? null,
              coach_max_belt: coachCap,
              status: 'pending',
            });
          }
        } catch {
          /* table not present yet — belt simply stays until an admin promotes */
        }
      }
    }
  }

  await admin
    .from('camp_instances')
    .update({ status: 'completed' })
    .eq('id', campInstanceId);
}

// M45 — Save a coach's official STP rating for a student during session
// close. Uses the portal token + camp_session ownership check (like the
// other portal actions). Writes to student_step_ratings.coach_rating so
// the student sees cyan official stars in their portal.
export async function saveOfficialStepRatingFromPortal(
  token: string,
  campSessionId: string,
  studentId: string,
  stepId: string,
  rating: number | null
): Promise<void> {
  const admin = createAdminClient();

  if (rating !== null && (rating < 1 || rating > 5)) {
    throw new Error('Rating must be 1-5 or null to clear.');
  }

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Verify ownership through the session
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Confirm student is in the camp
  const { data: participant } = await admin
    .from('camp_participants')
    .select('id')
    .eq('camp_instance_id', session.camp_instance_id)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!participant) throw new Error('Student not enrolled in this service.');

  await admin
    .from('student_step_ratings')
    .upsert(
      {
        student_id: studentId,
        step_id: stepId,
        coach_rating: rating,
        coach_rated_at: rating !== null ? new Date().toISOString() : null,
        coach_rated_by: rating !== null ? coach.id : null,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'student_id,step_id' }
    );
}

// ─── Lifecycle: start + close ──────────────────────────────────────

export async function startServicePlan(token: string, campSessionId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Resolve camp_instance through the session
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');

  const { data: existing } = await admin
    .from('service_plans')
    .select('id')
    .eq('camp_session_id', campSessionId)
    .maybeSingle();
  if (existing) {
    await admin
      .from('service_plans')
      .update({
        completion_state: 'in_progress',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await admin.from('service_plans').insert({
      camp_instance_id: session.camp_instance_id,
      camp_session_id: campSessionId,
      completion_state: 'in_progress',
      started_at: new Date().toISOString(),
    });
  }
}

// M45 — Close ONE day of the camp + sync per-day evaluations into the
// unified bitácora (student_session_results) so it shows up in the
// student portal + their admin profile.
//
// Renamed from closeServicePlan (camp-level) to closeServicePlan (day-level)
// keeping the same name for backward-compat with existing imports; the
// argument is now a camp_session_id (a single day), not a camp_instance_id.
//
// Steps:
//   1. Resolve the day + ownership.
//   2. Wipe + re-insert one student_session_results row per block of THIS day.
//   3. RPC update_student_profile_on_close per student.
//   4. Email each student feedback + survey link (first close only).
//   5. Flip THIS day's service_plans → closed.
//   6. camp_instance.status stays in_progress; the FinalCampEvaluation
//      flow flips it to 'completed' only after the official final eval.
export interface IncidentReport {
  student_id: string;
  incident_type: string;       // medical / board / equipment / conduct / venue / other
  incident_description: string;
  incident_action: string | null;
}

export async function closeServicePlan(
  token: string,
  campSessionId: string,
  incidents?: IncidentReport[],
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id, display_name')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Resolve day + parent camp. We pull scheduled_time + template service_kind
  // so we can estimate this session's duration_minutes for the bitácora /
  // surf hours totals on the student portal.
  const { data: session } = await admin
    .from('camp_sessions')
    .select(
      'id, day_number, session_date, camp_instance_id, ' +
        'camp_instances:camp_instance_id(' +
          'id, camp_name, start_date, coach_id, head_coach_id, scheduled_time, ' +
          'camp_templates:template_id(service_kind)' +
        ')'
    )
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const sessionAny = session as any;
  const camp = Array.isArray(sessionAny.camp_instances)
    ? sessionAny.camp_instances[0]
    : sessionAny.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Estimate session duration in minutes.
  // 1. If scheduled_time looks like "HH:MM - HH:MM", subtract.
  // 2. Otherwise fall back per service_kind: 90 min for surf_lesson,
  //    120 min for surf_camp days, 60 for anything else.
  const computeDurationMinutes = (): number => {
    const st: string | null = camp.scheduled_time ?? null;
    if (st) {
      const m = st.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (m) {
        const start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        const end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
        if (end > start) return end - start;
      }
    }
    const tpl = Array.isArray(camp.camp_templates)
      ? camp.camp_templates[0]
      : camp.camp_templates;
    const kind = tpl?.service_kind ?? null;
    if (kind === 'surf_lesson') return 90;
    if (kind === 'surf_camp') return 120;
    return 60;
  };
  const sessionDurationMinutes = computeDurationMinutes();

  const { data: plan } = await admin
    .from('service_plans')
    .select('*')
    .eq('camp_session_id', campSessionId)
    .maybeSingle();
  const alreadyClosed = plan?.completion_state === 'closed';

  const { data: blocks } = await admin
    .from('service_plan_blocks')
    .select('*')
    .eq('camp_session_id', campSessionId);
  const allBlocks = blocks ?? [];

  // Mark session completed.
  await admin
    .from('camp_sessions')
    .update({ session_status: 'completed' })
    .eq('id', campSessionId);
  const campSession = { id: campSessionId };

  // Board inventory: boards used today return to 'available' on close, unless
  // they were flagged 'in_repair' (e.g. by a damage incident). Phase 3.
  const usedBoardIds = Array.from(
    new Set(allBlocks.map((b: any) => b.board_id).filter(Boolean)),
  );
  if (usedBoardIds.length > 0) {
    await admin
      .from('boards')
      .update({ status: 'available' })
      .in('id', usedBoardIds)
      .neq('status', 'in_repair');

    // Log usage (one row per board per day) so we can later compute each
    // board's total uses + lifespan. Idempotent via UNIQUE(board_id, camp_session_id).
    const usageRows = usedBoardIds.map((bid) => ({
      board_id: bid,
      camp_session_id: campSession!.id,
      session_date: (session as any).session_date ?? null,
    }));
    await admin
      .from('board_usages')
      .upsert(usageRows, { onConflict: 'board_id,camp_session_id', ignoreDuplicates: true });
  }

  // 2. Idempotency — clear prior results for this camp_session
  await admin
    .from('student_session_results')
    .delete()
    .eq('camp_session_id', campSession!.id);

  // Resolve drill/mission titles for the mission text
  const drillIds = Array.from(
    new Set(
      allBlocks
        .flatMap((b: any) => [b.water_drill_id, b.land_drill_id])
        .filter(Boolean)
    )
  );
  const titleById: Record<string, string> = {};
  if (drillIds.length > 0) {
    const { data: dm } = await admin
      .from('drills_missions')
      .select('id, title')
      .in('id', drillIds);
    for (const d of dm ?? []) titleById[d.id] = d.title;
  }

  // Students (portal_token + email for the close email)
  const studentIds = allBlocks.map((b: any) => b.student_id);
  const studById: Record<string, any> = {};
  if (studentIds.length > 0) {
    const { data: studs } = await admin
      .from('students')
      .select('id, first_name, email, portal_token, belt_level, course_access_white, course_access_yellow')
      .in('id', studentIds);
    for (const s of studs ?? []) studById[s.id] = s;
  }

  const STATUS_MAP: Record<string, string> = {
    achieved: 'competent',
    partial: 'partial',
    not_yet: 'not_yet',
  };

  // 3. ONE result per (student, session). Multi-block days used to write
  // one row per block which double-counted surf hours and split feedback
  // across multiple bitácora entries. Now we aggregate per student:
  //   - status: worst across blocks (not_yet > partial > achieved)
  //   - mission: first block's objective/drill/mission for the label
  //   - duration_minutes: session-level (credited once per student)
  //   - coach_feedback: block 0's notes_post (lifted to session level)
  const blocksByStudent2: Record<string, any[]> = {};
  for (const b of allBlocks) {
    (blocksByStudent2[b.student_id] ??= []).push(b);
  }
  for (const studentId of Object.keys(blocksByStudent2)) {
    const studentBlocks = blocksByStudent2[studentId].sort(
      (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );
    const firstBlock = studentBlocks[0];
    const stud = studById[studentId];

    // Session status: prefer the coach's session-level "did they meet the
    // objective?" (block 0, the new light daily eval); fall back to the old
    // per-block worst-status aggregation for plans that didn't set it.
    const statusOrder: Record<string, number> = { not_yet: 0, partial: 1, achieved: 2 };
    const sessionObjective = firstBlock?.day_objective_status as string | undefined;
    let worst: any = 'achieved';
    if (sessionObjective === 'achieved' || sessionObjective === 'partial' || sessionObjective === 'not_yet') {
      worst = sessionObjective;
    } else {
      for (const b of studentBlocks) {
        if (!b.status) continue;
        if (statusOrder[b.status] < statusOrder[worst]) worst = b.status;
      }
    }
    const status = STATUS_MAP[worst as string] ?? 'partial';
    const achievedText =
      worst === 'achieved' ? 'yes' : worst === 'not_yet' ? 'not yet' : 'partial';

    const missionTitle =
      firstBlock.objective_text ||
      (firstBlock.water_drill_id ? titleById[firstBlock.water_drill_id] : firstBlock.water_drill_custom) ||
      (firstBlock.land_drill_id ? titleById[firstBlock.land_drill_id] : firstBlock.land_drill_custom) ||
      'Service session';
    const b = firstBlock; // alias for the legacy code below

    const { data: result, error: resErr } = await admin
      .from('student_session_results')
      .insert({
        camp_session_id: campSession!.id,
        student_id: studentId,
        coach_id: coach.id,
        status,
        mission: missionTitle,
        coach_feedback: firstBlock.notes_post ?? null,
        achieved: achievedText,
        whats_next: firstBlock.whats_next ?? null,
        homework: null,
        completion_state: 'closed',
        survey_unlocked: true,
        portal_token: stud?.portal_token ?? null,
        // M50 — surface session hours in the student's portal totals.
        duration_minutes: sessionDurationMinutes,
      })
      .select('id, feedback_token')
      .single();
    if (resErr) throw new Error(resErr.message);

    // Sync the student's profile snapshot (last_session_*)
    if (result) {
      try {
        await admin.rpc('update_student_profile_on_close', {
          p_student_id: b.student_id,
          p_session_result_id: result.id,
          p_session_date: new Date().toISOString(),
          p_mission: missionTitle,
          // p_pilar is the `pilar` enum (technical/physical/tactical/mental).
          // step_id ("STP-002") is NOT a pilar — passing it made the RPC
          // throw on the enum cast and silently skip the snapshot update,
          // leaving last_session_* null. Pass null instead.
          p_pilar: null,
          p_status: status,
          p_homework: null,
          p_whats_next: firstBlock.whats_next ?? null,
        });
      } catch {
        /* non-blocking — profile snapshot is best-effort */
      }
    }

    // 4. Email feedback + survey link (only on first close, non-blocking)
    if (!alreadyClosed && stud?.email && result) {
      try {
        const { sendSessionEmail } = await import('@/lib/actions/email');
        // M86 — pick the right feedback URL based on whether the
        // student has any course access. Leads land on the standalone
        // /feedback/[token] page; Members get the full portal.
        const hasCourseAccess =
          !!(stud as any).course_access_white ||
          !!(stud as any).course_access_yellow;
        await sendSessionEmail({
          studentName: stud.first_name,
          studentEmail: stud.email,
          portalToken: stud.portal_token,
          coachName: coach.display_name || 'Coach',
          sessionDate: new Date().toISOString(),
          mission: missionTitle,
          status,
          coachFeedback: b.notes_post ?? '',
          homework: '',
          whatsNext: '',
          beltLevel: stud.belt_level || 'white_belt',
          sessionResultId: result.id,
          feedbackToken: (result as any).feedback_token ?? undefined,
          studentHasCourseAccess: hasCourseAccess,
        });
        await admin
          .from('student_session_results')
          .update({ email_sent: true, email_sent_at: new Date().toISOString() })
          .eq('id', result.id);
      } catch {
        /* non-blocking */
      }
    }

    // M-audit — log session_closed per student. Same shape that
    // sessions.ts + multi-block-sessions.ts use, so the audit feed at
    // /audit treats every closure consistently regardless of which
    // close-path created it. Non-blocking.
    if (!alreadyClosed && result) {
      try {
        await admin.from('audit_log').insert({
          actor_type: 'coach',
          actor_id: coach.id,
          actor_name: coach.display_name,
          event_type: 'session_closed',
          status_before: 'draft',
          status_after: 'closed',
          note: `Service session closed for ${stud?.first_name ?? 'student'}. Overall: ${status}.`,
        });
      } catch {
        /* non-blocking — audit is best-effort */
      }
    }
  }

  // M48 — Per-student incident reports filed by the coach at close.
  // Updates the student_session_results row for each affected student
  // with the incident_* columns (00012 schema).
  if (incidents && incidents.length > 0) {
    for (const inc of incidents) {
      if (!inc.student_id || !inc.incident_type) continue;
      await admin
        .from('student_session_results')
        .update({
          incident_type: inc.incident_type,
          incident_description: inc.incident_description ?? null,
          incident_action: inc.incident_action ?? null,
        })
        .eq('camp_session_id', campSession!.id)
        .eq('student_id', inc.student_id);
    }
  }

  // 5. Flip lifecycle state for THIS day only
  if (plan) {
    await admin
      .from('service_plans')
      .update({
        completion_state: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', plan.id);
  } else {
    await admin.from('service_plans').insert({
      camp_instance_id: sessionAny.camp_instance_id,
      camp_session_id: campSessionId,
      completion_state: 'closed',
      closed_at: new Date().toISOString(),
    });
  }

  // camp_instance.status stays in_progress until the FinalCampEvaluation
  // step flips it to 'completed'. For 1-day services (lessons), Phase 6
  // will treat day-1 close as the final and trigger the eval inline.
}

// Coach-to-coach internal note on a student (students.coach_notes_general).
// Persistent, coach-only — NOT shown in the student portal. Any coach assigned
// to a service the student is in can leave/read it, so the next coach sees
// context like "gets frustrated easily" or "this cue worked".
export async function saveStudentInternalNote(
  token: string,
  campSessionId: string,
  studentId: string,
  note: string,
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  const camp = Array.isArray((session as any)?.camp_instances)
    ? (session as any).camp_instances[0]
    : (session as any)?.camp_instances;
  if (!session || !camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  const { error } = await admin
    .from('students')
    .update({ coach_notes_general: note.trim() || null })
    .eq('id', studentId);
  if (error) throw new Error(error.message);
}
