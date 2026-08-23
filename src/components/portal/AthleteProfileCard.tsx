'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { getMyAthleteProfile, saveMyAthleteProfile, uploadMyAvatar, type MyProfileData } from '@/lib/actions/athlete-profile';

// ═══ MI PERFIL del atleta — wizard de ficha técnica (paridad app HP) ═══
// Primera vez: procedimiento guiado de 5 pasos. Después: la tarjeta dice
// exactamente QUÉ falta ("Missing: passport, insurance") y abre el wizard.
// Solo línea Alto Rendimiento (la acción devuelve null para el resto).
// Student-facing → inglés. Brand v10.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const ARCHIVO: React.CSSProperties = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%' as any };
const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#39D98A';

type StepKey = 'photo' | 'body' | 'docs' | 'health' | 'goals';
const STEPS: Array<{ key: StepKey; icon: string; title: string; sub: string }> = [
  { key: 'photo', icon: '📸', title: 'Your photo', sub: 'So your team knows your face' },
  { key: 'body', icon: '💪', title: 'Body basics', sub: 'Height, weight, blood type' },
  { key: 'docs', icon: '🪪', title: 'Documents', sub: 'For trips and competitions' },
  { key: 'health', icon: '🏥', title: 'Health & safety', sub: 'What your team must know' },
  { key: 'goals', icon: '🎯', title: 'Your goals', sub: 'Where are you going?' },
];

export function AthleteProfileCard({ token }: { token: string }) {
  const [data, setData] = useState<MyProfileData | null>(null);
  const [open, setOpen] = useState(false);

  const load = () => {
    getMyAthleteProfile(token).then((r) => { if (r.ok) setData(r.data); }).catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [token]);

  if (!data) return null;
  const complete = data.pct >= 100;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl p-4"
        style={{
          background: complete ? 'rgba(57,217,138,.06)' : 'rgba(0,210,255,.06)',
          border: complete ? '1px solid rgba(57,217,138,.35)' : '1px solid rgba(0,210,255,.4)',
        }}
      >
        <div className="flex items-center gap-3">
          {data.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: `2px solid ${complete ? GREEN : CYAN}` }} />
          ) : (
            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-[16px]" style={{ background: 'rgba(0,210,255,.12)' }}>📸</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: complete ? GREEN : CYAN }}>
                {data.first_time ? '👋 Set up your athlete profile' : complete ? 'Athlete profile · complete' : 'Your athlete profile'}
              </span>
              <span className="text-[11px] font-bold" style={{ ...MONO, color: complete ? GREEN : CYAN }}>{data.pct}%</span>
            </div>
            <div className="mt-1.5 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.max(4, data.pct)}%`, background: complete ? GREEN : CYAN }} />
            </div>
            <p className="text-[11px] mt-1.5 truncate" style={{ color: '#b8cad8' }}>
              {data.first_time
                ? '2 minutes — your team needs this before trips & comps →'
                : complete
                  ? 'All set. Tap to review or update ✓'
                  : `Missing: ${data.missing.slice(0, 3).join(', ')}${data.missing.length > 3 ? ` +${data.missing.length - 3}` : ''} →`}
            </p>
          </div>
        </div>
      </button>

      {open && <ProfileWizard token={token} data={data} onClose={() => { setOpen(false); load(); }} />}
    </>
  );
}

