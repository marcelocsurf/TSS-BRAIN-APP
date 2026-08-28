'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { submitCoachIntake, type CoachProfile } from '@/lib/actions/coach-intake';
import { PhotoUploader } from '@/components/shared/PhotoUploader';
import { WaiverContent, WAIVER_VERSION } from '@/components/legal/WaiverContent';
import { displayDate } from '@/lib/utils/tz';

interface Props {
  token: string;
  initial: CoachProfile;
}

export function CoachProfileForm({ token, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    date_of_birth: initial.date_of_birth ?? '',
    gender: initial.gender ?? '',
    nationality: initial.nationality ?? '',
    phone: initial.phone ?? '',
    languages: initial.languages ?? '',
    height: initial.height ?? '',
    weight: initial.weight ?? '',
    allergies: initial.allergies ?? '',
    injuries: initial.injuries ?? '',
    medical_notes: initial.medical_notes ?? '',
    emergency_contact_name: initial.emergency_contact_name ?? '',
    emergency_contact_phone: initial.emergency_contact_phone ?? '',
    years_surfing: initial.years_surfing != null ? String(initial.years_surfing) : '',
    years_coaching: initial.years_coaching != null ? String(initial.years_coaching) : '',
    other_certifications: initial.other_certifications ?? '',
    specialty_area: initial.specialty_area ?? '',
    bio_short: initial.bio_short ?? '',
    waiver: initial.waiver_signed,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(initial.intake_completed_at);

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const yrsSurf = form.years_surfing ? parseInt(form.years_surfing, 10) : null;
      const yrsCoach = form.years_coaching ? parseInt(form.years_coaching, 10) : null;

      const res = await submitCoachIntake(token, {
        date_of_birth: form.date_of_birth,
        gender: form.gender || null,
        nationality: form.nationality || null,
        phone: form.phone || null,
        languages: form.languages || null,
        height: form.height || null,
        weight: form.weight || null,
        allergies: form.allergies || null,
        injuries: form.injuries || null,
        medical_notes: form.medical_notes || null,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        years_surfing: Number.isFinite(yrsSurf as number) ? yrsSurf : null,
        years_coaching: Number.isFinite(yrsCoach as number) ? yrsCoach : null,
        other_certifications: form.other_certifications || null,
        specialty_area: form.specialty_area || null,
        bio_short: form.bio_short || null,
        waiver_signed: form.waiver,
        waiver_version: WAIVER_VERSION,
      });
      setSavedAt(res.intake_completed_at);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {savedAt && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-900 leading-relaxed">
            Profile saved. Last updated {displayDate(savedAt)}.
          </p>
        </div>
      )}

      {/* Photo */}
      <Card title="Profile photo">
        <div className="flex flex-col items-center gap-2 py-2">
          <PhotoUploader
            entityType="coach"
            entityId={initial.id}
            currentPhotoUrl={initial.photo_url}
          />
        </div>
      </Card>

      {/* Identity */}
      <Card title="Identity">
        <Field label="Date of birth" required>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => update('date_of_birth', e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputCls}>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / prefer not to say</option>
            </select>
          </Field>
          <Field label="Nationality">
            <input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputCls} placeholder="+503 7000 0000" />
        </Field>
        <Field label="Languages you teach in">
          <input
            value={form.languages}
            onChange={(e) => update('languages', e.target.value)}
            placeholder="English, Spanish, …"
            className={inputCls}
          />
        </Field>
      </Card>

      {/* Physical */}
      <Card title="Physical (for water safety)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)">
            <input value={form.height} onChange={(e) => update('height', e.target.value)} placeholder="e.g. 178" className={inputCls} />
          </Field>
          <Field label="Weight (kg)">
            <input value={form.weight} onChange={(e) => update('weight', e.target.value)} placeholder="e.g. 75" className={inputCls} />
          </Field>
        </div>
      </Card>

      {/* Medical */}
      <Card title="Medical">
        <Field label="Allergies">
          <textarea value={form.allergies} onChange={(e) => update('allergies', e.target.value)} rows={2} placeholder="None / list any" className={inputCls} />
        </Field>
        <Field label="Injuries / chronic conditions">
          <textarea value={form.injuries} onChange={(e) => update('injuries', e.target.value)} rows={2} placeholder="Anything that limits how you teach or moves in the water" className={inputCls} />
        </Field>
        <Field label="Other medical notes">
          <textarea value={form.medical_notes} onChange={(e) => update('medical_notes', e.target.value)} rows={2} placeholder="Medication, conditions, anything safety-relevant" className={inputCls} />
        </Field>
      </Card>

      {/* Emergency */}
      <Card title="Emergency contact">
        <Field label="Name" required>
          <input value={form.emergency_contact_name} onChange={(e) => update('emergency_contact_name', e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Phone" required>
          <input type="tel" value={form.emergency_contact_phone} onChange={(e) => update('emergency_contact_phone', e.target.value)} required className={inputCls} />
        </Field>
      </Card>

      {/* Professional */}
      <Card title="Professional background">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Years surfing">
            <input
              type="number"
              min="0"
              value={form.years_surfing}
              onChange={(e) => update('years_surfing', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Years coaching">
            <input
              type="number"
              min="0"
              value={form.years_coaching}
              onChange={(e) => update('years_coaching', e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Specialty area">
          <input
            value={form.specialty_area}
            onChange={(e) => update('specialty_area', e.target.value)}
            placeholder="e.g. beginner progression, big-wave coaching, kids"
            className={inputCls}
          />
        </Field>
        <Field label="Other certifications (non-TSS)">
          <textarea
            value={form.other_certifications}
            onChange={(e) => update('other_certifications', e.target.value)}
            rows={2}
            placeholder="ISA Level 1, ocean lifeguard, first aid, etc."
            className={inputCls}
          />
        </Field>
        <Field label="Short bio (one paragraph)">
          <textarea
            value={form.bio_short}
            onChange={(e) => update('bio_short', e.target.value)}
            rows={3}
            placeholder="What students should know about you in 2-3 lines."
            className={inputCls}
          />
        </Field>
      </Card>

      {/* Waiver — full coach agreement (liability + confidentiality/IP + membership) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        <WaiverContent variant="coach" />
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.waiver}
            onChange={(e) => update('waiver', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-[var(--tss-cyan)] border-gray-300 focus:ring-[var(--tss-cyan)]"
          />
          <span className="text-[12.5px] text-gray-700 leading-relaxed">
            He leído y ACEPTO este acuerdo, incluyendo la confidencialidad del Material TSS y el uso exclusivo para miembros al día.{' '}
            <span className="text-gray-400 italic">I have read and I AGREE to this agreement, including the confidentiality of the TSS Material and members-only use.</span> <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !form.waiver}
        className="w-full py-3 bg-[var(--tss-cyan)] text-[var(--tss-navy)] rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-all"
      >
        {loading ? 'Saving…' : savedAt ? 'Save changes' : 'Submit profile'}
      </button>
    </form>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] bg-white';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{title}</p>
      {children}
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
