'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStudent, type CreateStudentInput } from '@/lib/actions/students';
import { BELT_HIERARCHY, BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

export default function QuickAddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateStudentInput>({
    first_name: '',
    last_name: '',
    belt_level: 'white_belt',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    email: '',
    phone: '',
    age: undefined,
    gender: '',
    nationality: '',
    swim_level: '',
    allergies: '',
    injuries: '',
    medical_notes: '',
    primary_goal: '',
  });

  const set = (field: keyof CreateStudentInput, value: string | number | undefined) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      <p className="text-sm text-gray-500 mb-6">Quick registration — fill required fields and go.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── REQUIRED ── */}
        <Section title="Required">
          <Row>
            <Field label="First Name *" value={form.first_name} onChange={(v) => set('first_name', v)} required />
            <Field label="Last Name *" value={form.last_name} onChange={(v) => set('last_name', v)} required />
          </Row>

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

        {/* ── RECOMMENDED ── */}
        <Section title="Recommended" collapsible>
          <Field label="Email" value={form.email || ''} onChange={(v) => set('email', v)} type="email"
            hint="Needed for post-session emails" />
          <Row>
            <Field label="Age" value={form.age?.toString() || ''} onChange={(v) => set('age', v ? parseInt(v) : undefined)} type="number" />
            <Select label="Gender" value={form.gender || ''} onChange={(v) => set('gender', v)}
              options={['', 'Male', 'Female', 'Other']} />
          </Row>
          <Field label="Nationality" value={form.nationality || ''} onChange={(v) => set('nationality', v)} />
          <Select label="Swim Level" value={form.swim_level || ''} onChange={(v) => set('swim_level', v)}
            options={['', 'None', 'Basic', 'Intermediate', 'Strong']} />
          <Field label="Primary Goal" value={form.primary_goal || ''} onChange={(v) => set('primary_goal', v)}
            placeholder="What does this student want to achieve?" />
        </Section>

        {/* ── MEDICAL ── */}
        <Section title="Safety & Medical" collapsible>
          <Field label="Allergies" value={form.allergies || ''} onChange={(v) => set('allergies', v)} />
          <Field label="Injuries" value={form.injuries || ''} onChange={(v) => set('injuries', v)} />
          <Field label="Medical Notes" value={form.medical_notes || ''} onChange={(v) => set('medical_notes', v)} multiline />
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
            disabled={loading}
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

function Section({ title, children, collapsible }: {
  title: string; children: React.ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen(!open)}
        className={`w-full px-4 py-3 text-left text-sm font-semibold text-[var(--tss-navy)] flex items-center justify-between ${
          collapsible ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
        }`}
      >
        {title}
        {collapsible && <span className="text-gray-400">{open ? '−' : '+'}</span>}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, value, onChange, type = 'text', required, placeholder, hint, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string; hint?: string; multiline?: boolean;
}) {
  const cls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] focus:border-transparent";
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required}
          placeholder={placeholder} rows={2} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          required={required} placeholder={placeholder} className={cls} />
      )}
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
        {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
      </select>
    </div>
  );
}