// ─── El procedimiento: 5 pasos, se guarda paso a paso ───
function ProfileWizard({ token, data, onClose }: { token: string; data: MyProfileData; onClose: () => void }) {
  // Primera vez → arranca en el paso 1; si ya tiene datos → arranca en el
  // primer paso con algo faltante.
  const firstIncomplete = (): number => {
    if (data.first_time) return 0;
    const m = new Set(data.missing);
    if (!data.photo_url) return 0;
    if (m.has('height') || m.has('weight') || m.has('blood type')) return 1;
    if (m.has('ID (DUI)') || m.has('passport') || m.has('passport expiry') || m.has('insurance')) return 2;
    if (m.has('doctor') || m.has('emergency contact')) return 3;
    if (m.has('goals')) return 4;
    return 0;
  };
  const [step, setStep] = useState<number>(firstIncomplete);
  const [f, setF] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.fields)) o[k] = v == null ? '' : String(v);
    return o;
  });
  const [photoUrl, setPhotoUrl] = useState(data.photo_url);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pct, setPct] = useState(data.pct);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const FIELDS_BY_STEP: Record<number, string[]> = {
    1: ['height_cm', 'weight_kg', 'blood_type'],
    2: ['dui', 'passport_number', 'passport_expiry_date', 'insurance_provider', 'insurance_number'],
    3: ['doctor_name', 'doctor_phone', 'emergency_relationship', 'emergency_phone_alt', 'medications', 'injury'],
    4: ['goal_short_term', 'goal_mid_term', 'goal_long_term', 'palmares_historico', 'sponsors'],
  };

  const saveStep = async (): Promise<boolean> => {
    const keys = FIELDS_BY_STEP[step];
    if (!keys) return true; // paso foto: se guarda al subir
    const patch: Record<string, string | null> = {};
    for (const k of keys) patch[k] = f[k] ?? null;
    setBusy(true); setMsg(null);
    try {
      const r = await saveMyAthleteProfile(token, patch);
      if (!r.ok) { setMsg(r.error ?? 'Could not save.'); return false; }
      if (r.pct != null) setPct(r.pct);
      return true;
    } catch {
      setMsg('No connection — try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (await saveStep()) {
      if (step < STEPS.length - 1) setStep(step + 1);
      else onClose();
    }
  };

  const pickPhoto = async (file: File) => {
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await uploadMyAvatar(token, fd);
      if (!r.ok) { setMsg(r.error ?? 'Upload failed.'); return; }
      setPhotoUrl(r.url ?? null);
      setMsg('✓ Looking good!');
      setTimeout(() => setMsg(null), 2000);
    } catch {
      setMsg('No connection — try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.16)', color: '#eaf4fa' };
  const labelStyle: React.CSSProperties = { ...MONO, color: '#7BA2B5' };
  const Field = ({ k, label, type = 'text', placeholder }: { k: string; label: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-[9.5px] uppercase tracking-wider mb-1" style={labelStyle}>{label}</label>
      <input type={type} value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-[14px]" style={inputStyle} />
    </div>
  );

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto" style={{ background: INK, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header + progreso */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>
            <ChevronLeft size={13} /> {step > 0 ? 'Back' : 'Home'}
          </button>
          <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>Profile {pct}%</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ color: '#7BA2B5' }}><X size={16} /></button>
        </div>

        {/* Pasos (dots) */}
        <div className="flex gap-1.5">
          {STEPS.map((st, i) => (
            <button key={st.key} type="button" onClick={() => setStep(i)} className="flex-1 rounded-full" style={{ height: 5, background: i <= step ? CYAN : 'rgba(255,255,255,.12)' }} aria-label={st.title} />
          ))}
        </div>

        <div>
          <h2 className="font-bold text-white" style={{ ...ARCHIVO, fontSize: 24 }}>{s.icon} {s.title}</h2>
          <p className="text-[12px] mt-0.5" style={{ color: '#8aa0b2' }}>{s.sub} · step {step + 1} of {STEPS.length}</p>
        </div>

        {msg && <p className="text-[12px] rounded-lg px-3 py-2" style={{ background: msg.startsWith('✓') ? 'rgba(57,217,138,.12)' : 'rgba(255,120,100,.12)', color: msg.startsWith('✓') ? GREEN : '#ffb4a6' }}>{msg}</p>}

        {/* ── Paso 1: foto ── */}
        {s.key === 'photo' && (
          <div className="text-center py-6 space-y-4">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="w-32 h-32 rounded-full object-cover mx-auto" style={{ border: `3px solid ${CYAN}` }} />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-[40px]" style={{ background: 'rgba(0,210,255,.1)', border: '2px dashed rgba(0,210,255,.4)' }}>📸</div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) pickPhoto(file); }} />
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
              className="rounded-full px-6 py-3 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50" style={{ ...MONO, background: CYAN, color: INK }}>
              {busy ? 'Uploading…' : photoUrl ? 'Change photo' : 'Add your photo'}
            </button>
            <p className="text-[11px]" style={{ color: '#5f7a8c' }}>A clear face shot works best. Max 5MB.</p>
          </div>
        )}

        {/* ── Paso 2: cuerpo ── */}
        {s.key === 'body' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field k="height_cm" label="Height (cm)" type="number" placeholder="170" />
              <Field k="weight_kg" label="Weight (kg)" type="number" placeholder="65" />
            </div>
            <div>
              <label className="block text-[9.5px] uppercase tracking-wider mb-1" style={labelStyle}>Blood type</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                  <button key={b} type="button" onClick={() => set('blood_type', f.blood_type === b ? '' : b)}
                    className="rounded-xl py-2.5 text-[13px] font-bold"
                    style={{ background: f.blood_type === b ? CYAN : 'rgba(255,255,255,.06)', color: f.blood_type === b ? INK : '#b8cad8', border: '1px solid rgba(255,255,255,.12)' }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Paso 3: documentos ── */}
        {s.key === 'docs' && (
          <div className="space-y-3">
            <Field k="dui" label="ID / DUI" placeholder="00000000-0" />
            <div className="grid grid-cols-2 gap-3">
              <Field k="passport_number" label="Passport #" />
              <Field k="passport_expiry_date" label="Passport expiry" type="date" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field k="insurance_provider" label="Insurance provider" placeholder="e.g. MAPFRE" />
              <Field k="insurance_number" label="Policy #" />
            </div>
            <p className="text-[10.5px]" style={{ color: '#5f7a8c' }}>🔒 Only your coaching team sees this — it&apos;s needed for trips and competitions.</p>
          </div>
        )}

        {/* ── Paso 4: salud ── */}
        {s.key === 'health' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field k="doctor_name" label="Doctor" />
              <Field k="doctor_phone" label="Doctor phone" type="tel" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field k="emergency_relationship" label="Emergency contact (who?)" placeholder="Mom / Dad / …" />
              <Field k="emergency_phone_alt" label="Their phone" type="tel" />
            </div>
            <Field k="medications" label="Medications (if any)" />
            <Field k="injury" label="Current injury (if any)" />
          </div>
        )}

        {/* ── Paso 5: metas ── */}
        {s.key === 'goals' && (
          <div className="space-y-3">
            <Field k="goal_short_term" label="🎯 Short term · 1 month" placeholder="What do you want to win next?" />
            <Field k="goal_mid_term" label="🚀 Mid term · 6 months" />
            <Field k="goal_long_term" label="🌊 Long term · years" placeholder="Dream big." />
            <div>
              <label className="block text-[9.5px] uppercase tracking-wider mb-1" style={labelStyle}>🏆 Titles & results so far</label>
              <textarea value={f.palmares_historico ?? ''} onChange={(e) => set('palmares_historico', e.target.value)} rows={3}
                className="w-full rounded-xl px-3 py-2.5 text-[13px]" style={inputStyle} />
            </div>
            <Field k="sponsors" label="Sponsors" />
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 pt-2 pb-6">
          {s.key !== 'photo' ? (
            <button type="button" disabled={busy} onClick={next}
              className="flex-1 rounded-full py-3.5 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50"
              style={{ ...MONO, background: step === STEPS.length - 1 ? GREEN : CYAN, color: INK }}>
              {busy ? 'Saving…' : step === STEPS.length - 1 ? 'Save & finish ✓' : 'Save & continue →'}
            </button>
          ) : (
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 rounded-full py-3.5 text-[11px] font-bold uppercase tracking-wider"
              style={{ ...MONO, background: CYAN, color: INK }}>
              {photoUrl ? 'Continue →' : 'Skip for now →'}
            </button>
          )}
        </div>

        <p className="text-[9px] text-center pb-2" style={{ ...MONO, color: '#3d5766' }}>THE SURF SEQUENCE · ATHLETE PROFILE</p>
      </div>
    </div>
  );
}
