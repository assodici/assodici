import Link from "next/link"
import Image from "next/image"
import { AuthButton } from "@/components/buttons/auth-button"
import { ThemeToggleButton } from "@/components/buttons/theme-toggle-button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import type { User } from "@supabase/supabase-js"

const NAV = [{ href: "/", label: "Accueil" }]

// Pages shown in the design but not built yet — rendered as inert text
// instead of dead links.
const COMING_SOON = ["Mes Assos", "Actualités", "Qui sommes-nous ?"]

type SiteHeaderProps = {
  user: User | null
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="w-full bg-brand-red text-white shadow-md">
      <div className="page-container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/brand/logo-on-dark.png"
            alt="Asso d'ici"
            width={220}
            height={26}
            className="h-7 w-auto sm:h-8"
            priority
          />
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            {NAV.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  render={<Link href={item.href} />}
                  className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            {COMING_SOON.map((label) => (
              <NavigationMenuItem key={label}>
                <span className="flex h-9 w-max cursor-default items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/50">
                  {label}
                </span>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <AuthButton user={user} variant="default" />
        </div>
      </div>
      <p className="page-container pb-3 text-sm text-brand-yellow italic">
        Découvre les associations près de chez toi et engage-toi dans ta communauté !
      </p>
    </header>
  )
}
