'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateAcademyBranding, deleteAcademy } from '../actions';
import { actAsAcademy } from '@/lib/actions/auth';
import { BRAND } from '@/lib/constants/brand';

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
}

export function AcademyDetail({ academy, coordinator, stats, coaches, activeServices }: Props) {
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
        await actAsAcademy(academy.id);
        router.push('/dashboard');
        router.refresh();
      } catch (e: any) {
        alert(e.message || 'Failed to enter academy');
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

      <button
        type="button"
        onClick={enterAcademy}
        disabled={pending}
        className="w-full py-3 text-white text-sm font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-sm"
        style={{ background: effectivePrimary }}
      >
        {pending ? 'Working…' : 'Enter as this academy →'}
      </button>

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
          label="Logo URL"
          hint="PNG or SVG. Square preferred. Leave blank to show initial."
        >
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://yourcdn.com/logo.png"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
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

      {/* Coaches list */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
            Coaches ({coaches.length})
          </p>
          <Link
            href="/coaches/new"
            className="text-[11px] text-[var(--tss-navy)] hover:underline"
          >
            + Add coach
          </Link>
        </div>
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
