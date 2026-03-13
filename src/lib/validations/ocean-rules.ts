import type { BeltLevel } from '@/lib/constants/belts';
import type { OceanCondition, RiskState, CoachRole } from '@/lib/constants/brand';

export interface OceanRuleResult {
  state: RiskState;
  note: string | null;
  overrideAllowed: boolean;
  overrideRole: CoachRole | null;
}

export interface OceanRule {
  belt_level: BeltLevel;
  ocean_condition: OceanCondition;
  rule_state: RiskState;
  coach_note: string | null;
  override_allowed: boolean;
  override_role_required: CoachRole | null;
}

export function checkOceanRule(
  rules: OceanRule[],
  beltLevel: BeltLevel,
  condition: OceanCondition
): OceanRuleResult {
  const rule = rules.find(
    (r) => r.belt_level === beltLevel && r.ocean_condition === condition
  );

  if (!rule) {
    return { state: 'safe', note: null, overrideAllowed: false, overrideRole: null };
  }

  return {
    state: rule.rule_state,
    note: rule.coach_note,
    overrideAllowed: rule.override_allowed,
    overrideRole: rule.override_role_required,
  };
}
