import { createServerClient as createServerClientSSR } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './supabase'

export const createServerClient = () => {
  const cookieStore = cookies()

  return createServerClientSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Server components can't set cookies
          }
        },
      },
    }
  )
}