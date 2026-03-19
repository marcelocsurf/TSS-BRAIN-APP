import { getStudentForIntake } from '@/lib/actions/intake';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { BRAND } from '@/lib/constants/brand';
import { notFound } from 'next/navigation';
import { IntakeForm } from './intake-form';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function IntakePage({ params }: Props) {
  const { token } = await params;
  const student = await getStudentForIntake(token);

  if (!student) notFound();

  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)]">
      {/* Header */}
      <div style={{ background: BRAND.colors.navy }} className="px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">The Surf Sequence</h1>
        <p style={{ color: BRAND.colors.gold }} className="text-xs mt-1">Your Profile</p>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Student card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ backgroundColor: belt?.color || '#999' }}
            >
              {student.photo_url ? (
                <img src={student.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                `${student.first_name[0]}${student.last_name?.[0] || ''}`
              )}
            </div>
            <div>
              <p className="font-semibold text-[var(--tss-navy)]">
                {student.first_name} {student.last_name}
              </p>
              <p className="text-xs text-gray-500">{belt?.en} — {belt?.levelName}</p>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Help us prepare the best experience for you.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Complete the required safety info first, then optionally add more details.
          </p>
        </div>

        {/* Form */}
        <IntakeForm token={token} student={student} />
      </div>

      <div className="text-center py-8">
        <p className="text-xs text-gray-400">The Surf Sequence&reg; &middot; {BRAND.tagline}</p>
      </div>
    </div>
  );
}
