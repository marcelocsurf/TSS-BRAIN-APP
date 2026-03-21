'use client';

import type { CascadeFormState, PilarPart, DrillOption } from '@/types/session';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

interface Props {
  formState: CascadeFormState;
  pilarParts: PilarPart[];
  drills: DrillOption[];
  onContinueToClose: () => void;
  onBackToPlanning: () => void;
}

export function SessionPlanReview({ formState, pilarParts, drills, onContinueToClose, onBackToPlanning }: Props) {
  const student = formState.student;
  const belt = student?.belt_level as BeltLevel | undefined;
  const beltInfo = belt ? BELT_DISPLAY[belt] : null;

  const pilarPart = pilarParts.find(p => p.id === formState.pilar_part_id);
  const drill = drills.find(d => d.id === formState.drill_id);

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-[var(--tss-cyan)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
          Session Plan Complete
        </p>
        <h2 className="text-xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Review Your Plan
        </h2>
        <p className="text-sm text-[var(--tss-gray-500)] mt-1">
          Review the session plan before starting. You can go back to edit.
        </p>
      </div>

      {/* Student Card */}
      <div className="bg-[var(--tss-gray-50)] rounded-xl p-4 mb-4 border border-[var(--tss-gray-100)]">
        <div className="flex items-center gap-3 mb-3">
          {beltInfo && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: beltInfo.color === '#E8E8E8' ? '#999' : beltInfo.color }}>
              {student?.first_name?.[0] || '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-[var(--tss-navy)]">
              {student?.first_name} {student?.last_name}
            </p>
            <p className="text-xs text-[var(--tss-gray-500)]">
              {beltInfo?.levelName || 'Unknown'} — Seq #{student?.current_sequence_number || 1} / Step {student?.current_step_order || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Summary Cards */}
      <div className="space-y-3">

        {/* Context */}
        <PlanSection title="Context" color="var(--tss-cyan)">
          <PlanRow label="Venue" value={formatVenue(formState.training_venue)} />
          {formState.ocean_conditions && (
            <PlanRow label="Ocean" value={formatOcean(formState.ocean_conditions)} badge={formState.oceanRiskState} />
          )}
          <PlanRow label="Type" value={capitalize(formState.session_type)} />
          <PlanRow label="Date" value={formState.session_date || 'Today'} />
          {formState.session_time && <PlanRow label="Time" value={formState.session_time} />}
        </PlanSection>

        {/* Focus */}
        <PlanSection title="Focus" color="var(--tss-gold)">
          <PlanRow label="Pilar" value={capitalize(formState.pilar_id_snapshot)} />
          <PlanRow label="Part" value={pilarPart?.name || '—'} />
          {formState.mission && <PlanRow label="Mission" value={formState.mission} />}
          {formState.mission_type && <PlanRow label="Mission Type" value={formatMissionType(formState.mission_type)} />}
        </PlanSection>

        {/* Drill & Prep */}
        <PlanSection title="Drill & Preparation" color="var(--tss-success)">
          <PlanRow label="Drill" value={drill?.name || formState.drill_id || '—'} />
          {formState.warm_up && <PlanRow label="Warm-up" value={formatLabel(formState.warm_up)} />}
          {formState.simulation && <PlanRow label="Simulation" value={formatLabel(formState.simulation)} />}
          {formState.mental_hack && <PlanRow label="Mental Hack" value={formatLabel(formState.mental_hack)} />}
          {formState.mission_time && <PlanRow label="Mission Time" value={`${formState.mission_time} min`} />}
          {formState.repetitions && <PlanRow label="Repetitions" value={String(formState.repetitions)} />}
        </PlanSection>

        {/* Previous Session Reference */}
        {student?.last_session_mission && (
          <PlanSection title="Previous Session" color="var(--tss-gray-500)">
            <PlanRow label="Last Mission" value={student.last_session_mission} />
            {student.last_session_status && <PlanRow label="Status" value={capitalize(student.last_session_status)} />}
            {student.last_homework && <PlanRow label="Homework" value={student.last_homework} />}
          </PlanSection>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBackToPlanning}
          className="flex-1 py-3 border border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] text-sm rounded-xl hover:bg-[var(--tss-gray-50)] transition-all"
        >
          ← Edit Plan
        </button>
        <button
          onClick={onContinueToClose}
          className="flex-1 py-3 bg-[var(--tss-navy)] text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all shadow-sm"
        >
          Start Close →
        </button>
      </div>
    </div>
  );
}

// ── Helper Components ──

function PlanSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--tss-gray-100)] overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b border-[var(--tss-gray-50)] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-[var(--tss-navy)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {title}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        {children}
      </div>
    </div>
  );
}

function PlanRow({ label, value, badge }: { label: string; value: string; badge?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-[var(--tss-gray-500)] shrink-0">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="text-sm text-[var(--tss-navy)] font-medium">{value}</span>
        {badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            badge === 'allowed' ? 'bg-emerald-50 text-emerald-700' :
            badge === 'caution' ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-700'
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Formatters ──

function capitalize(s?: string | null): string {
  if (!s) return '—';
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatVenue(v?: string | null): string {
  if (!v) return '—';
  return v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatOcean(v?: string | null): string {
  if (!v) return '—';
  const map: Record<string, string> = {
    'flat': 'Flat', '1_2ft': '1-2 feet', '3_4ft': '3-4 feet',
    '4_6ft': '4-6 feet', '6_plus': '6+ feet'
  };
  return map[v] || v;
}

function formatLabel(v: string): string {
  return v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatMissionType(v: string): string {
  const map: Record<string, string> = {
    'full_execution': 'Full Movement Execution',
    'technical_detail': 'Technical Detail Focus',
    'error_correction': 'Error Correction',
    'rhythm_timing': 'Rhythm/Timing Focus',
    'control_repetition': 'Control Under Repetition',
    'custom': 'Custom',
  };
  return map[v] || capitalize(v);
}
