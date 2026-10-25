import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SearchForm } from "@/components/search/search-form"
import { AssociationCard } from "@/components/association/association-card"
import { buttonVariants } from "@/components/ui/button"
import { getLastIngestion } from "@/lib/associations"
import { formatDate, numberFormatter } from "@/lib/format"
import { searchHref } from "@/lib/schemas/search-params"
import { isSupabaseConfigured } from "@/lib/supabase/server"
import type { SearchResult } from "@/lib/schemas/search-result"
import { POPULAR_THEMES, themeBandClass } from "@/lib/themes"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { alternates: { canonical: "/" } }

// Demonstration cards: placeholder content (marked "Exemple"), one per mark of the card language.
const specimen = (overrides: Partial<SearchResult>): SearchResult => ({
  id: "W000000000",
  name: "Votre association",
  description: "Ce qu'elle fait, en deux lignes.",
  city: "Votre ville",
  postal_code: "00000",
  theme_code: "011000",
  theme_label: "Sports",
  subtheme_label: null,
  is_active: true,
  founded_on: null,
  is_claimed: false,
  rank: 0,
  total: 0,
  ...overrides,
})

const SPECIMENS = [
  {
    card: specimen({ theme_code: "006000", theme_label: "Culture" }),
    legend: "La bande donne le thème officiel, le numéro est l'identifiant RNA de l'association.",
  },
  {
    card: specimen({ is_claimed: true }),
    legend: "Le tampon : l'association a revendiqué sa page et complète elle-même ses informations.",
  },
  {
    card: specimen({ theme_code: "020000", theme_label: "Solidarité", is_active: false }),
    legend: "Une carte barrée : l'association est dissoute. Elle reste consultable.",
  },
]

export default async function Home() {
  const lastRun = isSupabaseConfigured() ? await getLastIngestion() : null

  return (
    <>
      <section className="bg-shell text-shell-foreground">
        <div className="page-container pt-10 pb-16 sm:pt-16 sm:pb-24">
          <h1 className="max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-6xl">
            Toutes les associations de France, près de chez vous.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-shell-muted text-pretty">
            {lastRun
              ? `${numberFormatter.format(lastRun.rowCount)} associations du Répertoire national, mises à jour le ${formatDate(lastRun.importedAt)}, complétées par les associations elles-mêmes.`
              : "Les associations du Répertoire national, complétées par les associations elles-mêmes."}
          </p>

          <div className="mt-8">
            <SearchForm size="hero" />
          </div>

          <nav aria-label="Explorer par thème" className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 font-semibold">Explorer :</span>
            {POPULAR_THEMES.map((t) => (
              <Link
                key={t.code}
                href={searchHref({ theme: t.code })}
                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 font-semibold transition-colors hover:bg-white/22 focus-visible:outline-2 focus-visible:outline-white"
              >
                <span aria-hidden className={cn("size-2.5 rounded-full", themeBandClass(t.code))} />
                {t.label}
              </Link>
            ))}
          </nav>

          <ul aria-label="Comment lire une carte" className="mt-14 grid gap-6 sm:grid-cols-3">
            {SPECIMENS.map(({ card, legend }) => (
              <li key={legend} className="flex flex-col gap-3">
                <div className="flex flex-1 text-foreground">
                  <AssociationCard result={card} specimen />
                </div>
                <p className="text-sm text-shell-muted">{legend}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-container py-16">
        <h2 className="text-2xl font-extrabold tracking-tight">Vous gérez une association ?</h2>
        <p className="mt-3 max-w-prose text-muted-foreground">
          Les données publiques sont souvent incomplètes : pas de contact, une adresse ancienne, une description
          d&apos;une ligne. Retrouvez votre association, connectez-vous et revendiquez sa page pour corriger et
          compléter ses informations. C&apos;est gratuit.
        </p>
        <Link href="/search" className={cn(buttonVariants(), "mt-5 h-11 gap-2 rounded-full px-5 text-base font-bold")}>
          Trouver mon association
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </section>
    </>
  )
}
