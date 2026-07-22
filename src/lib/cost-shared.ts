// Shared cost-engine types/constants (M145). Lives outside the 'use server'
// module because server-action files may only export async functions.

export type CostDriver =
  | 'per_student_flat'
  | 'per_student_per_day'
  | 'per_group_flat'
  | 'per_group_per_day'
  | 'transport_per_day'
  | 'per_assistant_per_day'
  | 'per_filmer_per_day';

export const DRIVER_LABEL: Record<CostDriver, string> = {
  per_student_flat: 'Per student · once',
  per_student_per_day: 'Per student · per day',
  per_group_flat: 'Per group · once',
  per_group_per_day: 'Per group · per day',
  transport_per_day: 'Per transport day',
  per_assistant_per_day: 'Per assistant · per day',
  per_filmer_per_day: 'Per filmer · per day',
};

export interface CostRate {
  id: string;
  name: string;
  category: string | null;
  driver: CostDriver;
  amount_cents: number;
  active: boolean;
  notes: string | null;
}
export interface CoachPayRate { level_name: string; group_size: number; per_day_cents: number }
export interface RecipeRow { cost_rate_id: string; enabled: boolean; override_cents: number | null; qty?: number | null }
export interface CostLine { name: string; category: string | null; driver: string; unit_cents: number; qty: number; qty_label: string; total_cents: number; real_qty: number; real_qty_label: string; real_total_cents: number }
export interface CampCostBreakdown {
  students: number; days: number; transportDays: number; assistants: number; filmers: number;
  level: string | null;
  lines: CostLine[];
  coachLine: CostLine | null;
  totalCents: number;
  deliveredDays: number;
  realTransportDays: number;
  realTotalCents: number;
  revenueCollectedCents: number;
  revenueCommittedCents: number;
  marginCents: number;
  marginPct: number | null;
  realMarginCents: number;
  saleMix: { full: number; discount: number; courtesy: number; unset: number };
  matrixMissing: boolean;
}
