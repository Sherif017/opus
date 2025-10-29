import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createServerSupabase() {
  const cookieStore = cookies();

  // ✅ Version correcte pour @supabase/auth-helpers-nextjs@0.10.x
  return createServerComponentClient(
    {
      cookies: () => cookieStore,
    },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );
}
