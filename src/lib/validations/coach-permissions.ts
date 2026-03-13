import { type BeltLevel, canCoachBelt, getBeltLabel } from '@/lib/constants/belts';
import { type CoachRole, COACH_ROLE_RANK } from '@/lib/constants/brand';

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

export function canCoachStudent(
  coachMaxBelt: BeltLevel,
  studentBelt: BeltLevel
): PermissionResult {
  if (canCoachBelt(coachMaxBelt, studentBelt)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Coach authorized up to ${getBeltLabel(coachMaxBelt)}. Student is ${getBeltLabel(studentBelt)}.`,
  };
}

export function canOverrideOceanAlert(coachRole: CoachRole, requiredRole: CoachRole | null): boolean {
  if (!requiredRole) return false;
  return COACH_ROLE_RANK[coachRole] >= COACH_ROLE_RANK[requiredRole];
}
