'use client';

import { useState } from 'react';
import { submitBasicIntake, submitIntake, type IntakeFormInput, type BasicIntakeInput } from '@/lib/actions/intake';
import { BRAND } from '@/lib/constants/brand';
import { LevelQuizStep } from './level-quiz-step';
import { PinSetupCard } from '@/components/intake/PinSetupCard';
import { WaiverContent, WAIVER_VERSION } from '@/components/legal/WaiverContent';
import { ConsentBoxes } from '@/components/legal/ConsentBoxes';
import { signWaiverOnly } from '@/lib/actions/intake';
import { dobError, dobMaxAttr } from '@/lib/utils/dob';

interface StudentData {
  student_type?: string | null;
  gender?: string | null;
  nationality?: string | null;
  languages?: string | null;
  instagram?: string | null;
  date_of_birth?: string | null;
  stance?: string | null;
  surf_experience_years?: string | null;
  surf_frequency?: string | null;
  surf_self_level?: string | null;
  belt_level?: string | null;
  board_type?: string | null;
  board_length_feet?: string | null;
  board_length_inches?: string | null;
  board_volume_liters?: string | null;
  other_sports?: string | null;
  learning_style?: string | null;
  board_familiarity?: string | null;
  water_comfort?: string | null;
  comfort_wave_size?: string | null;
  maneuvers_current?: string[] | null;
  surf_injuries?: string | null;
  ocean_quiz_answers?: { P0?: string | null } | null;
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
  ocean_level?: string | null;
  ocean_level_provisional?: boolean;
  ocean_quiz_completed_at?: string | null;
  level_quiz_completed_at?: string | null;
}

interface Props {
  token: string;
  student: StudentData;
}

type Stage = 'ocean_quiz' | 'ocean_quiz_done' | 'basic' | 'basic_done' | 'extended' | 'all_done' | 'waiver_only';

