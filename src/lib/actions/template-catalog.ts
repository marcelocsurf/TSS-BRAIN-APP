'use server';

// Loads the sequence catalog (STPs + canonical drills/missions) for the
// camp-template builder. Filtered to what makes sense at the template's
// level so the coordinator only sees relevant items.

import { createClient } from '@/lib/supabase/server';
import { filterDrillsByBelt, levelNameToBelt } from '@/lib/utils/belts';
import { levelToCourseSections } from '@/lib/constants/belts';

export interface CatalogStp {
  id: string;
  title: string;
  pillar: string | null;
  display_order: number;
  // La secuencia del método: para agrupar el picker por secuencia y rotularla
  // con la fuente única (sequenceLabel) en vez de una lista plana que
  // entrevera White con Blue.
  wb_sequence_id: string | null;
  wb_sequence_name: string | null;
  wb_sequence_order: number | null;
  sequence_step_order: number | null;
  /** Theory body — auto-populates Land Drill "Explain". */
  description_md: string | null;
  /** How-to-practice body — auto-populates Land Drill "Simulate" (fallback when no canonical drill picked). */
  drill_md: string | null;
  /** Common errors — auto-populates Land Drill "Feedback". */
  errors_md: string | null;
  /** Reference video — auto-populates Land Drill "Demonstrate". */
  video_url: string | null;
}

export interface CatalogDrill {
  id: string;
  step_id: string | null;
  title: string;
  type: 'drill' | 'mission';
  belt: string | null;
  key_words: string[] | null;
  time_estimate: string | null;
  /** Recommended reps as text ("8 reps", "5-8") — parsed into repetitions_default. */
  reps_recommended: string | null;
  /** Drill / mission body — auto-populates Simulate (Land Drill) when a canonical drill is picked. */
  description_md: string | null;
  block_name: string | null;
  display_order: number | null;
  success_criteria: string[] | null;
}

export interface TemplateCatalog {
  stps: CatalogStp[];
  drills: CatalogDrill[];   // type='drill'
  missions: CatalogDrill[]; // type='mission'
}

export async function getTemplateCatalog(levelName: string): Promise<TemplateCatalog> {
  const supabase = await createClient();
  const belt = levelNameToBelt(levelName);
  // STPs come from any belt-level course_section up to and including
  // the template's level. So a Novice template sees both white_belt
  // and yellow_belt STPs; a Foundation template adds blue_belt; etc.
  const sections = levelToCourseSections(levelName);

  const [stpRes, drillsRes] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title, pillar, display_order, description_md, drill_md, errors_md, video_url, wb_sequence_id, wb_sequence_name, wb_sequence_order, sequence_step_order')
      .in('course_section', sections)
      .eq('active', true)
      .order('display_order'),
    supabase
      .from('drills_missions')
      .select('id, step_id, title, type, belt, key_words, time_estimate, reps_recommended, description_md, block_name, display_order, success_criteria')
      .eq('active', true)
      .order('display_order'),
  ]);

  const allDrills = (drillsRes.data ?? []) as CatalogDrill[];
  const allowed = filterDrillsByBelt(allDrills, belt);

  // Orden del MÉTODO, no de la tabla: por secuencia (#1..#13, luego las de
  // cierre) y adentro por el paso. La lista plana por display_order
  // entreveraba pasos de White con pasos de Blue.
  const stps = ((stpRes.data ?? []) as CatalogStp[]).slice().sort((a, b) => {
    const so = (x: CatalogStp) => x.wb_sequence_order ?? 999;
    if (so(a) !== so(b)) return so(a) - so(b);
    const st = (x: CatalogStp) => x.sequence_step_order ?? x.display_order;
    return st(a) - st(b);
  });

  return {
    stps,
    drills: allowed.filter((d) => d.type === 'drill'),
    missions: allowed.filter((d) => d.type === 'mission'),
  };
}
