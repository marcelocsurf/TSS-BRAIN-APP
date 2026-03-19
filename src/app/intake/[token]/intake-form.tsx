'use client';

import { useState } from 'react';
import { submitBasicIntake, submitIntake, type IntakeFormInput, type BasicIntakeInput } from '@/lib/actions/intake';
import { BRAND } from '@/lib/constants/brand';

interface StudentData {
  gender?: string | null;
  nationality?: string | null;
  languages?: string | null;
  instagram?: string | null;
  date_of_birth?: string | null;
  stance?: string | null;
  surf_experience_years?: string | null;
  surf_frequency?: string | null;
  board_type?: string | null;
  other_sports?: string | null;
  learning_style?: string | null;
  goal_short_term?: string | null;
  goal_mid_term?: string | null;
  goal_long_term?: string | null;
  biggest_barrier?: string | null;
  fears_phobias?: string | null;
  swim_level?: string | null;
  allergies?: string | null;
  injuries?: string | null;
  medical_notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  height?: string | null;
  weight?: string | null;
  shirt_size?: string | null;
  how_did_you_hear?: string | null;
  returning_student?: boolean;
  waiver_signed?: boolean;
  waiver_signed_at?: string | null;
  intake_completed_at?: string | null;
  intake_tier?: string | null;
}

interface Props {
  token: string;
  student: StudentData;
}

type Stage = 'basic' | 'basic_done' | 'extended' | 'all_done';

