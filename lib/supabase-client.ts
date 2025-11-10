'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * ✅ Client Supabase pour le navigateur avec localStorage
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)