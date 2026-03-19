'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStudent, type CreateStudentInput } from '@/lib/actions/students';
import { BELT_HIERARCHY, BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const SWIM_LEVELS = ['Non-swimmer', 'Beginner', 'Intermediate', 'Advanced'];
const OCEAN_LEVELS = ['beginner', 'supervised', 'autonomous', 'advanced'];
const SURF_EXPERIENCE_OPTIONS = [
  'None',
  'Beginner (< 1 year)',
  'Intermediate (1-3 years)',
  'Advanced (3+ years)',
  'Professional',
];

const WAIVER_TEXT =
  'I acknowledge that surf training involves inherent risks. I release The Surf Sequence\u00AE, its coaches, and affiliated academies from liability for injuries during training sessions, whether self-directed or coach-supervised. I confirm the medical information provided is accurate.';

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateStudentInput>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    swim_level: 'Non-swimmer',
    allergies: '',
    belt_level: 'white_belt',
    ocean_level: 'beginner',
    surf_experience: 'None',
    waiver_signed: false,
  });

  const set = (field: keyof CreateStudentInput, value: string | number | boolean | undefined) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.waiver_signed) {
      setError('The liability waiver must be signed before registering a student.');
      return;
    }

    setLoading(true);

    try {
      const student = await createStudent(form);
      router.push(`/students/${student.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create student');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-[var(--tss-navy)] mb-1">Add Student</h2>
      <p className="text-sm text-gray-500 mb-6">Complete all required fields to register a new student.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── IDENTITY ── */}
        <Section title="Student Identity">
          <Row>
            <Field label="First Name *" value={form.first_name} onChange={(v) => set('first_name', v)} required />
            <Field label="Last Name *" value={form.last_name} onChange={(v) => set('last_name', v)} required />
          </Row>
          <Field
            label="Date of Birth *"
            value={form.date_of_birth || ''}
            onChange={(v) => set('date_of_birth', v)}
            type="date"
            required
          />
        </Section>

        {/* ── CONTACT INFO ── */}
        <Section title="Contact Info">
          <Field
            label="Email"
            value={form.email || ''}
            onChange={(v) => set('email', v)}
            type="email"
            hint="Required for post-session emails and portal access"
          />
          <Field
            label="Phone"
            value={form.phone || ''}
            onChange={(v) => set('phone', v)}
            type="tel"
          />
        </Section>

        {/* ── EMERGENCY CONTACT ── */}
        <Section title="Emergency Contact">
          <Field
            label="Emergency Contact Name *"
            value={form.emergency_contact_name}
            onChange={(v) => set('emergency_contact_name', v)}
            required
          />
          <Field
            label="Emergency Contact Phone *"
            value={form.emergency_contact_phone}
            onChange={(v) => set('emergency_contact_phone', v)}
            type="tel"
            required
          />
        </Section>

        {/* ── SAFETY & MEDICAL ── */}
        <Section title="Safety & Medical">
          <Select
            label="Swim Level *"
            value={form.swim_level || 'Non-swimmer'}
            onChange={(v) => set('swim_level', v)}
            options={SWIM_LEVELS}
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Allergies / Medical Notes</label>
            <textarea
              value={form.allergies || ''}
              onChange={(e) => set('allergies', e.target.value)}
              placeholder="List any allergies, medical conditions, or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] focus:border-transparent resize-none"
            />
          </div>
        </Section>

        {/* ── PROGRESSION ── */}
        <Section title="Progression Level">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Belt Level *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {BELT_HIERARCHY.map((belt) => (
                <button
                  key={belt}
                  type="button"
                  onClick={() => set('belt_level', belt)}
                  className={`px-2 py-2 text-xs rounded-lg border transition-all ${
                    form.belt_level === belt
                      ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mr-1"
                    style={{ backgroundColor: BELT_DISPLAY[belt].color }}
                  />
                  {BELT_DISPLAY[belt].levelName}
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Ocean Level *"
            value={form.ocean_level || 'beginner'}
            onChange={(v) => set('ocean_level', v)}
            options={OCEAN_LEVELS}
          />

          <Select
            label="Surf Experience *"
            value={form.surf_experience || 'None'}
            onChange={(v) => set('surf_experience', v)}
            options={SURF_EXPERIENCE_OPTIONS}
          />
        </Section>

        {/* ── WAIVER ── */}
        <Section title="Liability Waiver">
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
            {WAIVER_TEXT}
          </div>
          <label className="flex items-start gap-3 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={!!form.waiver_signed}
              onChange={(e) => set('waiver_signed', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[var(--tss-navy)] focus:ring-[var(--tss-gold)]"
            />
            <span className="text-sm text-gray-700 font-medium">
              I have read and agree to the liability waiver above <span className="text-red-500">*</span>
            </span>
          </label>
          {!form.waiver_signed && (
            <p className="text-xs text-amber-600 mt-1">
              The waiver must be accepted before the student can be registered.
            </p>
          )}
        </Section>

        {/* Error */}
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !form.waiver_signed}
            className="flex-1 py-2.5 bg-[var(--tss-navy)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Reusable form components ──

function Section({ title, children }: {
  title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="w-full px-4 py-3 text-left text-sm font-semibold text-[var(--tss-navy)]">
        {title}
      </div>
      <div className="px-4 pb-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, value, onChange, type = 'text', required, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string; hint?: string;
}) {
  const cls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] focus:border-transparent";
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} placeholder={placeholder} className={cls} />
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