export function IntakeForm({ token, student }: Props) {
  // Determine initial stage based on existing data
  const initialStage: Stage =
    student.intake_tier === 'extended' ? 'all_done'
    : student.intake_tier === 'basic' || (student.waiver_signed && student.emergency_contact_name) ? 'basic_done'
    : 'basic';

  const [stage, setStage] = useState<Stage>(initialStage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extendedStep, setExtendedStep] = useState(0);

  // ── Basic intake form state ──
  const [basicForm, setBasicForm] = useState<BasicIntakeInput>({
    emergency_contact_name: student.emergency_contact_name || '',
    emergency_contact_phone: student.emergency_contact_phone || '',
    swim_level: student.swim_level || '',
    allergies: student.allergies || '',
    medical_notes: student.medical_notes || '',
    waiver_signed: student.waiver_signed || false,
  });

  // ── Extended intake form state ──
  const [extForm, setExtForm] = useState<IntakeFormInput>({
    date_of_birth: student.date_of_birth || '',
    gender: student.gender || '',
    nationality: student.nationality || '',
    languages: student.languages || '',
    instagram: student.instagram || '',
    stance: student.stance || '',
    surf_experience_years: student.surf_experience_years || '',
    surf_frequency: student.surf_frequency || '',
    board_type: student.board_type || '',
    other_sports: student.other_sports || '',
    learning_style: student.learning_style || '',
    goal_short_term: student.goal_short_term || '',
    goal_mid_term: student.goal_mid_term || '',
    goal_long_term: student.goal_long_term || '',
    biggest_barrier: student.biggest_barrier || '',
    fears_phobias: student.fears_phobias || '',
    height: student.height || '',
    weight: student.weight || '',
    shirt_size: student.shirt_size || '',
    how_did_you_hear: student.how_did_you_hear || '',
    returning_student: student.returning_student || false,
  });

  const setBasic = (field: keyof BasicIntakeInput, value: string | boolean) =>
    setBasicForm((prev) => ({ ...prev, [field]: value }));

  const setExt = (field: keyof IntakeFormInput, value: string | boolean) =>
    setExtForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit Stage 1 (Basic) ──
  const handleBasicSubmit = async () => {
    if (!basicForm.emergency_contact_name?.trim()) {
      setError('Emergency contact name is required.');
      return;
    }
    if (!basicForm.emergency_contact_phone?.trim()) {
      setError('Emergency contact phone is required.');
      return;
    }
    if (!basicForm.swim_level) {
      setError('Please select your swim level.');
      return;
    }
    if (!basicForm.waiver_signed) {
      setError('Please acknowledge the waiver to continue.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitBasicIntake(token, basicForm);
      setStage('basic_done');
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit Stage 2 (Extended) ──
  const handleExtendedSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await submitIntake(token, extForm);
      setStage('all_done');
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════
  // ALL DONE
  // ═══════════════════════════════════════

  if (stage === 'all_done') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center space-y-3">
        <p className="text-3xl">&#129305;</p>
        <p className="text-lg font-bold text-[var(--tss-navy)]">Profile complete!</p>
        <p className="text-sm text-gray-500">
          Your coach will have everything they need to prepare your sessions.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          You can close this page. See you in the water.
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // BASIC DONE — show success + option to continue
  // ═══════════════════════════════════════

  if (stage === 'basic_done') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center space-y-2">
          <p className="text-2xl text-green-600">&#10003;</p>
          <p className="text-sm font-semibold text-green-700">Basic intake complete</p>
          <p className="text-xs text-green-600">
            Safety info and waiver are saved. You&apos;re cleared for sessions.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center space-y-3">
          <p className="text-sm text-gray-600 font-medium">Want to help your coach even more?</p>
          <p className="text-xs text-gray-400">
            Add your surf experience, goals, and personal details. Takes about 3 minutes.
          </p>
          <button
            type="button"
            onClick={() => setStage('extended')}
            className="w-full py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            Continue to Extended Profile
          </button>
          <p className="text-[10px] text-gray-400">You can also do this later from the same link.</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // STAGE 1: BASIC INTAKE
  // ═══════════════════════════════════════

  if (stage === 'basic') {
    return (
      <div className="space-y-4">
        {/* Stage indicator */}
        <StageIndicator current={1} />

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
              Safety &amp; Medical — Required
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <OptionGroup
              label="How well do you swim? *"
              value={basicForm.swim_level}
              onChange={(v) => setBasic('swim_level', v)}
              options={['None', 'Basic', 'Intermediate', 'Strong']}
            />
            <Field
              label="Allergies / Medical Conditions"
              value={basicForm.allergies || ''}
              onChange={(v) => setBasic('allergies', v)}
              placeholder="e.g. Penicillin, shellfish, asthma, none"
            />
            <TextArea
              label="Additional Medical Notes"
              value={basicForm.medical_notes || ''}
              onChange={(v) => setBasic('medical_notes', v)}
              placeholder="e.g. Asthma, epilepsy, medications"
            />
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-red-600 mb-3">
                Emergency Contact *
              </p>
              <Field
                label="Contact Name"
                value={basicForm.emergency_contact_name}
                onChange={(v) => setBasic('emergency_contact_name', v)}
                placeholder="Full name"
                required
              />
              <div className="mt-3">
                <Field
                  label="Contact Phone"
                  value={basicForm.emergency_contact_phone}
                  onChange={(v) => setBasic('emergency_contact_phone', v)}
                  placeholder="+1 555 123 4567"
                  type="tel"
                  required
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  I acknowledge that surf training involves inherent risks. I release The Surf Sequence&reg;, its coaches,
                  and affiliated academies from liability for injuries during training sessions, whether self-directed
                  or coach-supervised. I confirm the medical information provided is accurate.
                </p>
              </div>
              <Checkbox
                label="I agree to the above waiver and liability release *"
                checked={basicForm.waiver_signed}
                onChange={(v) => setBasic('waiver_signed', v)}
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <button
          type="button"
          onClick={handleBasicSubmit}
          disabled={loading}
          className="w-full py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
          style={{ background: BRAND.colors.navy }}
        >
          {loading ? 'Saving...' : 'Submit Safety Info & Waiver'}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // STAGE 2: EXTENDED INTAKE
  // ═══════════════════════════════════════

  const EXT_STEPS = [
    { title: 'About You', icon: '\u{1F464}' },
    { title: 'Surf Experience', icon: '\u{1F3C4}' },
    { title: 'Your Goals', icon: '\u{1F3AF}' },
    { title: 'Final Details', icon: '\u2713' },
  ];
  const extTotalSteps = EXT_STEPS.length;

  return (
    <div className="space-y-4">
      {/* Stage indicator */}
      <StageIndicator current={2} />

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          {EXT_STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setExtendedStep(i)}
              className={`flex flex-col items-center gap-1 transition-all ${
                i === extendedStep ? 'scale-110' : 'opacity-40'
              }`}
            >
              <span className="text-lg">{s.icon}</span>
              <span className="text-[9px] text-gray-500 hidden sm:block">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((extendedStep + 1) / extTotalSteps) * 100}%`,
              background: BRAND.colors.navy,
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
            {EXT_STEPS[extendedStep].icon} {EXT_STEPS[extendedStep].title}
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* ── STEP 0: ABOUT YOU ── */}
          {extendedStep === 0 && (
            <>
              <Field
                label="Date of Birth"
                type="date"
                value={(extForm.date_of_birth as string) || ''}
                onChange={(v) => setExt('date_of_birth', v)}
              />
              <Select
                label="Gender"
                value={(extForm.gender as string) || ''}
                onChange={(v) => setExt('gender', v)}
                options={['', 'Male', 'Female', 'Other', 'Prefer not to say']}
              />
              <Field
                label="Nationality"
                value={(extForm.nationality as string) || ''}
                onChange={(v) => setExt('nationality', v)}
                placeholder="e.g. American, Brazilian, German"
              />
              <Field
                label="Languages"
                value={(extForm.languages as string) || ''}
                onChange={(v) => setExt('languages', v)}
                placeholder="e.g. English, Spanish"
              />
              <Field
                label="Instagram"
                value={(extForm.instagram as string) || ''}
                onChange={(v) => setExt('instagram', v)}
                placeholder="@yourusername"
              />
              <FormRow>
                <Field
                  label="Height"
                  value={(extForm.height as string) || ''}
                  onChange={(v) => setExt('height', v)}
                  placeholder={`5'10" or 178cm`}
                />
                <Field
                  label="Weight"
                  value={(extForm.weight as string) || ''}
                  onChange={(v) => setExt('weight', v)}
                  placeholder="165 lbs or 75 kg"
                />
              </FormRow>
            </>
          )}

          {/* ── STEP 1: SURF EXPERIENCE ── */}
          {extendedStep === 1 && (
            <>
              <OptionGroup
                label="What's your stance?"
                value={(extForm.stance as string) || ''}
                onChange={(v) => setExt('stance', v)}
                options={['Regular', 'Goofy', 'Not sure']}
              />
              <Select
                label="Surf experience"
                value={(extForm.surf_experience_years as string) || ''}
                onChange={(v) => setExt('surf_experience_years', v)}
                options={[
                  '', 'Never surfed', 'Less than 1 year',
                  '1-3 years', '3-5 years', '5+ years',
                ]}
              />
              <Select
                label="How often do you surf?"
                value={(extForm.surf_frequency as string) || ''}
                onChange={(v) => setExt('surf_frequency', v)}
                options={[
                  '', 'This is my first time', 'A few times a year',
                  'Monthly', 'Weekly',
                ]}
              />
              <Select
                label="What board do you usually ride?"
                value={(extForm.board_type as string) || ''}
                onChange={(v) => setExt('board_type', v)}
                options={[
                  '', 'Never surfed', 'Foamie / Soft top',
                  'Funboard', 'Shortboard', 'Longboard', 'Other',
                ]}
              />
              <Field
                label="Other sports you practice"
                value={(extForm.other_sports as string) || ''}
                onChange={(v) => setExt('other_sports', v)}
                placeholder="e.g. Skateboarding, swimming, BJJ"
              />
              <OptionGroup
                label="How do you learn best?"
                value={(extForm.learning_style as string) || ''}
                onChange={(v) => setExt('learning_style', v)}
                options={[
                  'Watching (visual)',
                  'Doing (kinesthetic)',
                  'Hearing explanations',
                  'Not sure',
                ]}
              />
            </>
          )}

          {/* ── STEP 2: GOALS ── */}
          {extendedStep === 2 && (
            <>
              <TextArea
                label="What do you want to achieve this trip?"
                value={(extForm.goal_short_term as string) || ''}
                onChange={(v) => setExt('goal_short_term', v)}
                placeholder="e.g. Stand up consistently, catch my own waves"
              />
              <TextArea
                label="Where do you want to be in 3-6 months?"
                value={(extForm.goal_mid_term as string) || ''}
                onChange={(v) => setExt('goal_mid_term', v)}
                placeholder="e.g. Surf unbroken waves, start turning"
              />
              <TextArea
                label="What's your dream with surfing? (1-3 years)"
                value={(extForm.goal_long_term as string) || ''}
                onChange={(v) => setExt('goal_long_term', v)}
                placeholder="e.g. Surf confidently anywhere I travel"
              />
              <TextArea
                label="What has held you back so far?"
                value={(extForm.biggest_barrier as string) || ''}
                onChange={(v) => setExt('biggest_barrier', v)}
                placeholder="e.g. Fear of big waves, no consistency, bad habits"
              />
              <TextArea
                label="Any fears related to the ocean or surfing?"
                value={(extForm.fears_phobias as string) || ''}
                onChange={(v) => setExt('fears_phobias', v)}
                placeholder="Be honest \u2014 it helps us coach you better"
                hint="This is confidential. Only your coach team sees it."
              />
            </>
          )}

          {/* ── STEP 3: FINAL DETAILS ── */}
          {extendedStep === 3 && (
            <>
              <Select
                label="Shirt Size"
                value={(extForm.shirt_size as string) || ''}
                onChange={(v) => setExt('shirt_size', v)}
                options={['', 'XS', 'S', 'M', 'L', 'XL', 'XXL']}
              />
              <Select
                label="How did you hear about us?"
                value={(extForm.how_did_you_hear as string) || ''}
                onChange={(v) => setExt('how_did_you_hear', v)}
                options={[
                  '', 'Instagram', 'Friend or referral', 'Google',
                  'Travel agency', 'Returning student', 'Other',
                ]}
              />
              <Checkbox
                label="I've been to Puro Surf before"
                checked={extForm.returning_student || false}
                onChange={(v) => setExt('returning_student', v)}
              />
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {extendedStep > 0 && (
          <button
            type="button"
            onClick={() => { setExtendedStep(extendedStep - 1); setError(''); }}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {extendedStep < extTotalSteps - 1 ? (
          <button
            type="button"
            onClick={() => { setExtendedStep(extendedStep + 1); setError(''); }}
            className="flex-1 py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleExtendedSubmit}
            disabled={loading}
            className="flex-1 py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            {loading ? 'Submitting...' : 'Complete Profile'}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// STAGE INDICATOR
// ═══════════════════════════════════════

function StageIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 flex-1 ${current >= 1 ? '' : 'opacity-40'}`}>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: current >= 1 ? BRAND.colors.navy : '#D1D5DB' }}
          >
            {current > 1 ? '\u2713' : '1'}
          </div>
          <span className="text-xs font-medium text-gray-700">Safety &amp; Waiver</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-200" />
        <div className={`flex items-center gap-2 flex-1 ${current >= 2 ? '' : 'opacity-40'}`}>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: current >= 2 ? BRAND.colors.navy : '#D1D5DB' }}
          >
            2
          </div>
          <span className="text-xs font-medium text-gray-700">Extended Profile</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// FORM COMPONENTS (reused)
// ═══════════════════════════════════════

function Field({ label, value, onChange, type = 'text', placeholder, required, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] focus:border-transparent"
      />
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] focus:border-transparent"
      />
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o || '\u2014 Select \u2014'}</option>
        ))}
      </select>
    </div>
  );
}

function OptionGroup({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-2 text-xs rounded-lg border transition-all ${
              value === opt
                ? 'border-transparent text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
            }`}
            style={value === opt ? { background: BRAND.colors.navy } : {}}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Checkbox({ label, checked, onChange, required }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          checked
            ? 'border-transparent text-white'
            : 'border-gray-300 group-hover:border-gray-400'
        }`}
        style={checked ? { background: BRAND.colors.navy } : {}}
      >
        {checked && <span className="text-xs font-bold">{'\u2713'}</span>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
      <span className="text-xs text-gray-600 leading-relaxed">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
    </label>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
