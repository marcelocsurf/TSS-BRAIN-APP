'use server';

// Coach Tools surface — token-authed lookups to power the sequence-by-STP
// navigation introduced in the redesigned Tools tab. Read-only for the
// coach. Catalog (drills / missions) is global; visual aids are scoped to
// each STP via content_videos.step_id (added in M64).

import { createAdminClient } from '@/lib/supabase/admin';
import { BELT_HIERARCHY, type BeltLevel } from '@/lib/constants/belts';

export type StpSummary = {
  id: string;
  title: string;
  course_section: string;
  belt: 'white' | 'yellow';
  sequence_id: string | null;
  sequence_name: string | null;
  sequence_order: number | null;
  sequence_step_order: number | null;
};

export type StpMedia = {
  id: string;
  url: string;
  label: string | null;
  caption: string | null;
  media_type: 'video' | 'image' | 'diagram' | 'document';
  display_order: number;
};

export type CoachStpDetail = {
  step: {
    id: string;
    title: string;
    subtitle: string | null;
    pillar: string | null;
    belt: 'white' | 'yellow';
    sequence_name: string | null;
  };
  drills: any[];
  missions: any[];
  media: StpMedia[];
};

async function resolveCoach(token: string): Promise<{
  id: string;
  max_belt_permission: string;
  course_access_granted: boolean;
} | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('coaches')
    .select('id, max_belt_permission, course_access_granted')
    .eq('portal_token', token)
    .maybeSingle();
  if (!data || !data.course_access_granted) return null;
  return {
    id: data.id,
    max_belt_permission: data.max_belt_permission ?? 'black_belt',
    course_access_granted: data.course_access_granted,
  };
}

function beltShortFromSection(section: string): 'white' | 'yellow' {
  return section === 'yellow_belt' ? 'yellow' : 'white';
}

// ─── List of STPs grouped by sequence — powers the Tools tab landing ───
export async function listCoachStps(token: string): Promise<StpSummary[]> {
  const coach = await resolveCoach(token);
  if (!coach) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from('lessons')
    .select(
      'id, title, course_section, wb_sequence_id, wb_sequence_name, wb_sequence_order, sequence_step_order, step_number, display_order',
    )
    .in('course_section', ['white_belt', 'yellow_belt'])
    .eq('active', true)
    .order('course_section')
    .order('wb_sequence_order', { ascending: true, nullsFirst: false })
    .order('sequence_step_order', { ascending: true, nullsFirst: false })
    .order('display_order');

  return (data ?? [])
    .filter((l: any) => /^STP-\d+$/.test(l.id))
    .map((l: any) => ({
      id: l.id,
      title: l.title,
      course_section: l.course_section,
      belt: beltShortFromSection(l.course_section),
      sequence_id: l.wb_sequence_id,
      sequence_name: l.wb_sequence_name,
      sequence_order: l.wb_sequence_order,
      sequence_step_order: l.sequence_step_order ?? l.step_number,
    }));
}

// ─── Full detail for a single STP: drills + missions + media ───
export async function getCoachToolsByStep(
  token: string,
  stepId: string,
): Promise<CoachStpDetail | null> {
  const coach = await resolveCoach(token);
  if (!coach) return null;

  if (!/^STP-\d+$/.test(stepId)) return null;

  const admin = createAdminClient();

  const { data: step } = await admin
    .from('lessons')
    .select('id, title, subtitle, pillar, course_section')
    .eq('id', stepId)
    .eq('active', true)
    .maybeSingle();
  if (!step) return null;

  const belt = beltShortFromSection(step.course_section);

  // Belt gate — only show drills/missions at or below the coach's certification.
  const maxIdx = BELT_HIERARCHY.indexOf(coach.max_belt_permission as BeltLevel);

  const { data: tools } = await admin
    .from('drills_missions')
    .select(
      'id, step_id, type, belt, title, description_md, success_criteria, key_words, time_estimate, reps_recommended, block_name, display_order',
    )
    .eq('step_id', stepId)
    .eq('active', true)
    .order('display_order');

  // Filter by belt: each tool's `belt` is a short token ('white','yellow',
  // 'orange', ...). Map to the BELT_HIERARCHY long form (which is what
  // max_belt_permission uses) and compare against the coach's cap.
  const inRange = (toolBelt: string | null): boolean => {
    if (!toolBelt) return true;
    const longForm = `${toolBelt}_belt` as BeltLevel;
    const idx = BELT_HIERARCHY.indexOf(longForm);
    if (idx < 0) return true;
    return idx <= maxIdx;
  };

  const drills = (tools ?? []).filter((t: any) => t.type === 'drill' && inRange(t.belt));
  const missions = (tools ?? []).filter((t: any) => t.type === 'mission' && inRange(t.belt));

  // Media: anything attached directly to the STP, plus anything attached
  // to one of this STP's drills/missions. Both end up in one timeline so
  // the coach sees every visual aid for the topic in one tab.
  const toolIds = (tools ?? []).map((t: any) => t.id);
  const { data: mediaRows } = await admin
    .from('content_videos')
    .select('id, url, label, caption, media_type, display_order, step_id, drill_mission_id')
    .or(
      `step_id.eq.${stepId}${toolIds.length > 0 ? `,drill_mission_id.in.(${toolIds.join(',')})` : ''}`,
    )
    .order('display_order');

  return {
    step: {
      id: step.id,
      title: step.title,
      subtitle: step.subtitle,
      pillar: step.pillar,
      belt,
      sequence_name: null, // populated downstream from listCoachStps when needed
    },
    drills,
    missions,
    media: (mediaRows ?? []).map((m: any) => ({
      id: m.id,
      url: m.url,
      label: m.label,
      caption: m.caption,
      media_type: m.media_type ?? 'video',
      display_order: m.display_order,
    })),
  };
}
