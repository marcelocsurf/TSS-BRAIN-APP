'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateAcademyBranding, deleteAcademy, updateAcademyEmergencyPlan } from '../actions';
import { BoardInventory } from '@/components/academy/BoardInventory';
import type { Board } from '@/lib/actions/boards';
import { actAsAcademy } from '@/lib/actions/auth';
import { startCoordinatorImpersonation } from '@/lib/actions/impersonate';
import { BRAND } from '@/lib/constants/brand';
import { createClient } from '@/lib/supabase/client';

interface Academy {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  created_at: string;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  tagline: string | null;
  emergency_numbers: string | null;
  nearest_hospital: string | null;
  lifeguard_contact: string | null;
  emergency_address: string | null;
  emergency_protocol: string | null;
  emergency_updated_at: string | null;
}

interface Coordinator {
  id: string;
  display_name: string;
  email: string | null;
  role: string;
  certification_level: string | null;
}

interface Coach {
  id: string;
  display_name: string;
  role: string;
  certification_level: string | null;
  email: string | null;
}

interface Service {
  id: string;
  camp_name: string;
  start_date: string;
  end_date: string;
  status: string;
  coaches: { display_name: string } | { display_name: string }[] | null;
}

interface Stats {
  studentCount: number;
  coachCount: number;
  activeServiceCount: number;
}

interface Props {
  academy: Academy;
  coordinator: Coordinator | null;
  stats: Stats;
  coaches: Coach[];
  activeServices: Service[];
  boards: Board[];
}

