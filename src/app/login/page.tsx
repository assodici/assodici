import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/login-form"

async function LoginContent() {
  const user = await getUser()
  if (user) redirect("/")
  return <LoginForm />
}

export default function ConnexionPage() {
  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  )
}
