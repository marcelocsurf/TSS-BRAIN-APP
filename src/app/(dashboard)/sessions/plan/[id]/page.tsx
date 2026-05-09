import { notFound } from 'next/navigation';
import { getMultiBlockSession } from '@/lib/actions/multi-block-sessions';
import { PlanEditor } from '@/components/session-plan/PlanEditor';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlanSessionPage({ params }: Props) {
  const { id } = await params;
  const data = await getMultiBlockSession(id);
  if (!data) notFound();

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <Link
          href={`/students/${data.session.student_id}`}
          className="text-xs text-gray-500 hover:text-[var(--tss-navy)]"
        >
          ← Back to student
        </Link>
      </div>
      <PlanEditor session={data.session as any} blocks={data.blocks as any} />
    </div>
  );
}
