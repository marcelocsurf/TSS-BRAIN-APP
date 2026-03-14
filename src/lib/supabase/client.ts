import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (typeof window === 'undefined') {
      return {
        auth: {
          signInWithPassword: async () => ({ error: new Error('Not configured') }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
      } as unknown as ReturnType<typeof createBrowserClient>;
    }
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(url, key);
}
