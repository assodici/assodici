import { createServerClient as createSSRClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { cache } from "react"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSSRClient(
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

export const getUser = cache(async () => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// For use inside "use cache" functions — no cookies, public read-only access
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
