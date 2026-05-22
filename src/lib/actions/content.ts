'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// ─── Types ───────────────────────────────────────────────

export interface ContentVideo {
  id: string;
  lesson_id: string | null;
  drill_mission_id: string | null;
  step_id: string | null;
  url: string;
  label: string | null;
  caption: string | null;
  media_type: 'video' | 'image' | 'diagram';
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ─── List all content with their videos (Content admin page) ────

export async function getContentInventory() {
  const admin = createAdminClient();

  const [lessonsQ, drillsMissionsQ, videosQ] = await Promise.all([
    admin
      .from('lessons')
      .select('id, course_section, step_number, title, pillar, lesson_type, display_order, active')
      .eq('active', true)
      .order('course_section')
      .order('display_order'),
    admin
      .from('drills_missions')
      .select('id, step_id, title, type, block_name, display_order, active')
      .eq('active', true)
      .order('step_id')
      .order('type'),
    admin
      .from('content_videos')
      .select('*')
      .order('display_order'),
  ]);

  const videos = (videosQ.data ?? []) as ContentVideo[];
  const videosByLesson = new Map<string, ContentVideo[]>();
  const videosByDrillMission = new Map<string, ContentVideo[]>();
  const videosByStep = new Map<string, ContentVideo[]>();
  for (const v of videos) {
    if (v.lesson_id) {
      const arr = videosByLesson.get(v.lesson_id) ?? [];
      arr.push(v);
      videosByLesson.set(v.lesson_id, arr);
    } else if (v.drill_mission_id) {
      const arr = videosByDrillMission.get(v.drill_mission_id) ?? [];
      arr.push(v);
      videosByDrillMission.set(v.drill_mission_id, arr);
    } else if (v.step_id) {
      const arr = videosByStep.get(v.step_id) ?? [];
      arr.push(v);
      videosByStep.set(v.step_id, arr);
    }
  }

  const lessons = (lessonsQ.data ?? []).map((l: any) => ({
    ...l,
    videos: videosByLesson.get(l.id) ?? [],
  }));
  const drillsMissions = (drillsMissionsQ.data ?? []).map((d: any) => ({
    ...d,
    videos: videosByDrillMission.get(d.id) ?? [],
  }));

  // STP-level media: the 25 WB STPs + 8 YB STPs. Pulled from lessons
  // (the STPs are themselves lessons with id 'STP-XXX').
  const steps = (lessonsQ.data ?? [])
    .filter((l: any) =>
      (l.course_section === 'white_belt' || l.course_section === 'yellow_belt')
      && /^STP-\d+$/.test(l.id))
    .map((l: any) => ({
      id: l.id,
      title: l.title,
      course_section: l.course_section,
      step_number: l.step_number,
      display_order: l.display_order,
      videos: videosByStep.get(l.id) ?? [],
    }));

  return { lessons, drillsMissions, steps };
}

// ─── List videos for a single lesson or drill_mission (used by viewers) ──

export async function getVideosForLesson(lessonId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('content_videos')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('display_order');
  return (data ?? []) as ContentVideo[];
}

export async function getVideosForDrillMission(drillMissionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('content_videos')
    .select('*')
    .eq('drill_mission_id', drillMissionId)
    .order('display_order');
  return (data ?? []) as ContentVideo[];
}

// ─── Add a video (lesson OR drill_mission, not both) ──

export async function addContentVideo(input: {
  lessonId?: string;
  drillMissionId?: string;
  stepId?: string;
  url: string;
  label?: string;
  caption?: string;
  mediaType?: 'video' | 'image' | 'diagram';
}) {
  const supabase = await createClient();

  const parents = [input.lessonId, input.drillMissionId, input.stepId].filter(Boolean);
  if (parents.length !== 1) {
    throw new Error('Provide exactly one of lessonId, drillMissionId or stepId.');
  }
  const cleanUrl = input.url.trim();
  if (!cleanUrl) throw new Error('URL is required.');
  if (!cleanUrl.match(/^https?:\/\//i)) {
    throw new Error('URL must start with http:// or https://');
  }

  const mediaType = input.mediaType ?? 'video';

  // Compute next display_order for this parent
  const parentCol = input.lessonId
    ? 'lesson_id'
    : input.drillMissionId
    ? 'drill_mission_id'
    : 'step_id';
  const parentVal = input.lessonId || input.drillMissionId || input.stepId;
  const { data: existing } = await supabase
    .from('content_videos')
    .select('display_order')
    .eq(parentCol, parentVal as string)
    .order('display_order', { ascending: false })
    .limit(1);
  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabase
    .from('content_videos')
    .insert({
      lesson_id: input.lessonId ?? null,
      drill_mission_id: input.drillMissionId ?? null,
      step_id: input.stepId ?? null,
      url: cleanUrl,
      label: input.label?.trim() || null,
      caption: input.caption?.trim() || null,
      media_type: mediaType,
      display_order: nextOrder,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/content');
  if (input.lessonId) revalidatePath(`/portal/[token]`, 'layout');
  if (input.stepId) revalidatePath(`/coach-portal/[token]`, 'layout');
  return data as ContentVideo;
}

// ─── Update a video (label, url, display_order) ──

export async function updateContentVideo(
  id: string,
  patch: Partial<{ url: string; label: string; caption: string; display_order: number }>
) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (patch.url !== undefined) {
    const clean = patch.url.trim();
    if (!clean) throw new Error('URL cannot be empty.');
    if (!clean.match(/^https?:\/\//i)) {
      throw new Error('URL must start with http:// or https://');
    }
    updates.url = clean;
  }
  if (patch.label !== undefined) updates.label = patch.label.trim() || null;
  if (patch.caption !== undefined) updates.caption = patch.caption.trim() || null;
  if (patch.display_order !== undefined) updates.display_order = patch.display_order;

  const { error } = await supabase
    .from('content_videos')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/content');
}

// ─── Delete a video ──

export async function deleteContentVideo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('content_videos').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/content');
}

// ─── Reorder videos (swap up/down) ──

export async function reorderContentVideo(id: string, direction: 'up' | 'down') {
  const supabase = await createClient();

  const { data: target } = await supabase
    .from('content_videos')
    .select('*')
    .eq('id', id)
    .single();
  if (!target) throw new Error('Video not found');

  const parentCol = target.lesson_id
    ? 'lesson_id'
    : target.drill_mission_id
    ? 'drill_mission_id'
    : 'step_id';
  const parentVal = target.lesson_id || target.drill_mission_id || target.step_id;
  const cmp = direction === 'up' ? 'lt' : 'gt';
  const order = direction === 'up' ? 'desc' : 'asc';

  const query = supabase
    .from('content_videos')
    .select('id, display_order')
    .eq(parentCol, parentVal);
  const filtered = direction === 'up'
    ? query.lt('display_order', target.display_order)
    : query.gt('display_order', target.display_order);
  const { data: neighbor } = await filtered
    .order('display_order', { ascending: order === 'asc' })
    .limit(1)
    .maybeSingle();

  if (!neighbor) return; // already at edge

  // Swap via a temp slot to avoid unique-violation if you add one later
  await supabase.from('content_videos').update({ display_order: -1 }).eq('id', target.id);
  await supabase
    .from('content_videos')
    .update({ display_order: target.display_order })
    .eq('id', neighbor.id);
  await supabase
    .from('content_videos')
    .update({ display_order: neighbor.display_order })
    .eq('id', target.id);

  revalidatePath('/content');
}
