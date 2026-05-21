import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import LeadForm from './lead-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function LeadFormPage({ params }: Props) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: student } = await admin
    .from('students')
    .select(
      'id, first_name, last_name, lifecycle_status, waiver_signed, date_of_birth, height, weight, swim_level, emergency_contact_name, emergency_contact_phone, allergies, injuries, medical_notes',
    )
    .eq('portal_token', token)
    .maybeSingle();

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] px-4 py-8">
      <LeadForm
        token={token}
        initial={{
          firstName: student.first_name ?? '',
          lastName: student.last_name ?? '',
          waiverSigned: student.waiver_signed ?? false,
          date_of_birth: student.date_of_birth ?? '',
          height: student.height ?? '',
          weight: student.weight ?? '',
          swim_level: student.swim_level ?? '',
          emergency_contact_name: student.emergency_contact_name ?? '',
          emergency_contact_phone: student.emergency_contact_phone ?? '',
          allergies: student.allergies ?? '',
          injuries: student.injuries ?? '',
          medical_notes: student.medical_notes ?? '',
        }}
      />
    </div>
  );
}
