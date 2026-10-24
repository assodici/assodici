import Link from "next/link"
import Image from "next/image"
import { AuthButton } from "@/components/buttons/auth-button"
import { ThemeToggleButton } from "@/components/buttons/theme-toggle-button"
import type { SessionUser } from "@/lib/supabase/server"

const NAV = [
  { href: "/search", label: "Rechercher" },
  { href: "/about", label: "À propos" },
]

// Shell controls sit on the ultramarine field: white ink, translucent white hover.
export const SHELL_CONTROL =
  "text-shell-foreground hover:bg-white/12 hover:text-shell-foreground focus-visible:ring-white/70"

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="bg-shell text-shell-foreground">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-white">
          <Image
            src="/brand/logo-on-dark.png"
            alt="Asso d'ici, accueil"
            width={220}
            height={26}
            className="h-6 w-auto sm:h-7"
            priority
            // Already a small PNG: skip Vercel image optimization (free-tier quota).
            unoptimized
          />
        </Link>

        <nav aria-label="Navigation principale" className="flex items-center gap-1 text-sm font-semibold">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hidden rounded-lg px-3 py-2 sm:block ${SHELL_CONTROL}`}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggleButton className={SHELL_CONTROL} />
          <AuthButton
            user={user}
            variant="outline"
            className="ml-1 h-9 rounded-full border-white/60 bg-transparent px-4 text-shell-foreground hover:bg-white/12 hover:text-shell-foreground dark:bg-transparent"
          />
        </nav>
      </div>
    </header>
  )
}
