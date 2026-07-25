import { QuizClient } from './quiz-client';
import { Archivo, IBM_Plex_Mono, Lora } from 'next/font/google';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const lora = Lora({ subsets: ['latin'], style: ['italic'], variable: '--font-lora' });

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
  return <div className={`${archivo.variable} ${plexMono.variable} ${lora.variable}`}><QuizClient academySlug={a ?? null} /></div>;
}
