import { createServerClient as createSSRClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/lib/supabase/types"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // In Server Components cookies cannot be set — safe to ignore
          }
        },
      },
    }
  )
}

export type SessionUser = { id: string }

// getClaims verifies the JWT locally against the project's asymmetric signing keys (JWKS fetched once),
// so no Auth server round trip per request, unlike getUser().
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getClaims()
  return data?.claims.sub ? { id: data.claims.sub } : null
})

// For use inside "use cache" functions — no cookies, public read-only access
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

// Checked before every createPublicClient() call site — a missing env var
// (misconfigured deploy environment, integration not wired up yet, etc.)
// should degrade the page gracefully instead of crashing the request/build.
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}
