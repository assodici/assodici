import { Suspense } from "react"
import Link from "next/link"
import packageJson from "@root/package.json"
import { CurrentYear } from "@/components/layout/current-year"

const LINKS = [
  { href: "/search", label: "Rechercher" },
  { href: "/about", label: "À propos" },
  { href: "/legal", label: "Mentions légales et confidentialité" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="page-container flex flex-col gap-6 py-10 text-sm sm:flex-row sm:justify-between">
        <nav aria-label="Pied de page">
          <ul className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-semibold hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-1 text-muted-foreground sm:text-right">
          <p>
            Données :{" "}
            <a
              href="https://www.data.gouv.fr/datasets/repertoire-national-des-associations"
              className="underline hover:text-foreground"
            >
              Répertoire national des associations
            </a>
            , ministère de l&apos;Intérieur, Licence Ouverte 2.0.
          </p>
          <p className="text-xs">
            © <Suspense fallback="2026"><CurrentYear /></Suspense> Asso d&apos;ici · Réalisé par Pierre Lapolla · v{packageJson.version}
          </p>
        </div>
      </div>
    </footer>
  )
}
