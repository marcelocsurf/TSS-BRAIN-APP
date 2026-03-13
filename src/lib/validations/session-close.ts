import type { SessionStatus } from '@/lib/constants';

// ═══════════════════════════════════════
// SESSION CLOSE VALIDATION
// Canon: Non-negotiable mandatory fields
// ═══════════════════════════════════════

export interface SessionCloseData {
  status: SessionStatus | null;
  focus_rating: number | null;
  frustration_rating: number | null;
  coach_feedback: string | null;
  whats_next: string | null;
  homework: string | null;
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
}

export function validateMandatoryFields(data: SessionCloseData): ValidationResult {
  const missing: string[] = [];

  if (!data.status) missing.push('status');
  if (!data.focus_rating || data.focus_rating < 1 || data.focus_rating > 5)
    missing.push('focus_rating');
  if (!data.frustration_rating || data.frustration_rating < 1 || data.frustration_rating > 10)
    missing.push('frustration_rating');
  if (!data.coach_feedback || data.coach_feedback.trim().length < 10)
    missing.push('coach_feedback (min 10 characters)');
  if (!data.whats_next || data.whats_next.trim().length < 5)
    missing.push('whats_next (min 5 characters)');
  if (!data.homework || data.homework.trim().length < 5)
    missing.push('homework (min 5 characters)');

  return { valid: missing.length === 0, missing };
}
