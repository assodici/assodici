import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

type AuthButtonProps = {
  user: User | null
}

export function AuthButton({ user }: AuthButtonProps) {
  if (user) {
    return (
      <form action={logout}>
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }))}>
          Déconnexion
        </button>
      </form>
    )
  }

  return (
    <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
      Connexion
    </Link>
  )
}
