import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"
import type { User } from "@supabase/supabase-js"

type AuthButtonProps = {
  user: User | null
  variant?: VariantProps<typeof buttonVariants>["variant"]
  className?: string
}

export function AuthButton({ user, variant = "outline", className }: AuthButtonProps) {
  if (user) {
    return (
      <form action={logout}>
        <button type="submit" className={cn(buttonVariants({ variant }), className)}>
          Déconnexion
        </button>
      </form>
    )
  }

  return (
    <Link href="/login" className={cn(buttonVariants({ variant }), className)}>
      Connexion
    </Link>
  )
}
