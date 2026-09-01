import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createLocalClient } from '@/lib/local-db';

function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
}

function useLocalDb() {
  return process.env.USE_LOCAL_DB === 'true' || process.env.USE_LOCAL_DB === '1';
}

function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey());
}

export function isLocalDb() {
  return useLocalDb() || !hasSupabase();
}

export async function createClient() {
  if (isLocalDb()) return createLocalClient();

  const cs = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey(), {
    cookies: {
      getAll() {
        return cs.getAll();
      },
      setAll(list: { name: string; value: string; options?: Parameters<typeof cs.set>[2] }[]) {
        try {
          list.forEach(({ name, value, options }) => cs.set(name, value, options));
        } catch {}
      },
    },
  });
}
