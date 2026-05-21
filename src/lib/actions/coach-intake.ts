'use server';

// Coach intake — mirrors the student intake but with coach-specific
// questions (certifications, years coaching, languages spoken in lesson).
// Authenticates by coaches.portal_token like the rest of the coach-portal
// surface, so the coach can fill it themselves without going through the
// admin's dashboard.

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type CoachIntakeStatus = {
  ok: boolean;
  intake_completed_at: string | null;
  waiver_signed: boolean;
};

export type CoachProfile = {
  id: string;
  portal_token: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  languages: string | null;
  height: string | null;
  weight: string | null;
  allergies: string | null;
  injuries: string | null;
  medical_notes: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  certification_level: string | null;
  specialty_area: string | null;
  max_belt_permission: string | null;
  other_certifications: string | null;
  years_surfing: number | null;
  years_coaching: number | null;
  bio_short: string | null;
  waiver_signed: boolean;
  waiver_signed_at: string | null;
  intake_completed_at: string | null;
  photo_url: string | null;
};

export async function getCoachProfileByToken(
  portalToken: string,
): Promise<CoachProfile | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('coaches')
    .select(
      `id, portal_token, first_name, last_name, display_name, email, phone,
       date_of_birth, gender, nationality, languages, height, weight,
       allergies, injuries, medical_notes,
       emergency_contact_name, emergency_contact_phone,
       certification_level, specialty_area, max_belt_permission,
       other_certifications, years_surfing, years_coaching, bio_short,
       waiver_signed, waiver_signed_at, intake_completed_at, photo_url`,
    )
    .eq('portal_token', portalToken)
    .single();
  if (error || !data) return null;
  return data as CoachProfile;
}

export type CoachIntakeInput = {
  // Identity
  date_of_birth: string;
  gender?: string | null;
  nationality?: string | null;
  phone?: string | null;
  languages?: string | null;
  // Physical
  height?: string | null;
  weight?: string | null;
  // Medical
  allergies?: string | null;
  injuries?: string | null;
  medical_notes?: string | null;
  // Emergency
  emergency_contact_name: string;
  emergency_contact_phone: string;
  // Professional
  years_surfing?: number | null;
  years_coaching?: number | null;
  other_certifications?: string | null;
  specialty_area?: string | null;
  bio_short?: string | null;
  // Waiver
  waiver_signed: boolean;
};

export async function submitCoachIntake(
  portalToken: string,
  input: CoachIntakeInput,
): Promise<CoachIntakeStatus> {
  if (!input.waiver_signed) {
    throw new Error('You must accept the waiver to continue.');
  }
  if (!input.date_of_birth) throw new Error('Date of birth is required.');
  if (!input.emergency_contact_name?.trim()) throw new Error('Emergency contact name is required.');
  if (!input.emergency_contact_phone?.trim()) throw new Error('Emergency contact phone is required.');

  const admin = createAdminClient();
  const { data: coach, error: findErr } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', portalToken)
    .single();
  if (findErr || !coach) throw new Error('Coach not found.');

  const now = new Date().toISOString();

  const { error } = await admin
    .from('coaches')
    .update({
      date_of_birth: input.date_of_birth,
      gender: input.gender?.trim() || null,
      nationality: input.nationality?.trim() || null,
      phone: input.phone?.trim() || null,
      languages: input.languages?.trim() || null,
      height: input.height?.trim() || null,
      weight: input.weight?.trim() || null,
      allergies: input.allergies?.trim() || null,
      injuries: input.injuries?.trim() || null,
      medical_notes: input.medical_notes?.trim() || null,
      emergency_contact_name: input.emergency_contact_name.trim(),
      emergency_contact_phone: input.emergency_contact_phone.trim(),
      years_surfing: input.years_surfing ?? null,
      years_coaching: input.years_coaching ?? null,
      other_certifications: input.other_certifications?.trim() || null,
      specialty_area: input.specialty_area?.trim() || null,
      bio_short: input.bio_short?.trim() || null,
      waiver_signed: true,
      waiver_signed_at: now,
      intake_completed_at: now,
    })
    .eq('id', coach.id);

  if (error) throw new Error(error.message);

  revalidatePath('/coach-portal/' + portalToken);
  revalidatePath('/coach-portal/' + portalToken + '/profile');

  return { ok: true, intake_completed_at: now, waiver_signed: true };
}
