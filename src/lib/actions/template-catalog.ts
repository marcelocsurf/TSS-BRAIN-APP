'use server';

// Loads the sequence catalog (STPs + canonical drills/missions) for the
// camp-template builder. Filtered to what makes sense at the template's
// level so the coordinator only sees relevant items.

import { createClient } from '@/lib/supabase/server';
import { filterDrillsByBelt, levelNameToBelt } from '@/lib/utils/belts';

export interface CatalogStp {
  id: string;
  title: string;
  pillar: string | null;
  display_order: number;
  /** Theory body — used to auto-populate the Land Drill "Explain" field. */
  description_md: string | null;
  /** How-to-practice body — used to auto-populate the Land Drill "Simulate / Participate" field. */
  drill_md: string | null;
}

export interface CatalogDrill {
  id: string;
  step_id: string | null;
  title: string;
  type: 'drill' | 'mission';
  belt: string | null;
  key_words: string[] | null;
  time_estimate: string | null;
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

  const [stpRes, drillsRes] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title, pillar, display_order, description_md, drill_md')
      .eq('course_section', 'white_belt')
      .eq('active', true)
      .order('display_order'),
    supabase
      .from('drills_missions')
      .select('id, step_id, title, type, belt, key_words, time_estimate, block_name, display_order, success_criteria')
      .eq('active', true)
      .order('display_order'),
  ]);

  const allDrills = (drillsRes.data ?? []) as CatalogDrill[];
  const allowed = filterDrillsByBelt(allDrills, belt);

  return {
    stps: (stpRes.data ?? []) as CatalogStp[],
    drills: allowed.filter((d) => d.type === 'drill'),
    missions: allowed.filter((d) => d.type === 'mission'),
  };
}
