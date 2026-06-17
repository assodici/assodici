import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const _next = searchParams.get('next')
  const next = _next?.startsWith('/') ? _next : '/'
  const supabase = await createServerClient()

  const sep = next.includes('?') ? '&' : '?'

  const code = searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) redirect(`${next}${sep}toast=loggedin`)
    redirect('/login?toast=auth_failed')
  }

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) redirect(`${next}${sep}toast=loggedin`)
    redirect('/login?toast=auth_failed')
  }

  redirect('/login?toast=auth_failed')
}
