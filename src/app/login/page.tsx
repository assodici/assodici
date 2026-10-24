import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/login-form"
import { safeNextPath } from "@/lib/url"

export const metadata: Metadata = { title: "Connexion", robots: { index: false } }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams
  const target = safeNextPath(typeof next === "string" ? next : null)
  const user = await getUser()
  if (user) redirect(target)
  return <LoginForm next={target} />
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="bg-shell">
      <div className="page-container flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <Suspense>
            <LoginContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
