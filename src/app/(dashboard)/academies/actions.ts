'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentCoach } from '@/lib/actions/auth';

export async function createAcademy(input: {
  name: string;
  slug: string;
  country: string | null;
}) {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) {
    throw new Error('Only the platform admin can create academies.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('academies').insert({
    name: input.name,
    slug: input.slug,
    country: input.country,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/academies');
}
