import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

// The old standalone "lead" safety form is deprecated. The intake at
// /intake/[token] is now the single source of truth (logo → surf-level quiz →
// safety + waiver → extended profile with goals/camp). Any old /lead link
// redirects there so nobody lands on the legacy form.
export default async function LeadFormRedirect({ params }: Props) {
  const { token } = await params;
  redirect(`/intake/${token}`);
}
