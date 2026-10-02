import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies, headers } from "next/headers"

/**
 * Server-side Supabase client for route handlers and server components.
 *
 * - Web: session comes from Supabase auth cookies.
 * - Mobile app: sends `Authorization: Bearer <access token>`; queries then run as that
 *   user (RLS applies) and `auth.getUser()` validates the token with Supabase.
 */
export async function createClient() {
  const authHeader = (await headers()).get("authorization") || ""
  const bearer = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]

  if (bearer) {
    const client = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    // There is no stored session for header-based auth, so validate the bearer token itself.
    const getUser = client.auth.getUser.bind(client.auth)
    client.auth.getUser = (jwt?: string) => getUser(jwt ?? bearer)
    return client
  }

  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}
