import Link from "next/link"
import Image from "next/image"
import {ThemeToggleButton} from "@/components/buttons/theme-toggle-button"
import {AuthButton} from "@/components/buttons/auth-button"
import {ButtonGroup} from "@/components/ui/button-group"
import type {User} from "@supabase/supabase-js"

const NAV = [
  {href: "/", label: "Accueil"},
]

type SiteHeaderProps = {
  user: User | null
}

export function SiteHeader({user}: SiteHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="page-container py-3 flex items-center gap-4">
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/globe.svg"
              alt="Logo"
              width={96}
              height={24}
              className="h-6 w-auto dark:invert"
              priority
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 justify-end">
          <ButtonGroup>
            <ButtonGroup>
              <ThemeToggleButton/>
            </ButtonGroup>
            <ButtonGroup>
              <AuthButton user={user}/>
            </ButtonGroup>
          </ButtonGroup>
        </div>
      </div>
    </header>
  )
}