export function IntakeForm({ token, student }: Props) {
  // New 3-part order: Profile & Safety (ficha) FIRST → Level quiz (members) →
  // Goals. A drop-in stops after the ficha. Members ALWAYS take the level quiz
  // (it handles the never-surfed case internally) — it is never skipped.
  const isDropin = student.student_type === 'dropin';
  const basicDone =
    student.intake_tier === 'basic' ||
    student.intake_tier === 'extended' ||
    (!!student.waiver_signed && !!student.emergency_contact_name);
  const initialStage: Stage =
    student.intake_tier === 'extended' && !student.waiver_signed ? 'waiver_only'
    : student.intake_tier === 'extended' ? 'all_done'
    : !basicDone ? 'basic'
    : isDropin ? 'basic_done'
    : student.ocean_quiz_completed_at ? 'extended'
    : 'ocean_quiz';

  const [stage, setStage] = useState<Stage>(initialStage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Solo-waiver (fichas importadas): firma + guardián si es menor
  const [woName, setWoName] = useState('');
  const [woGuardian, setWoGuardian] = useState('');
  const [woMedia, setWoMedia] = useState(false);   // imagen: opt-in, nunca pre-marcada
  const [woAccept, setWoAccept] = useState(false);
  const [woHealth, setWoHealth] = useState(false);
  const [woTerms, setWoTerms] = useState(false);
  // Etapa básica: consentimientos + guardián si es menor
  const [basicHealth, setBasicHealth] = useState(false);
  const [basicTerms, setBasicTerms] = useState(false);
  const [basicGuardian, setBasicGuardian] = useState('');
  const woMinor = (() => {
    if (!student.date_of_birth) return false;
    const d = new Date(student.date_of_birth + 'T00:00:00'), n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    if (n.getMonth() - d.getMonth() < 0 || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
    return a < 18;
  })();
  const [extendedStep, setExtendedStep] = useState(0);

  // Adaptive branch: true if the student has never surfed outside whitewater
  // (ocean_quiz P0 short-circuit). Seeded from the saved quiz answer on
  // reload; overwritten when the quiz is completed in this session.
  const p0Saved = student.ocean_quiz_answers?.P0 ?? null;
  const [isBeginner, setIsBeginner] = useState<boolean>(
    student.belt_level === 'white_belt' || p0Saved === 'never' || p0Saved === 'whitewater_only',
  );

  // ── Basic intake form state (the "ficha" — identity + safety) ──
  const [basicForm, setBasicForm] = useState<BasicIntakeInput>({
    // Pedido del equipo (2026-09-05): apellido, talla y alergias OBLIGATORIOS.
    // Llegaban fichas con solo el nombre, sin talla para el welcome kit y sin
    // alergias (alimentarias sobre todo) para prevenir en el camp.
    last_name: (student as any).last_name || '',
    shirt_size: (student as any).shirt_size || '',
    date_of_birth: student.date_of_birth || '',
    phone: (student as any).phone || '',
    nationality: student.nationality || '',
    languages: student.languages || '',
    gender: student.gender || '',
    height: student.height || '',
    weight: student.weight || '',
    emergency_contact_name: student.emergency_contact_name || '',
    emergency_contact_phone: student.emergency_contact_phone || '',
    swim_level: student.swim_level || '',
    allergies: student.allergies || '',
    injuries: student.injuries || '',
    medical_notes: student.medical_notes || '',
    waiver_signed: student.waiver_signed || false,
    media_release_consent: (student as any).media_release_consent ?? false,
    waiver_version: WAIVER_VERSION,
  });

  // ── Extended (Goals) form state ──
  // NOTE: identity/body fields (date_of_birth, gender, nationality, languages,
  // height, weight) are NOT here — they're collected in Part 1 (the ficha).
  // Including them would let submitIntake overwrite the saved ficha with blanks.
  const [extForm, setExtForm] = useState<IntakeFormInput>({
    instagram: student.instagram || '',
    stance: student.stance || '',
    surf_experience_years: student.surf_experience_years || '',
    surf_frequency: student.surf_frequency || '',
    board_type: student.board_type || '',
    board_length_feet: student.board_length_feet || '',
    board_length_inches: student.board_length_inches || '',
    board_volume_liters: student.board_volume_liters || '',
    other_sports: student.other_sports || '',
    learning_style: student.learning_style || '',
    board_familiarity: student.board_familiarity || '',
    water_comfort: student.water_comfort || '',
    comfort_wave_size: student.comfort_wave_size || '',
    maneuvers_current: student.maneuvers_current || [],
    surf_injuries: student.surf_injuries || '',
    goal_short_term: student.goal_short_term || '',
    goal_mid_term: student.goal_mid_term || '',
    goal_long_term: student.goal_long_term || '',
    biggest_barrier: student.biggest_barrier || '',
    fears_phobias: student.fears_phobias || '',
    shirt_size: student.shirt_size || '',
    how_did_you_hear: student.how_did_you_hear || '',
    returning_student: student.returning_student || false,
  });

  const setBasic = (field: keyof BasicIntakeInput, value: string | boolean) =>
    setBasicForm((prev) => ({ ...prev, [field]: value }));

  const setExt = (field: keyof IntakeFormInput, value: string | boolean | string[]) =>
    setExtForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit Part 1 (Profile & Safety / "ficha") ──
  const basicMinor = (() => {
    const dob = basicForm.date_of_birth?.trim();
    if (!dob || dobError(dob)) return false;
    const d = new Date(dob + 'T00:00:00'), n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    if (n.getMonth() - d.getMonth() < 0 || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
    return a < 18;
  })();
  const handleBasicSubmit = async () => {
    if (!basicForm.date_of_birth?.trim()) {
      setError('Date of birth is required.');
      return;
    }
    // Una fecha imposible (año mal tipeado) haría contar al alumno como menor
    // y dispararía el flujo de tutor. Se corta acá.
    const dobMsg = dobError(basicForm.date_of_birth);
    if (dobMsg) { setError(dobMsg); return; }
    if ((basicForm.last_name || '').trim().length < 2) {
      setError('Last name is required.');
      return;
    }
    if (!basicForm.shirt_size) {
      setError('Pick your t-shirt size — it is for your welcome kit.');
      return;
    }
    if (!(basicForm.allergies || '').trim()) {
      setError("Allergies are required — write 'none' if you have none.");
      return;
    }
    if (!basicForm.swim_level) {
      setError('Please select your swim level.');
      return;
    }
    // Talla y peso deciden la tabla que te dan — sin esto el coach la elige a ojo.
    if (!basicForm.height?.trim() || !basicForm.weight?.trim()) {
      setError('Height and weight are required — your coach picks your board with them.');
      return;
    }
    if (!basicForm.emergency_contact_name?.trim()) {
      setError('Emergency contact name is required.');
      return;
    }
    if (!basicForm.emergency_contact_phone?.trim()) {
      setError('Emergency contact phone is required.');
      return;
    }
    if (!basicForm.waiver_signed) {
      setError('Please acknowledge the waiver to continue.');
      return;
    }
    if (basicMinor && basicGuardian.trim().length < 5) {
      setError('A parent or legal guardian must sign for a minor — type their full name.');
      return;
    }
    if (!basicHealth) {
      setError('We need your consent to store your health and safety information.');
      return;
    }
    if (!basicTerms) {
      setError('Please accept the Terms and the Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitBasicIntake(token, {
        ...basicForm,
        health_data_consent: basicHealth,
        terms_accepted: basicTerms,
        guardian_name: basicMinor ? basicGuardian.trim() : null,
      });

      // Drop-in: single service, no level/goals — finish here.
      // Member: go to the level quiz — UNLESS they already did it (e.g. via the
      // public /quiz lead), in which case skip straight to goals so they never
      // re-take it.
      if (student.student_type === 'dropin') {
        setStage('basic_done');
      } else if (student.ocean_quiz_completed_at || student.level_quiz_completed_at) {
        setExtendedStep(0);
        setStage('extended');
      } else {
        setStage('ocean_quiz');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Ficha completa importada → SOLO firmar la exención (y guardián si menor)
  if (stage === 'waiver_only') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-lg font-bold text-[var(--tss-navy)]">Hi {(student as any).first_name || 'surfer'} — one last step</p>
            <p className="text-sm text-gray-500 mt-1">
              Your profile is already on file. To surf with us, please read and sign the liability waiver below.
            </p>
          </div>

          <WaiverContent />

          {woMinor && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(0,210,255,.07)', border: '1px solid rgba(0,210,255,.35)' }}>
              <p className="text-[12px] font-bold" style={{ color: '#0090B0' }}>
                {(student as any).first_name || 'This surfer'} is under 18 — a parent or legal guardian signs this waiver.
              </p>
              <input value={woGuardian} onChange={(e) => setWoGuardian(e.target.value)} placeholder="Parent / guardian full legal name *"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" />
            </div>
          )}

          <label className="flex items-start gap-2 text-[13px] text-gray-800 cursor-pointer">
            <input type="checkbox" checked={woAccept} onChange={(e) => setWoAccept(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span>I have read and I AGREE to this release of liability. / He leído y ACEPTO este acuerdo de exención de responsabilidad. *</span>
          </label>

          <ConsentBoxes
            health={woHealth} onHealth={setWoHealth}
            terms={woTerms} onTerms={setWoTerms}
            media={woMedia} onMedia={setWoMedia}
            minor={woMinor} forName={(student as any).first_name}
          />

          <input value={woName} onChange={(e) => setWoName(e.target.value)}
            placeholder={woMinor ? 'Guardian: type your full legal name to sign *' : 'Type your full legal name to sign *'}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="button" disabled={loading || !woAccept || !woHealth || !woTerms || woName.trim().length < 5 || (woMinor && !woGuardian.trim())}
            onClick={async () => {
              setLoading(true); setError('');
              const r = await signWaiverOnly(token, {
                signed_name: woName, guardian_name: woMinor ? (woGuardian || woName) : null,
                media_release_consent: woMedia, waiver_version: WAIVER_VERSION,
                health_data_consent: woHealth, terms_accepted: woTerms,
              });
              setLoading(false);
              if (!r.ok) { setError(r.error || 'Could not save the signature.'); return; }
              setStage('all_done');
            }}
            className="w-full py-3.5 rounded-full text-sm font-bold disabled:opacity-40"
            style={{ background: '#00D2FF', color: '#061C2B' }}>
            {loading ? 'Saving…' : 'Sign the waiver ✓'}
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'all_done') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-3">
          <p className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>Profile complete!</p>
          <p className="text-sm text-gray-500">
            Your coach will have everything they need to prepare your sessions.
          </p>
        </div>
        <PinSetupCard portalToken={token} hasPin={false} />
        <p className="text-[11px] text-gray-400 text-center">
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

        {/* Extended profile (goals etc.) is for MEMBERS. Drop-in students
            (single service) finish here — no goals, no portal, no course. */}
        {student.student_type === 'dropin' ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center space-y-2">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">You&apos;re all set!</p>
            <p className="text-xs text-gray-500">You can close this page. See you in the water.</p>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // STAGE 0: OCEAN QUIZ
  // ═══════════════════════════════════════

  if (stage === 'ocean_quiz') {
    return (
      <div className="space-y-4">
        <StageIndicator current={1} />
        <LevelQuizStep
          token={token}
          onComplete={(belt) => {
            // Beginner branch for the goals form = entry belt white_belt.
            setIsBeginner(belt === 'white_belt');
            setExtendedStep(0);
            setStage('extended');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
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
        <StageIndicator current={0} onlyStep={isDropin} />

        {/* ── Identity (the "ficha") ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-base font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
              About You — Required
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <Field
              label="Last name"
              value={basicForm.last_name || ''}
              onChange={(v) => setBasic('last_name', v)}
              placeholder="As it appears on your ID"
              required
            />
            <Field
              label="Date of Birth"
              type="date"
              max={dobMaxAttr()}
              value={basicForm.date_of_birth || ''}
              onChange={(v) => setBasic('date_of_birth', v)}
              required
              hint={dobError(basicForm.date_of_birth) ?? undefined}
            />
            {/* Teléfono propio del alumno (WhatsApp) — antes el intake solo
                pedía el del contacto de emergencia y el equipo no tenía cómo
                escribirle al cliente (reporte de Cony 2026-08-09). */}
            <Field
              label="Phone / WhatsApp"
              type="tel"
              value={basicForm.phone || ''}
              onChange={(v) => setBasic('phone', v)}
              placeholder="+503 7777 7777"
              required
            />
            <FormRow>
              <Field
                label="Nationality"
                value={basicForm.nationality || ''}
                onChange={(v) => setBasic('nationality', v)}
                placeholder="e.g. American, Brazilian"
              />
              <Field
                label="Languages"
                value={basicForm.languages || ''}
                onChange={(v) => setBasic('languages', v)}
                placeholder="e.g. English, Spanish"
              />
            </FormRow>
            <Select
              label="Gender"
              value={basicForm.gender || ''}
              onChange={(v) => setBasic('gender', v)}
              options={['', 'Male', 'Female', 'Other', 'Prefer not to say']}
            />
            {/* Obligatorios: el coach elige la tabla con la talla y el peso.
                Sin esto llega a la playa y la elige a ojo. */}
            <FormRow>
              <Field
                label="Height"
                value={basicForm.height || ''}
                onChange={(v) => setBasic('height', v)}
                placeholder={`5'10" or 178cm`}
                required
              />
              <Field
                label="Weight"
                value={basicForm.weight || ''}
                onChange={(v) => setBasic('weight', v)}
                placeholder="165 lbs or 75 kg"
                required
              />
            </FormRow>
            <p className="text-[11px] text-gray-500 -mt-1">
              Your coach picks your board from your height and weight — it is the difference between a board that works for you and one that fights you.
            </p>
            <Select
              label="T-shirt size (for your welcome kit) *"
              value={basicForm.shirt_size || ''}
              onChange={(v) => setBasic('shirt_size', v)}
              options={['', 'Kids 6', 'Kids 8', 'Kids 10', 'Kids 12', 'XS', 'S', 'M', 'L', 'XL', 'XXL']}
            />
          </div>
        </div>

        {/* ── Safety & Medical ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-base font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
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
              label="Allergies (food, medication, other)"
              value={basicForm.allergies || ''}
              onChange={(v) => setBasic('allergies', v)}
              placeholder="e.g. shellfish, peanuts, penicillin — or write 'none'"
              required
              hint="We cook and plan around this. If you have none, write 'none'."
            />
            <Field
              label="Injuries / chronic conditions"
              value={basicForm.injuries || ''}
              onChange={(v) => setBasic('injuries', v)}
              placeholder="e.g. Shoulder, knee, back — or none"
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
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <WaiverContent />

              <Checkbox
                label="I have read and I AGREE to this release of liability. / He leído y ACEPTO este acuerdo de exención de responsabilidad. *"
                checked={basicForm.waiver_signed}
                onChange={(v) => setBasic('waiver_signed', v)}
                required
              />

              {basicMinor && (
                <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(0,210,255,.07)', border: '1px solid rgba(0,210,255,.35)' }}>
                  <p className="text-[12px] font-bold" style={{ color: '#0090B0' }}>
                    {(student as any).first_name || 'This surfer'} is under 18 — a parent or legal guardian signs and consents.
                  </p>
                  <input value={basicGuardian} onChange={(e) => setBasicGuardian(e.target.value)} placeholder="Parent / guardian full legal name *"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" />
                </div>
              )}

              <ConsentBoxes
                health={basicHealth} onHealth={setBasicHealth}
                terms={basicTerms} onTerms={setBasicTerms}
                media={!!basicForm.media_release_consent} onMedia={(v) => setBasic('media_release_consent', v)}
                minor={basicMinor} forName={(student as any).first_name}
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
          {loading ? 'Saving...' : 'Save profile & continue'}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // STAGE 2: EXTENDED INTAKE
  // ═══════════════════════════════════════

  const EXT_STEPS = [
    { title: isBeginner ? 'Your Starting Point' : 'Your Surf Today' },
    { title: 'Your Goals' },
    { title: 'Final Details' },
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
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: i <= extendedStep ? BRAND.colors.navy : '#D1D5DB' }}
              >
                {i + 1}
              </span>
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-base font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
            {EXT_STEPS[extendedStep].title}
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* ── STEP 0: SURF EXPERIENCE (adaptive) ── */}
          {extendedStep === 0 && isBeginner && (
            <>
              <Field
                label="Other sports you practice"
                value={(extForm.other_sports as string) || ''}
                onChange={(v) => setExt('other_sports', v)}
                placeholder="e.g. Skateboarding, swimming, soccer"
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
              <OptionGroup
                label="Have you ever tried standing on a board? (skate, snow, foam surf)"
                value={(extForm.board_familiarity as string) || ''}
                onChange={(v) => setExt('board_familiarity', v)}
                options={['Yes', 'A little', 'No']}
              />
              <OptionGroup
                label="How comfortable do you feel in the ocean?"
                value={(extForm.water_comfort as string) || ''}
                onChange={(v) => setExt('water_comfort', v)}
                options={['Very comfortable', 'Somewhat', 'It makes me nervous']}
              />
            </>
          )}

          {extendedStep === 0 && !isBeginner && (
            <>
              <OptionGroup
                label="What's your stance?"
                value={(extForm.stance as string) || ''}
                onChange={(v) => setExt('stance', v)}
                options={['Regular', 'Goofy', 'Not sure']}
              />
              <Select
                label="How long have you been surfing?"
                value={(extForm.surf_experience_years as string) || ''}
                onChange={(v) => setExt('surf_experience_years', v)}
                options={[
                  '', 'Less than 1 year', '1-3 years', '3-5 years', '5+ years',
                ]}
              />
              <Select
                label="How often do you surf?"
                value={(extForm.surf_frequency as string) || ''}
                onChange={(v) => setExt('surf_frequency', v)}
                options={[
                  '', 'A few times a year', 'Monthly', 'Weekly', 'Almost daily',
                ]}
              />
              <Select
                label="What board(s) do you ride?"
                value={(extForm.board_type as string) || ''}
                onChange={(v) => setExt('board_type', v)}
                options={[
                  '', 'Foamie / Soft top', 'Funboard',
                  'Shortboard', 'Longboard', 'Several',
                ]}
              />
              {/* Exact board size + volume — optional reference for the coach
                  when choosing today's board. Leave blank if you don't know. */}
              <FormRow>
                <Select
                  label="Board length (feet)"
                  value={(extForm.board_length_feet as string) || ''}
                  onChange={(v) => setExt('board_length_feet', v)}
                  options={['', '5', '6', '7', '8', '9', '10', '11', '12']}
                />
                <Select
                  label="Inches"
                  value={(extForm.board_length_inches as string) || ''}
                  onChange={(v) => setExt('board_length_inches', v)}
                  options={['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']}
                />
              </FormRow>
              <Field
                label="Board volume (liters) — if you know it"
                value={(extForm.board_volume_liters as string) || ''}
                onChange={(v) => setExt('board_volume_liters', v)}
                placeholder="e.g. 32"
              />
              <OptionGroup
                label="What wave size are you comfortable with today?"
                value={(extForm.comfort_wave_size as string) || ''}
                onChange={(v) => setExt('comfort_wave_size', v)}
                options={['Up to waist', 'Up to chest', 'Up to head', 'Overhead']}
              />
              {/* "How would you describe your surfing today?" removed —
                  the surf-level quiz (Step 1) already determines this. No
                  duplicate self-rating. */}
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
              <Field
                label="Other sports you practice"
                value={(extForm.other_sports as string) || ''}
                onChange={(v) => setExt('other_sports', v)}
                placeholder="e.g. Skateboarding, swimming, BJJ"
              />
            </>
          )}

          {/* ── STEP 1: GOALS (adaptive) ── */}
          {extendedStep === 1 && isBeginner && (
            <>
              <TextArea
                label="What would you like to achieve in this trip/course?"
                value={(extForm.goal_short_term as string) || ''}
                onChange={(v) => setExt('goal_short_term', v)}
                placeholder="e.g. Stand up for the first time, catch my first wave"
              />
              <TextArea
                label="What's your dream with surfing?"
                value={(extForm.goal_long_term as string) || ''}
                onChange={(v) => setExt('goal_long_term', v)}
                placeholder="e.g. Surf with confidence, lose my fear of the ocean"
              />
              <TextArea
                label="Any fears related to the ocean or surfing?"
                value={(extForm.fears_phobias as string) || ''}
                onChange={(v) => setExt('fears_phobias', v)}
                placeholder="Be honest \u2014 it helps us take care of you"
                hint="This is confidential. Only your coach team sees it."
              />
            </>
          )}

          {extendedStep === 1 && !isBeginner && (
            <>
              <TextArea
                label="What do you want to achieve this trip/course?"
                value={(extForm.goal_short_term as string) || ''}
                onChange={(v) => setExt('goal_short_term', v)}
                placeholder="e.g. Start turning, surf bigger waves"
              />
              <TextArea
                label="Where do you want to be in 3-6 months?"
                value={(extForm.goal_mid_term as string) || ''}
                onChange={(v) => setExt('goal_mid_term', v)}
                placeholder="e.g. Surf unbroken waves consistently, cutbacks"
              />
              <TextArea
                label="What's your dream with surfing? (1-3 years)"
                value={(extForm.goal_long_term as string) || ''}
                onChange={(v) => setExt('goal_long_term', v)}
                placeholder="e.g. Surf confidently anywhere I travel"
              />
              <TextArea
                label="What has held you back, or what bad habits do you want to fix?"
                value={(extForm.biggest_barrier as string) || ''}
                onChange={(v) => setExt('biggest_barrier', v)}
                placeholder="e.g. Fear of big waves, bad positioning, inconsistency"
              />
              <TextArea
                label="Any fears related to the ocean or surfing?"
                value={(extForm.fears_phobias as string) || ''}
                onChange={(v) => setExt('fears_phobias', v)}
                placeholder="Be honest \u2014 it helps us coach you better"
                hint="This is confidential. Only your coach team sees it."
              />
              <TextArea
                label="Any previous surf injuries?"
                value={(extForm.surf_injuries as string) || ''}
                onChange={(v) => setExt('surf_injuries', v)}
                placeholder="e.g. Shoulder, knee, none"
              />
            </>
          )}

          {/* ── STEP 2: FINAL DETAILS ── */}
          {extendedStep === 2 && (
            <>
              <Field
                label="Instagram"
                value={(extForm.instagram as string) || ''}
                onChange={(v) => setExt('instagram', v)}
                placeholder="@yourusername"
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

// `onlyStep` = drop-in: hace UN solo paso, así que mostrarle 3 le dice que
// tiene por delante un proceso que nunca va a recorrer. Justo la sensación de
// "esto es muy largo" que reportó Cony.
function StageIndicator({ current, onlyStep = false }: { current: 0 | 1 | 2; onlyStep?: boolean }) {
  const steps: { label: string }[] = onlyStep
    ? [{ label: 'Profile & Safety' }]
    : [
        { label: 'Profile & Safety' },
        { label: 'Your Level' },
        { label: 'Goals' },
      ];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const isActive = current >= i;
          const isDone = current > i;
          return (
            <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`flex items-center gap-1.5 flex-1 min-w-0 ${
                  isActive ? '' : 'opacity-40'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: isActive ? BRAND.colors.navy : '#D1D5DB' }}
                >
                  {isDone ? '\u2713' : i + 1}
                </div>
                <span className="text-[11px] font-medium text-gray-700 truncate">
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-3 h-0.5 bg-gray-200 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// FORM COMPONENTS (reused)
// ═══════════════════════════════════════

function Field({ label, value, onChange, type = 'text', placeholder, required, hint, max }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; hint?: string; max?: string;
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
        max={max}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)] focus:border-transparent"
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
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)] focus:border-transparent"
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
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)] bg-white"
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
