import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createLocalClient } from '@/lib/local-db';

function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
}

function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey());
}

export async function createClient() {
  if (!hasSupabase()) return createLocalClient();

  const cs = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey(), {
    cookies: {
      getAll() {
        return cs.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cs.set(name, value, options));
        } catch {}
      },
    },
  });
}
