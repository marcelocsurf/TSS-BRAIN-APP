import { getServiceStaffByToken } from '@/lib/actions/service-staff';
import { RespondClient } from './respond-client';

export const dynamic = 'force-dynamic';

export default async function RespondPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await getServiceStaffByToken(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tss-navy)] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        {!row ? (
          <p className="text-center text-sm text-gray-500">This link is invalid or has expired.</p>
        ) : (
          <RespondClient token={token} row={row} />
        )}
      </div>
    </div>
  );
}
