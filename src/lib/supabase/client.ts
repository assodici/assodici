"use client"

import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

let client: ReturnType<typeof createSSRBrowserClient<Database>> | null = null

export function createBrowserClient() {
  if (!client) {
    client = createSSRBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
  }
  return client
}
