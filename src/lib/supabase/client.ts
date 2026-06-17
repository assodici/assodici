"use client"

import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createSSRBrowserClient> | null = null

export function createBrowserClient() {
  if (!client) {
    client = createSSRBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
  }
  return client
}
