'use client';

import { useState } from 'react';
import { submitBasicIntake, submitIntake, type IntakeFormInput, type BasicIntakeInput } from '@/lib/actions/intake';
import { BRAND } from '@/lib/constants/brand';
import { PinSetupCard } from '@/components/intake/PinSetupCard';
import { WaiverContent, WAIVER_VERSION } from '@/components/legal/WaiverContent';
import { ConsentBoxes } from '@/components/legal/ConsentBoxes';
import { signWaiverOnly, submitWelcomeBack } from '@/lib/actions/intake';
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
  waiver_version?: string | null;
  first_name?: string | null;
  next_recommended_focus?: string | null;
  last_session_date?: string | null;
  last_session_mission?: string | null;
  personal_goal?: string | null;
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

type Stage = 'ocean_quiz' | 'ocean_quiz_done' | 'basic' | 'basic_done' | 'extended' | 'all_done' | 'waiver_only' | 'welcome_back';

export function IntakeForm({ token, student, extendedRequired = false, singleDayOnly = false }: Props & { extendedRequired?: boolean; singleDayOnly?: boolean }) {
  // New 3-part order: Profile & Safety (ficha) FIRST → Level quiz (members) →
  // Goals. A drop-in stops after the ficha. Members ALWAYS take the level quiz
  // (it handles the never-surfed case internally) — it is never skipped.
  // Camp (Marcelo 2026-09-10) = evaluación profunda obligatoria, aunque el
  // alumno esté cargado como drop-in.
  // Servicio de un día = solo lo esencial (regla 2026-09-11). El student_type
  // 'dropin' viejo sigue valiendo; lo nuevo es decidir por lo inscrito.
  const isDropin = (student.student_type === 'dropin' || singleDayOnly) && !extendedRequired;
  // Ya vino antes (intake completo): no repite formularios. Firma el waiver
  // otra vez SOLO si cambió la versión (Marcelo 2026-09-11).
  const waiverStale = !student.waiver_signed || (!!student.waiver_version && student.waiver_version !== WAIVER_VERSION);
  const returning = student.intake_tier === 'extended' || !!student.intake_completed_at;
  const basicDone =
    student.intake_tier === 'basic' ||
    student.intake_tier === 'extended' ||
    (!!student.waiver_signed && !!student.emergency_contact_name);
  const initialStage: Stage =
    returning && waiverStale ? 'waiver_only'
    : returning ? 'welcome_back'
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
    email: (student as any).email || '',
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
      if (isDropin) {
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
    // Nunca se envía con una obligatoria vacía en un paso anterior.
    for (const st of [0, 2]) { const e = stepError(st); if (e) { setExtendedStep(st); setError(e); return; } }
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
              {student.waiver_signed ? 'Welcome back! Our waiver was updated since your last visit — please read and sign the new version.' : 'Your profile is already on file. To surf with us, please read and sign the liability waiver below.'}
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
        {isDropin ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center space-y-2">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">You&apos;re all set!</p>
            <p className="text-xs text-gray-500">You can close this page. See you in the water.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center space-y-3">
            <p className="text-sm text-gray-600 font-medium">{extendedRequired ? 'One more step for your camp: your goals' : 'Want to help your coach even more?'}</p>
            <p className="text-xs text-gray-400">
              {extendedRequired ? 'Your coach plans the camp around this — surf experience, goals and how you learn. About 3 minutes.' : 'Add your surf experience, goals, and personal details. Takes about 3 minutes.'}
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
    // UN SOLO QUIZ en todo el sistema (regla 2026-09-11): el v2 oficial de la
    // web (quiz-v2.html, 10 escenas, /100). Con ?t= el resultado se ata a
    // esta ficha y con &from=intake el quiz trae de vuelta acá; al volver, la
    // página ve level_quiz_completed_at y sigue con las metas. El v1 del
    // intake (12 escenarios) queda retirado.
    const quizUrl = `/quiz-v2.html?t=${encodeURIComponent(token)}&from=intake`;
    return (
      <div className="space-y-4">
        <StageIndicator current={1} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">Step 1 · Your level</p>
          <h2 className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>Let&apos;s find your real level</h2>
          <p className="text-sm text-gray-600">Ten real scenarios, about 3 minutes. No self-rating: your answers place you, and your coach confirms it in the water.</p>
          <a href={quizUrl} className="block w-full py-3.5 rounded-full text-sm font-bold text-center" style={{ background: '#00D2FF', color: '#061C2B', textDecoration: 'none' }}>
            Take the level quiz →
          </a>
          <p className="text-[12px] text-gray-400 text-center">When you finish, tap “Continue your intake” to come back here.</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // WELCOME BACK — ya vino antes, nada de formularios de nuevo
  // ═══════════════════════════════════════

  if (stage === 'welcome_back') {
    return (
      <WelcomeBack token={token} student={student} extendedRequired={extendedRequired} onDone={() => setStage('all_done')} />
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
            {/* Correo del alumno: al crear el perfil el equipo pone el WhatsApp
                y el correo queda opcional; se pide acá (2026-09-11). */}
            <Field
              label="Email"
              type="email"
              value={basicForm.email || ''}
              onChange={(v) => setBasic('email', v)}
              placeholder="you@email.com"
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

  // Intake profundo (Marcelo 2026-09-11): UNA evaluación general para todos,
  // sin rama beginner/experimentado. Cuatro pasos: tu surf · tu tabla y olas
  // (opcional) · tus metas a 3 plazos · detalles.
  const EXT_STEPS = [
    { title: 'Your Surfing' },
    { title: 'Your Board & Waves' },
    { title: 'Your Goals' },
    { title: 'Final Details' },
  ];
  const extTotalSteps = EXT_STEPS.length;
  // Principiante (nunca surfeó): no se le pregunta frecuencia, autosuficiencia
  // ni tabla/olas; esos valores se fijan solos (Marcelo 2026-09-11).
  const neverSurfed = (extForm.surf_experience_years as string) === "I haven't surfed yet";
  // Obligatorio: lo que el coach necesita sí o sí para planear el camp.
  // Opcional: lo que ayuda pero no frena.
  const stepError = (step: number): string | null => {
    const f = extForm as Record<string, unknown>;
    const miss = (k: string) => !String(f[k] ?? '').trim();
    if (step === 0) {
      if (miss('stance')) return 'Tell us your stance (or "Not sure yet").';
      if (miss('surf_experience_years')) return 'Tell us when you started surfing.';
      if (!neverSurfed && miss('surf_frequency')) return 'Tell us how often you surf.';
      if (!neverSurfed && miss('self_sufficiency')) return 'Tell us if you are self-sufficient in the water.';
      if (miss('water_comfort')) return 'Tell us how comfortable you feel in the ocean.';
      if (miss('fitness_level')) return 'Tell us your fitness level.';
    }
    if (step === 2) {
      if (miss('goal_short_term')) return 'Tell us what you want to improve in this camp — your coach plans around it.';
    }
    return null;
  };
  const nextStep = () => {
    const err = stepError(extendedStep);
    if (err) { setError(err); return; }
    setError('');
    if (extendedStep === 0 && neverSurfed) {
      // Valores fijos del principiante + salta "tabla y olas".
      setExtForm((prev) => ({ ...prev, surf_frequency: 'Never yet', self_sufficiency: 'I need help getting out and catching waves', board_type: prev.board_type || "I don't have one yet" }));
      setExtendedStep(2);
      return;
    }
    setExtendedStep(extendedStep + 1);
  };
  const prevStep = () => {
    setError('');
    setExtendedStep(extendedStep === 2 && neverSurfed ? 0 : extendedStep - 1);
  };

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
          {/* ── STEP 0: YOUR SURFING — evaluación general ── */}
          {extendedStep === 0 && (
            <>
              <OptionGroup
                label="What's your stance?"
                required
                value={(extForm.stance as string) || ''}
                onChange={(v) => setExt('stance', v)}
                options={['Regular', 'Goofy', 'Not sure yet']}
              />
              <Select
                label="When did you start surfing?"
                required
                value={(extForm.surf_experience_years as string) || ''}
                onChange={(v) => setExt('surf_experience_years', v)}
                options={['', "I haven't surfed yet", 'Less than 1 year ago', '1-3 years ago', '3-5 years ago', '5-10 years ago', 'More than 10 years ago']}
              />
              {!neverSurfed && (
                <Select
                  label="How often do you surf?"
                  required
                  value={(extForm.surf_frequency as string) || ''}
                  onChange={(v) => setExt('surf_frequency', v)}
                  options={['', 'A few times a year', 'Monthly', 'Weekly', 'Several times a week', 'Almost daily']}
                />
              )}
              {!neverSurfed && (
                <OptionGroup
                  label="In the water, are you self-sufficient or do you need help?"
                  required
                  value={(extForm.self_sufficiency as string) || ''}
                  onChange={(v) => setExt('self_sufficiency', v)}
                  options={[
                    'I need help getting out and catching waves',
                    'I manage, but sometimes I need a hand',
                    'Self-sufficient: I get out, pick and catch my own waves',
                  ]}
                />
              )}
              <OptionGroup
                label="How comfortable do you feel in the ocean?"
                required
                value={(extForm.water_comfort as string) || ''}
                onChange={(v) => setExt('water_comfort', v)}
                options={['Very comfortable', 'Somewhat', 'It makes me nervous']}
              />
              <OptionGroup
                label="Your fitness level today"
                required
                value={(extForm.fitness_level as string) || ''}
                onChange={(v) => setExt('fitness_level', v)}
                options={['Low — not training right now', 'Moderate — active some days', 'Good — train regularly', 'Athlete — train hard most days']}
              />
              {neverSurfed && <p className="text-[12px] text-gray-500">First time? Perfect. We skip the board questions — your coach picks your board on day one.</p>}
              <Field
                label="Other sports you practice"
                value={(extForm.other_sports as string) || ''}
                onChange={(v) => setExt('other_sports', v)}
                placeholder="e.g. Skateboarding, swimming, BJJ, running"
              />
              <OptionGroup
                label="How do you learn best?"
                value={(extForm.learning_style as string) || ''}
                onChange={(v) => setExt('learning_style', v)}
                options={['Watching (visual)', 'Doing (kinesthetic)', 'Hearing explanations', 'Not sure']}
              />
            </>
          )}

          {/* ── STEP 1: YOUR BOARD & WAVES (optional) ── */}
          {extendedStep === 1 && (
            <>
              <p className="text-[12.5px] text-gray-500">All optional. It helps your coach pick the right board and the right peak for you. Fields marked * elsewhere are required.</p>
              <Select
                label="What board(s) do you ride?"
                value={(extForm.board_type as string) || ''}
                onChange={(v) => setExt('board_type', v)}
                options={['', "I don't have one yet", 'Foamie / Soft top', 'Funboard / Mid-length', 'Shortboard', 'Longboard', 'Fish', 'Several']}
              />
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
                label="What kind of wave do you enjoy most?"
                value={(extForm.wave_preference as string) || ''}
                onChange={(v) => setExt('wave_preference', v)}
                options={['Small and mellow', 'Long walls / point breaks', 'Beach break peaks', 'Steep and hollow', "I don't know yet"]}
              />
              <OptionGroup
                label="What wave size are you comfortable with today?"
                value={(extForm.comfort_wave_size as string) || ''}
                onChange={(v) => setExt('comfort_wave_size', v)}
                options={['Whitewater only', 'Up to waist', 'Up to chest', 'Up to head', 'Overhead']}
              />
            </>
          )}

          {/* ── STEP 2: GOALS — tres plazos ── */}
          {extendedStep === 2 && (
            <>
              <TextArea
                label="Long term — in about 3 years, what do you want to achieve in your surfing?"
                value={(extForm.goal_long_term as string) || ''}
                onChange={(v) => setExt('goal_long_term', v)}
                placeholder="e.g. Surf confidently anywhere I travel; ride head-high waves; do real turns"
              />
              <TextArea
                label="Medium term — from here to one month from now, what do you want to achieve?"
                value={(extForm.goal_mid_term as string) || ''}
                onChange={(v) => setExt('goal_mid_term', v)}
                placeholder="e.g. Catch green waves on my own; stand up every time"
              />
              <TextArea
                label="Short term — in this camp (next week), what do you want to improve? *"
                value={(extForm.goal_short_term as string) || ''}
                onChange={(v) => setExt('goal_short_term', v)}
                placeholder="e.g. My pop-up; reading where to sit; my first turn"
              />
              <TextArea
                label="What has held you back, or what bad habits do you want to fix?"
                value={(extForm.biggest_barrier as string) || ''}
                onChange={(v) => setExt('biggest_barrier', v)}
                placeholder="e.g. Fear of bigger waves, bad positioning, inconsistency"
              />
              <TextArea
                label="Any fears related to the ocean or surfing?"
                value={(extForm.fears_phobias as string) || ''}
                onChange={(v) => setExt('fears_phobias', v)}
                placeholder="Be honest — it helps us take care of you"
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

          {/* ── STEP 3: FINAL DETAILS ── */}
          {extendedStep === 3 && (
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
            onClick={prevStep}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {extendedStep < extTotalSteps - 1 ? (
          <button
            type="button"
            onClick={nextStep}
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

function Select({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
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

function OptionGroup({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}{required && <span className="text-red-500"> *</span>}</label>
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


// ═══ WELCOME BACK (Marcelo 2026-09-11): el que ya vino no repite nada.
// Ve su cinta, lo último que trabajó, y responde 3 cosas cortas si cambió
// algo. El nivel no se vuelve a preguntar: lo confirma el coach en el agua.
function WelcomeBack({ token, student, extendedRequired, onDone }: { token: string; student: StudentData; extendedRequired: boolean; onDone: () => void }) {
  const [injuries, setInjuries] = useState(student.injuries ?? '');
  const [goal, setGoal] = useState(student.personal_goal ?? '');
  const [lastSurf, setLastSurf] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const focus = student.next_recommended_focus || student.last_session_mission || null;
  const beltName = student.belt_level ? student.belt_level.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : null;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 text-white" style={{ background: BRAND.colors.navy }}>
        <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#00D2FF' }}>Welcome back{student.first_name ? `, ${student.first_name}` : ''}</p>
        <p className="text-lg font-bold mt-1" style={{ fontFamily: 'var(--font-heading)' }}>We already have your profile.</p>
        <div className="mt-3 space-y-1 text-sm text-white/85">
          {beltName && <p>Belt: <span className="font-semibold text-white">{beltName}</span></p>}
          {focus && <p>Last focus: <span className="font-semibold text-white">{focus}</span></p>}
          {student.last_session_date && <p>Last session: <span className="font-semibold text-white">{String(student.last_session_date).slice(0, 10)}</span></p>}
        </div>
        <p className="text-[12px] text-white/60 mt-3">Your waiver is on file. No quiz needed: your coach confirms your level in the water.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-[var(--tss-navy)]">Anything changed? (optional)</p>
        <label className="block text-[12px] text-gray-600">When did you last surf?
          <select value={lastSurf} onChange={(e) => setLastSurf(e.target.value)} className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
            <option value="">—</option>
            <option value="Last surfed: this month">This month</option>
            <option value="Last surfed: 1-3 months ago">1–3 months ago</option>
            <option value="Last surfed: 3-12 months ago">3–12 months ago</option>
            <option value="Last surfed: over a year ago">Over a year ago</option>
          </select>
        </label>
        <label className="block text-[12px] text-gray-600">Any new injury or health note?
          <textarea value={injuries} onChange={(e) => setInjuries(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Leave empty if nothing changed" />
        </label>
        <label className="block text-[12px] text-gray-600">What do you want out of this visit?
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder={extendedRequired ? 'Your coach plans the camp around this' : 'One line is enough'} />
        </label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button type="button" disabled={saving}
          onClick={async () => {
            setSaving(true); setErr('');
            const r = await submitWelcomeBack(token, { injuries, personal_goal: goal, surf_frequency: lastSurf || null });
            setSaving(false);
            if (!r.ok) { setErr(r.error || 'Could not save.'); return; }
            onDone();
          }}
          className="w-full py-3.5 rounded-full text-sm font-bold disabled:opacity-40" style={{ background: '#00D2FF', color: '#061C2B' }}>
          {saving ? 'Saving…' : "I'm ready ✓"}
        </button>
      </div>
    </div>
  );
}
