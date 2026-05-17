import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use this in Server Components, Route Handlers, and Server Actions.
// Must be awaited — cookies() is async in Next.js 16.
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Read all cookies from the incoming request headers.
      getAll() {
        return cookieStore.getAll()
      },
      // setAll is a no-op during Server Component render (read-only context).
      // It becomes active in Route Handlers, Server Actions, and proxy.ts.
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Expected in Server Component render — safe to ignore.
        }
      },
    },
  })
}
