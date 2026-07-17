import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCoach } from '@/lib/actions/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// Full student roster export (CSV, opens in Excel). One row per student with all
// their personal, contact, emergency, medical, surf-profile, belt, goals and
// consent data. Secrets (pin, portal token, raw quiz blobs) are NOT exported.
// Coordinator → own academy. Platform admin → the acting academy, or ?academy=,
// or all when none is set.

function csv(v: unknown): string {
  const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// [header, column] — order is the spreadsheet column order.
const COLUMNS: [string, string][] = [
  ['First name', 'first_name'],
  ['Last name', 'last_name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Instagram', 'instagram'],
  ['Date of birth', 'date_of_birth'],
  ['Age', 'age'],
  ['Age group', 'age_group'],
  ['Gender', 'gender'],
  ['Nationality', 'nationality'],
  ['Languages', 'languages'],
  // Emergency + medical
  ['Emergency contact', 'emergency_contact_name'],
  ['Emergency phone', 'emergency_contact_phone'],
  ['Allergies', 'allergies'],
  ['Injuries', 'injuries'],
  ['Surf injuries', 'surf_injuries'],
  ['Medical notes', 'medical_notes'],
  ['Risk notes', 'risk_notes'],
  ['Fears / phobias', 'fears_phobias'],
  // Physical / gear
  ['Weight', 'weight'],
  ['Height', 'height'],
  ['Shirt size', 'shirt_size'],
  ['Stance', 'stance'],
  ['Goofy or regular', 'goofy_or_regular'],
  ['Board type', 'board_type'],
  ['Board length (ft)', 'board_length_feet'],
  ['Board length (in)', 'board_length_inches'],
  ['Board volume (L)', 'board_volume_liters'],
  // Surf profile
  ['Swim level', 'swim_level'],
  ['Water comfort', 'water_comfort'],
  ['Board familiarity', 'board_familiarity'],
  ['Comfort wave size', 'comfort_wave_size'],
  ['Favorite wave size', 'favorite_wave_size'],
  ['Surf self level', 'surf_self_level'],
  ['Surf experience (yrs)', 'surf_experience_years'],
  ['Surf frequency', 'surf_frequency'],
  ['Maneuvers current', 'maneuvers_current'],
  ['Other sports', 'other_sports'],
  // Belt / progression
  ['Belt', 'belt_level'],
  ['Ocean level', 'ocean_level'],
  ['Progression status', 'progression_status'],
  ['Evaluation score', 'evaluation_score'],
  ['Level quiz score', 'level_quiz_score'],
  // Goals / learning
  ['Primary goal', 'primary_goal'],
  ['Personal goal', 'personal_goal'],
  ['Goal short term', 'goal_short_term'],
  ['Goal mid term', 'goal_mid_term'],
  ['Goal long term', 'goal_long_term'],
  ['Biggest barrier', 'biggest_barrier'],
  ['Current focus area', 'current_focus_area'],
  ['Learning style', 'learning_style'],
  ['Learning profile', 'learning_profile_primary'],
  // Lifecycle / consent
  ['Lifecycle', 'lifecycle_status'],
  ['Student type', 'student_type'],
  ['Status', 'status'],
  ['Returning student', 'returning_student'],
  ['How did you hear', 'how_did_you_hear'],
  ['Waiver signed', 'waiver_signed'],
  ['Waiver signed at', 'waiver_signed_at'],
  ['Media release consent', 'media_release_consent'],
  ['Intake completed at', 'intake_completed_at'],
  ['Created at', 'created_at'],
  ['Last session date', 'last_session_date'],
];

export async function GET(req: NextRequest) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'coordinator' || me.role === 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const admin = createAdminClient();

  // Scope: coordinator → own academy; platform admin → acting academy, ?academy=, or all.
  const scopeAcademyId = me.is_platform_admin
    ? searchParams.get('academy') || me.academy_id || null
    : me.academy_id ?? null;

  let q = admin.from('students').select(COLUMNS.map(([, c]) => c).join(',')).order('last_name');
  if (scopeAcademyId) q = q.eq('academy_id', scopeAcademyId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const header = COLUMNS.map(([h]) => csv(h)).join(',');
  const rows = (data ?? []).map((r: any) => COLUMNS.map(([, c]) => csv(r[c])).join(','));
  // BOM so Excel reads UTF-8 (accents) correctly.
  const body = '﻿' + [header, ...rows].join('\r\n');

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="alumnos-${stamp}.csv"`,
    },
  });
}
