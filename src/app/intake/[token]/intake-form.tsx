'use client';

import { useState } from 'react';
import { submitIntake, type IntakeFormInput } from '@/lib/actions/intake';
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
}

interface Props {
  token: string;
  student: StudentData;
}

export function IntakeForm({ token, student }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  const [form, setForm] = useState<IntakeFormInput>({
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
    swim_level: student.swim_level || '',
    allergies: student.allergies || '',
    injuries: student.injuries || '',
    medical_notes: student.medical_notes || '',
    emergency_contact_name: student.emergency_contact_name || '',
    emergency_contact_phone: student.emergency_contact_phone || '',
    height: student.height || '',
    weight: student.weight || '',
    shirt_size: student.shirt_size || '',
    how_did_you_hear: student.how_did_you_hear || '',
    returning_student: student.returning_student || false,
    waiver_signed: student.waiver_signed || false,
  });

  const set = (field: keyof IntakeFormInput, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.emergency_contact_name || !form.emergency_contact_phone) {
      setError('Emergency contact is required.');
      return;
    }
    if (!form.waiver_signed) {
      setError('Please acknowledge the waiver to continue.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitIntake(token, form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center space-y-3">
        <p className="text-3xl">🤙</p>
        <p className="text-lg font-bold text-[var(--tss-navy)]">You're all set!</p>
        <p className="text-sm text-gray-500">
          Your coach will have everything they need to prepare your sessions.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          You can close this page. See you in the water.
        </p>
      </div>
    );
  }

  const STEPS = [
    { title: 'About You', icon: '👤' },
    { title: 'Surf Experience', icon: '🏄' },
    { title: 'Your Goals', icon: '🎯' },
    { title: 'Safety & Medical', icon: '🏥' },
    { title: 'Final Details', icon: '✓' },
  ];

  const totalSteps = STEPS.length;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`flex flex-col items-center gap-1 transition-all ${
                i === step ? 'scale-110' : 'opacity-40'
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
              width: `${((step + 1) / totalSteps) * 100}%`,
              background: BRAND.colors.navy,
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
            {STEPS[step].icon} {STEPS[step].title}
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* ── STEP 0: ABOUT YOU ── */}
          {step === 0 && (
            <>
              <Field
                label="Date of Birth"
                type="date"
                value={(form.date_of_birth as string) || ''}
                onChange={(v) => set('date_of_birth', v)}
              />
              <Select
                label="Gender"
                value={(form.gender as string) || ''}
                onChange={(v) => set('gender', v)}
                options={['', 'Male', 'Female', 'Other', 'Prefer not to say']}
              />
              <Field
                label="Nationality"
                value={(form.nationality as string) || ''}
                onChange={(v) => set('nationality', v)}
                placeholder="e.g. American, Brazilian, German"
              />
              <Field
                label="Languages"
                value={(form.languages as string) || ''}
                onChange={(v) => set('languages', v)}
                placeholder="e.g. English, Spanish"
              />
              <Field
                label="Instagram"
                value={(form.instagram as string) || ''}
                onChange={(v) => set('instagram', v)}
                placeholder="@yourusername"
              />
              <Row>
                <Field
                  label="Height"
                  value={(form.height as string) || ''}
                  onChange={(v) => set('height', v)}
                  placeholder={`5'10" or 178cm`}
                />
                <Field
                  label="Weight"
                  value={(form.weight as string) || ''}
                  onChange={(v) => set('weight', v)}
                  placeholder="165 lbs or 75 kg"
                />
              </Row>
              <Select
                label="Shirt Size"
                value={(form.shirt_size as string) || ''}
                onChange={(v) => set('shirt_size', v)}
                options={['', 'XS', 'S', 'M', 'L', 'XL', 'XXL']}
              />
            </>
          )}

          {/* ── STEP 1: SURF EXPERIENCE ── */}
          {step === 1 && (
            <>
              <OptionGroup
                label="What's your stance?"
                value={(form.stance as string) || ''}
                onChange={(v) => set('stance', v)}
                options={['Regular', 'Goofy', 'Not sure']}
              />
              <Select
                label="Surf experience"
                value={(form.surf_experience_years as string) || ''}
                onChange={(v) => set('surf_experience_years', v)}
                options={[
                  '', 'Never surfed', 'Less than 1 year',
                  '1-3 years', '3-5 years', '5+ years',
                ]}
              />
              <Select
                label="How often do you surf?"
                value={(form.surf_frequency as string) || ''}
                onChange={(v) => set('surf_frequency', v)}
                options={[
                  '', 'This is my first time', 'A few times a year',
                  'Monthly', 'Weekly',
                ]}
              />
              <Select
                label="What board do you usually ride?"
                value={(form.board_type as string) || ''}
                onChange={(v) => set('board_type', v)}
                options={[
                  '', 'Never surfed', 'Foamie / Soft top',
                  'Funboard', 'Shortboard', 'Longboard', 'Other',
                ]}
              />
              <Field
                label="Other sports you practice"
                value={(form.other_sports as string) || ''}
                onChange={(v) => set('other_sports', v)}
                placeholder="e.g. Skateboarding, swimming, BJJ"
              />
              <OptionGroup
                label="How do you learn best?"
                value={(form.learning_style as string) || ''}
                onChange={(v) => set('learning_style', v)}
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
          {step === 2 && (
            <>
              <TextArea
                label="What do you want to achieve this trip?"
                value={(form.goal_short_term as string) || ''}
                onChange={(v) => set('goal_short_term', v)}
                placeholder="e.g. Stand up consistently, catch my own waves"
              />
              <TextArea
                label="Where do you want to be in 3-6 months?"
                value={(form.goal_mid_term as string) || ''}
                onChange={(v) => set('goal_mid_term', v)}
                placeholder="e.g. Surf unbroken waves, start turning"
              />
              <TextArea
                label="What's your dream with surfing? (1-3 years)"
                value={(form.goal_long_term as string) || ''}
                onChange={(v) => set('goal_long_term', v)}
                placeholder="e.g. Surf confidently anywhere I travel"
              />
              <TextArea
                label="What has held you back so far?"
                value={(form.biggest_barrier as string) || ''}
                onChange={(v) => set('biggest_barrier', v)}
                placeholder="e.g. Fear of big waves, no consistency, bad habits"
              />
              <TextArea
                label="Any fears related to the ocean or surfing?"
                value={(form.fears_phobias as string) || ''}
                onChange={(v) => set('fears_phobias', v)}
                placeholder="Be honest — it helps us coach you better"
                hint="This is confidential. Only your coach team sees it."
              />
            </>
          )}

          {/* ── STEP 3: SAFETY ── */}
          {step === 3 && (
            <>
              <OptionGroup
                label="How well do you swim?"
                value={(form.swim_level as string) || ''}
                onChange={(v) => set('swim_level', v)}
                options={['None', 'Basic', 'Intermediate', 'Strong']}
              />
              <Field
                label="Allergies"
                value={(form.allergies as string) || ''}
                onChange={(v) => set('allergies', v)}
                placeholder="e.g. Penicillin, shellfish, none"
              />
              <Field
                label="Current or recent injuries"
                value={(form.injuries as string) || ''}
                onChange={(v) => set('injuries', v)}
                placeholder="e.g. Sprained ankle (2 weeks ago), none"
              />
              <TextArea
                label="Anything else medical we should know?"
                value={(form.medical_notes as string) || ''}
                onChange={(v) => set('medical_notes', v)}
                placeholder="e.g. Asthma, epilepsy, medications"
              />
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-red-600 mb-3">
                  Emergency Contact *
                </p>
                <Field
                  label="Contact Name"
                  value={(form.emergency_contact_name as string) || ''}
                  onChange={(v) => set('emergency_contact_name', v)}
                  placeholder="Full name"
                  required
                />
                <div className="mt-3">
                  <Field
                    label="Contact Phone"
                    value={(form.emergency_contact_phone as string) || ''}
                    onChange={(v) => set('emergency_contact_phone', v)}
                    placeholder="+1 555 123 4567"
                    type="tel"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* ── STEP 4: FINAL ── */}
          {step === 4 && (
            <>
              <Select
                label="How did you hear about us?"
                value={(form.how_did_you_hear as string) || ''}
                onChange={(v) => set('how_did_you_hear', v)}
                options={[
                  '', 'Instagram', 'Friend or referral', 'Google',
                  'Travel agency', 'Returning student', 'Other',
                ]}
              />
              <Checkbox
                label="I've been to Puro Surf before"
                checked={form.returning_student || false}
                onChange={(v) => set('returning_student', v)}
              />
              <div className="pt-4 border-t border-gray-100">
                <Checkbox
                  label="I acknowledge the inherent risks of ocean sports and confirm the information above is accurate."
                  checked={form.waiver_signed || false}
                  onChange={(v) => set('waiver_signed', v)}
                  required
                />
              </div>
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
        {step > 0 && (
          <button
            type="button"
            onClick={() => { setStep(step - 1); setError(''); }}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={() => { setStep(step + 1); setError(''); }}
            className="flex-1 py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            {loading ? 'Submitting...' : 'Submit Profile'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Form components ──

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
          <option key={o} value={o}>{o || '— Select —'}</option>
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
        {checked && <span className="text-xs font-bold">✓</span>}
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

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
