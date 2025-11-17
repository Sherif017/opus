'use client'

import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: any = null

/**
 * ✅ Client Supabase pour le navigateur - Singleton pattern
 * Crée une seule instance et la réutilise
 */
export const supabase = (() => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  )

  return supabaseInstance
})()