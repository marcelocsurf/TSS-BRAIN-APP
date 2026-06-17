import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { AcademyDetail } from './AcademyDetail';
import { listBoards } from '@/lib/actions/boards';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AcademyDetailPage({ params }: Props) {
  const { id } = await params;

  // Use isRealPlatformAdmin() so the page stays accessible even when the
  // admin is in act-as mode (otherwise getCurrentCoach() would lie and
  // kick them out).
  if (!(await isRealPlatformAdmin())) {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  const { data: academy } = await supabase
    .from('academies')
    .select(
      'id, name, slug, country, created_at, logo_url, primary_color, accent_color, tagline, assigned_coordinator_id, emergency_numbers, nearest_hospital, lifeguard_contact, emergency_address, emergency_protocol, emergency_updated_at, coaches:assigned_coordinator_id(id, display_name, email, role, certification_level)'
    )
    .eq('id', id)
    .single();

  if (!academy) notFound();

  const co = Array.isArray(academy.coaches) ? academy.coaches[0] : academy.coaches;

  const [
    { count: studentCount },
    { count: coachCount },
    { count: activeServiceCount },
    coachesList,
    activeServicesList,
  ] = await Promise.all([
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('academy_id', id)
      .eq('status', 'active'),
    supabase
      .from('coaches')
      .select('*', { count: 'exact', head: true })
      .eq('academy_id', id)
      .eq('active_status', true),
    supabase
      .from('camp_instances')
      .select('*', { count: 'exact', head: true })
      .eq('academy_id', id)
      .in('status', ['planned', 'active']),
    supabase
      .from('coaches')
      .select('id, display_name, role, certification_level, email')
      .eq('academy_id', id)
      .eq('active_status', true)
      .order('display_name')
      .limit(20),
    supabase
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status, coaches:coach_id(display_name)')
      .eq('academy_id', id)
      .in('status', ['planned', 'active'])
      .order('start_date')
      .limit(10),
  ]);

  const boards = await listBoards(id);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 pb-12">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/academies" className="hover:text-[var(--tss-navy)]">← Academies</Link>
        <span className="text-gray-300">/</span>
        <span className="text-[var(--tss-navy)] font-semibold">{academy.name}</span>
      </div>

      <AcademyDetail
        academy={{
          id: academy.id,
          name: academy.name,
          slug: academy.slug,
          country: academy.country,
          created_at: academy.created_at,
          logo_url: academy.logo_url ?? null,
          primary_color: academy.primary_color ?? null,
          accent_color: academy.accent_color ?? null,
          tagline: academy.tagline ?? null,
          emergency_numbers: (academy as any).emergency_numbers ?? null,
          nearest_hospital: (academy as any).nearest_hospital ?? null,
          lifeguard_contact: (academy as any).lifeguard_contact ?? null,
          emergency_address: (academy as any).emergency_address ?? null,
          emergency_protocol: (academy as any).emergency_protocol ?? null,
          emergency_updated_at: (academy as any).emergency_updated_at ?? null,
        }}
        coordinator={
          co
            ? {
                id: co.id,
                display_name: co.display_name,
                email: co.email,
                role: co.role,
                certification_level: co.certification_level,
              }
            : null
        }
        stats={{
          studentCount: studentCount ?? 0,
          coachCount: coachCount ?? 0,
          activeServiceCount: activeServiceCount ?? 0,
        }}
        coaches={(coachesList.data ?? []) as any[]}
        activeServices={(activeServicesList.data ?? []) as any[]}
        boards={boards}
      />
    </div>
  );
}
