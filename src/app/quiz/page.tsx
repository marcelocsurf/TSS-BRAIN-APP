import { QuizClient } from './quiz-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "What's Your Real Surf Level? — The Surf Sequence",
  description: 'Most surfers overestimate their level by 1-2 stages. Find yours in 60 seconds.',
};

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const { a } = await searchParams;
  return <QuizClient academySlug={a ?? null} />;
}
