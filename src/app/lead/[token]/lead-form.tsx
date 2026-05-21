'use client';

import { useState } from 'react';
import { submitLeadForm } from '@/lib/actions/leads';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface Props {
  token: string;
  initial: {
    firstName: string;
    lastName: string;
    waiverSigned: boolean;
    date_of_birth: string;
    height: string;
    weight: string;
    swim_level: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    allergies: string;
    injuries: string;
    medical_notes: string;
  };
}

const SWIM_LEVELS = [
  { value: 'none', label: "Can't swim" },
  { value: 'basic', label: 'Basic — floats, short distances' },
  { value: 'intermediate', label: 'Intermediate — comfortable in deep water' },
  { value: 'advanced', label: 'Advanced — strong swimmer' },
] as const;

export default function LeadForm({ token, initial }: Props) {
  const [form, setForm] = useState({
    date_of_birth: initial.date_of_birth,
    height: initial.height,
    weight: initial.weight,
    swim_level: initial.swim_level,
    emergency_contact_name: initial.emergency_contact_name,
    emergency_contact_phone: initial.emergency_contact_phone,
    allergies: initial.allergies,
    injuries: initial.injuries,
    medical_notes: initial.medical_notes,
    waiver: initial.waiverSigned,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(initial.waiverSigned);

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitLeadForm(token, {
        date_of_birth: form.date_of_birth,
        height: form.height || null,
        weight: form.weight || null,
        swim_level: form.swim_level,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        allergies: form.allergies || null,
        injuries: form.injuries || null,
        medical_notes: form.medical_notes || null,
        waiver_signed: form.waiver,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <CheckCircle2 size={48} strokeWidth={1.75} className="text-[var(--tss-cyan)] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[var(--tss-navy)] mb-2">All set, {initial.firstName}!</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your safety info is saved. Your coach will be in touch to confirm your trial class. See you in the water.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <Image src="/tss-logo-color.png" alt="TSS" width={140} height={70} className="mx-auto mb-2" />
        <h1 className="text-xl font-bold text-[var(--tss-navy)]">Welcome, {initial.firstName}</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quick safety form before your trial class. Takes 2 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <Field label="Date of birth" required>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => update('date_of_birth', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)">
            <input
              type="text"
              value={form.height}
              onChange={(e) => update('height', e.target.value)}
              placeholder="e.g. 175"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="text"
              value={form.weight}
              onChange={(e) => update('weight', e.target.value)}
              placeholder="e.g. 70"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
            />
          </Field>
        </div>

        <Field label="Swim level" required>
          <select
            value={form.swim_level}
            onChange={(e) => update('swim_level', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
          >
            <option value="">Select…</option>
            {SWIM_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">Emergency contact</p>
          <div className="space-y-3">
            <Field label="Name" required>
              <input
                type="text"
                value={form.emergency_contact_name}
                onChange={(e) => update('emergency_contact_name', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                value={form.emergency_contact_phone}
                onChange={(e) => update('emergency_contact_phone', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
              />
            </Field>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">Medical</p>
          <div className="space-y-3">
            <Field label="Allergies">
              <textarea
                value={form.allergies}
                onChange={(e) => update('allergies', e.target.value)}
                rows={2}
                placeholder="None / list any"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
              />
            </Field>
            <Field label="Injuries / chronic conditions">
              <textarea
                value={form.injuries}
                onChange={(e) => update('injuries', e.target.value)}
                rows={2}
                placeholder="Any current or past injuries we should know about"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
              />
            </Field>
            <Field label="Other medical notes">
              <textarea
                value={form.medical_notes}
                onChange={(e) => update('medical_notes', e.target.value)}
                rows={2}
                placeholder="Medication, conditions, anything safety-relevant"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
              />
            </Field>
          </div>
        </div>

        <label className="flex items-start gap-3 pt-2 border-t border-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={form.waiver}
            onChange={(e) => update('waiver', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-[var(--tss-cyan)] border-gray-300 focus:ring-[var(--tss-cyan)]"
          />
          <span className="text-xs text-gray-700 leading-relaxed">
            I acknowledge surfing carries inherent risks. I confirm the medical info above is accurate and I take full responsibility for participating in TSS sessions. I release the academy and TSS from liability except in cases of gross negligence.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !form.waiver}
          className="w-full py-3 bg-[var(--tss-cyan)] text-[var(--tss-navy)] rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {loading ? 'Saving…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label} {required && <span className="text-[var(--tss-cyan)]">*</span>}
      </span>
      {children}
    </label>
  );
}