export function AcademyDetail({ academy, coordinator, stats, coaches, activeServices, boards }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Branding form state
  const [name, setName] = useState(academy.name);
  const [country, setCountry] = useState(academy.country ?? '');
  const [logoUrl, setLogoUrl] = useState(academy.logo_url ?? '');
  const [primary, setPrimary] = useState(academy.primary_color ?? '');
  const [accent, setAccent] = useState(academy.accent_color ?? '');
  const [tagline, setTagline] = useState(academy.tagline ?? '');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Emergency plan form state
  const [emNumbers, setEmNumbers] = useState(academy.emergency_numbers ?? '');
  const [emHospital, setEmHospital] = useState(academy.nearest_hospital ?? '');
  const [emLifeguard, setEmLifeguard] = useState(academy.lifeguard_contact ?? '');
  const [emAddress, setEmAddress] = useState(academy.emergency_address ?? '');
  const [emProtocol, setEmProtocol] = useState(academy.emergency_protocol ?? '');
  const [emSavedAt, setEmSavedAt] = useState<number | null>(null);
  const [emError, setEmError] = useState('');

  const saveEmergencyPlan = () => {
    setEmError('');
    startTransition(async () => {
      try {
        await updateAcademyEmergencyPlan({
          academy_id: academy.id,
          emergency_numbers: emNumbers.trim() || null,
          nearest_hospital: emHospital.trim() || null,
          lifeguard_contact: emLifeguard.trim() || null,
          emergency_address: emAddress.trim() || null,
          emergency_protocol: emProtocol.trim() || null,
        });
        setEmSavedAt(Date.now());
        router.refresh();
      } catch (e: any) {
        setEmError(e.message || 'Could not save the emergency plan.');
      }
    });
  };
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo must be under 5 MB.');
      return;
    }
    setUploadingLogo(true);
    setError('');
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'png';
      const path = `academies/${academy.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      const freshUrl = `${publicUrl}?t=${Date.now()}`;
      // Persist immediately so the logo sticks without a separate Save.
      await updateAcademyBranding({
        academy_id: academy.id,
        name: name.trim() || academy.name,
        country: country.trim() || null,
        logo_url: freshUrl,
        primary_color: primary.trim() || null,
        accent_color: accent.trim() || null,
        tagline: tagline.trim() || null,
      });
      setLogoUrl(freshUrl);
      setSavedAt(Date.now());
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Logo upload failed.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const effectivePrimary = primary || BRAND.colors.navy;
  const effectiveAccent = accent || BRAND.colors.gold;

  const saveBranding = () => {
    setError('');
    startTransition(async () => {
      try {
        await updateAcademyBranding({
          academy_id: academy.id,
          name: name.trim() || academy.name,
          country: country.trim() || null,
          logo_url: logoUrl.trim() || null,
          primary_color: primary.trim() || null,
          accent_color: accent.trim() || null,
          tagline: tagline.trim() || null,
        });
        setSavedAt(Date.now());
        router.refresh();
      } catch (e: any) {
        setError(e.message || 'Failed to save');
      }
    });
  };

  const enterAcademy = () => {
    startTransition(async () => {
      try {
        // Route through startCoordinatorImpersonation so the action gets
        // logged in admin_impersonations on top of setting the act-as cookie.
        await startCoordinatorImpersonation(academy.id);
        router.push('/dashboard');
        router.refresh();
      } catch (e: any) {
        // Fall back to plain actAsAcademy if for some reason the admin
        // check fails (e.g. coordinator entering their own academy directly).
        try {
          await actAsAcademy(academy.id);
          router.push('/dashboard');
          router.refresh();
        } catch (err: any) {
          alert(err.message || e.message || 'Failed to enter academy');
        }
      }
    });
  };

  const onDelete = () => {
    if (
      !confirm(
        `Delete "${academy.name}"? This will fail if there are any students, coaches, or services attached.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteAcademy(academy.id);
        router.push('/academies');
        router.refresh();
      } catch (e: any) {
        alert(e.message || 'Failed to delete academy');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header — uses the effective brand colors as preview */}
      <div
        className="rounded-xl p-5 flex items-center gap-4"
        style={{ background: effectivePrimary, color: '#fff' }}
      >
        {academy.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={academy.logo_url}
            alt={academy.name}
            className="w-16 h-16 rounded-lg object-contain bg-white/10 p-1"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold"
            style={{ background: effectiveAccent + '33', color: effectiveAccent }}
          >
            {academy.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p
            className="text-[10px] uppercase tracking-wider"
            style={{ color: effectiveAccent }}
          >
            {academy.slug}
            {academy.country ? ` · ${academy.country}` : ''}
          </p>
          <h1 className="text-xl font-bold">{academy.name}</h1>
          {academy.tagline && (
            <p className="text-xs italic mt-0.5 opacity-90">{academy.tagline}</p>
          )}
        </div>
      </div>

      {/* Stats + Enter CTA */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Students" value={stats.studentCount} />
        <StatTile label="Coaches" value={stats.coachCount} />
        <StatTile label="Active services" value={stats.activeServiceCount} />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={enterAcademy}
          disabled={pending}
          className="flex-1 py-3 text-white text-sm font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-sm"
          style={{ background: effectivePrimary }}
        >
          {pending ? 'Working…' : 'Enter as this academy →'}
        </button>
        <a
          href={`/academies/${academy.id}/billing`}
          className="px-4 py-3 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-[var(--tss-navy)] hover:bg-gray-50 transition-all shadow-sm"
        >
          Billing
        </a>
      </div>

      {/* Coordinator */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
          Coordinator
        </p>
        {coordinator ? (
          <div className="mt-1">
            <p className="text-base font-bold text-[var(--tss-navy)]">
              {coordinator.display_name}
            </p>
            <p className="text-xs text-gray-500">
              {coordinator.email} · {coordinator.role} · {coordinator.certification_level}
            </p>
            <Link
              href="/academies"
              className="inline-block mt-2 text-[11px] text-[var(--tss-navy)] hover:underline"
            >
              Reassign from /academies →
            </Link>
          </div>
        ) : (
          <div className="mt-1">
            <p className="text-sm text-amber-700">— No coordinator assigned —</p>
            <Link
              href="/academies"
              className="inline-block mt-2 text-[11px] text-[var(--tss-navy)] hover:underline"
            >
              Assign one from /academies →
            </Link>
          </div>
        )}
      </div>

      {/* Branding editor */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
          Identity & branding
        </p>

        <Field label="Academy name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </Field>

        <Field label="Country code">
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="SV, MX, CR…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </Field>

        <Field
          label="Academy logo"
          hint="PNG or SVG, square preferred, under 5 MB. Upload straight from your photo library."
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-xl font-bold">
                  {name.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="px-3 py-2 bg-[var(--tss-navy)] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {uploadingLogo ? 'Uploading…' : logoUrl ? 'Change logo' : 'Upload logo'}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-[11px] text-red-500 hover:underline text-left"
                >
                  Remove (then Save)
                </button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </Field>

        <Field label="Tagline" hint="Short italic line under the academy name.">
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Surf with intention."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary color" hint="Top bar, CTAs">
            <ColorInput
              value={primary}
              onChange={setPrimary}
              fallback={BRAND.colors.navy}
            />
          </Field>
          <Field label="Accent color" hint="Gold-equivalent">
            <ColorInput
              value={accent}
              onChange={setAccent}
              fallback={BRAND.colors.gold}
            />
          </Field>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}
        {savedAt && (
          <p className="text-xs text-emerald-600">
            ✓ Saved · {new Date(savedAt).toLocaleTimeString()}
          </p>
        )}

        <button
          type="button"
          onClick={saveBranding}
          disabled={pending}
          className="w-full py-2.5 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          style={{ background: BRAND.colors.navy }}
        >
          {pending ? 'Saving…' : 'Save branding'}
        </button>
      </div>

      {/* Emergency plan — location-specific, shown to every coach */}
      <div className="bg-white rounded-xl border border-red-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-red-600 font-mono font-semibold">
            🚨 Emergency plan
          </p>
          {!academy.emergency_numbers && !academy.nearest_hospital && (
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Pendiente de llenar</span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 -mt-1">
          Específico del lugar donde opera la academia. Lo ve cada coach en su portal — debe estar siempre a la mano.
        </p>
        <Field label="Números de emergencia (911 · ambulancia · policía)">
          <input value={emNumbers} onChange={(e) => setEmNumbers(e.target.value)} placeholder="911 · Cruz Roja 2222-5155 · PNC 911" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-300" />
        </Field>
        <Field label="Hospital / clínica más cercana (nombre · dirección · teléfono)">
          <input value={emHospital} onChange={(e) => setEmHospital(e.target.value)} placeholder="Hospital ___ · Calle ___ · 2222-0000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-300" />
        </Field>
        <Field label="Salvavidas / guardacostas">
          <input value={emLifeguard} onChange={(e) => setEmLifeguard(e.target.value)} placeholder="Torre de salvavidas / contacto" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-300" />
        </Field>
        <Field label="Punto exacto / dirección para dar a los servicios de emergencia">
          <input value={emAddress} onChange={(e) => setEmAddress(e.target.value)} placeholder="Playa ___, frente a ___ (coordenadas / referencia)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-300" />
        </Field>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-1">Protocolo / pasos</label>
          <textarea
            value={emProtocol}
            onChange={(e) => setEmProtocol(e.target.value)}
            rows={4}
            placeholder="Qué hacer en una emergencia: quién llama, dónde está el botiquín, punto de reunión, etc."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
          />
        </div>
        {emError && <p className="text-xs text-red-600">{emError}</p>}
        {emSavedAt && <p className="text-xs text-emerald-600">✓ Guardado · {new Date(emSavedAt).toLocaleTimeString()}</p>}
        <button
          type="button"
          onClick={saveEmergencyPlan}
          disabled={pending}
          className="w-full py-2.5 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          style={{ background: BRAND.colors.navy }}
        >
          {pending ? 'Guardando…' : 'Guardar plan de emergencia'}
        </button>
      </div>

      {/* Board inventory */}
      <BoardInventory academyId={academy.id} boards={boards} />

      {/* Coaches list */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
            Team Members ({coaches.length})
          </p>
          <Link
            href={`/coaches/new?academy_id=${academy.id}`}
            className="text-[11px] text-[var(--tss-navy)] hover:underline"
          >
            + Invite new coach
          </Link>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          To move an existing coach to this academy, use the same form —
          if the email already exists, the system upgrades + reassigns
          that coach automatically.
        </p>
        {coaches.length === 0 ? (
          <p className="text-xs text-gray-400 italic mt-2">No coaches yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {coaches.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--tss-navy)]">{c.display_name}</p>
                  <p className="text-[11px] text-gray-500">
                    {c.role} · {c.certification_level} · {c.email}
                  </p>
                </div>
                <Link
                  href={`/coaches/${c.id}`}
                  className="text-[11px] text-[var(--tss-navy)] hover:underline"
                >
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Active services */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
            Active services ({activeServices.length})
          </p>
          <Link
            href="/camps/new"
            className="text-[11px] text-[var(--tss-navy)] hover:underline"
          >
            + Open a service
          </Link>
        </div>
        {activeServices.length === 0 ? (
          <p className="text-xs text-gray-400 italic mt-2">No services scheduled.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {activeServices.map((s) => {
              const co = Array.isArray(s.coaches) ? s.coaches[0] : s.coaches;
              return (
                <li key={s.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--tss-navy)]">{s.camp_name}</p>
                    <p className="text-[11px] text-gray-500">
                      {s.start_date} → {s.end_date}{' '}
                      {co?.display_name ? `· ${co.display_name}` : ''}
                    </p>
                  </div>
                  <Link
                    href={`/camps/${s.id}`}
                    className="text-[11px] text-[var(--tss-navy)] hover:underline"
                  >
                    Open →
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-red-600 font-mono">
          Danger zone
        </p>
        <p className="text-xs text-red-700">
          Delete this academy. Only allowed when there are zero students, coaches and
          services.
        </p>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="w-full py-2 text-xs font-semibold text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-100 disabled:opacity-50"
        >
          Delete academy
        </button>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
      <p className="text-2xl font-bold text-[var(--tss-navy)]">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono mt-0.5">
        {label}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function ColorInput({
  value,
  onChange,
  fallback,
}: {
  value: string;
  onChange: (v: string) => void;
  fallback: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || fallback}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-10 h-9 border border-gray-200 rounded cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fallback}
        className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono"
      />
    </div>
  );
}
