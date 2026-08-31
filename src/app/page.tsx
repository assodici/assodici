import Image from "next/image"
import Link from "next/link"
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { SearchBar } from "@/components/search-bar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Toutes", "Engagement & Solidarité", "Sports & Activités", "Arts & Culture"]

// Tailwind's scanner needs each full class token as literal text — building
// these via template-string interpolation (e.g. `${color}/20`) silently
// produces no CSS at all, since the scanner can't see runtime-built strings.
const CARD_ACCENTS = [
  { wrap: "bg-brand-blue/20", strip: "bg-brand-blue/40", cta: "bg-brand-blue hover:bg-brand-blue/90" },
  {
    wrap: "bg-brand-orange/20",
    strip: "bg-brand-orange/40",
    cta: "bg-brand-orange hover:bg-brand-orange/90",
  },
  {
    wrap: "bg-brand-yellow/20",
    strip: "bg-brand-yellow/40",
    cta: "bg-brand-yellow hover:bg-brand-yellow/90",
  },
] as const

type FeaturedAssociation = {
  id: string
  titre: string
  objet: string | null
  adrs_libcommune: string | null
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" })
const numberFormatter = new Intl.NumberFormat("fr-FR")

export default async function Home() {
  let lastRun: { imported_at: string | null; row_count: number | null } | null = null
  let featured: FeaturedAssociation[] = []

  if (isSupabaseConfigured()) {
    const supabase = createPublicClient()
    const [ingestionResult, featuredResult] = await Promise.all([
      supabase
        .from("ingestion_runs")
        .select("imported_at, row_count")
        .eq("status", "success")
        .order("imported_at", { ascending: false })
        .limit(1)
        .single(),
      supabase.from("associations").select("id, titre, objet, adrs_libcommune").limit(3),
    ])
    lastRun = ingestionResult.data
    featured = featuredResult.data ?? []
  }

  const formattedDate = lastRun?.imported_at
    ? dateFormatter.format(new Date(lastRun.imported_at))
    : null

  const formattedCount = lastRun?.row_count ? numberFormatter.format(lastRun.row_count) : null

  return (
    <div>
      <section className="bg-brand-yellow">
        <div className="page-container flex flex-col items-center gap-8 py-16 text-center">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:text-left">
            <Image
              src="/brand/hero-illustration.png"
              alt=""
              width={220}
              height={315}
              className="h-auto w-40 shrink-0 sm:w-52"
              priority
            />
            <h1 className="font-heading text-4xl leading-tight text-brand-dark sm:text-6xl">
              Trouve ton asso de rêve
            </h1>
          </div>

          <div className="flex w-full max-w-3xl flex-col items-center gap-4">
            <SearchBar />

            {/* Decorative for now — the associations schema has no category
                taxonomy yet, so these don't filter results. */}
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((label, i) =>
                i === 0 ? (
                  <Badge key={label} className="px-5 py-2 text-sm">
                    {label}
                  </Badge>
                ) : (
                  <Badge
                    key={label}
                    variant="outline"
                    className="bg-white px-5 py-2 text-sm text-muted-foreground"
                  >
                    {label}
                  </Badge>
                )
              )}
            </div>
          </div>

          {formattedDate && formattedCount && (
            <p className="text-sm text-brand-dark/70">
              Données mises à jour le {formattedDate} · {formattedCount} associations
            </p>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="page-container grid gap-6 py-16 sm:grid-cols-3">
          {featured.map((association, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
            return (
              <Card key={association.id} className={cn("overflow-hidden py-0", accent.wrap)}>
                <div className={accent.strip} />
                <CardContent className="flex flex-1 flex-col gap-2 pb-4">
                  <p className="font-heading text-sm text-foreground">{association.titre}</p>
                  {association.adrs_libcommune && (
                    <p className="text-xs text-muted-foreground">{association.adrs_libcommune}</p>
                  )}
                  {association.objet && (
                    <p className="line-clamp-3 flex-1 text-xs text-muted-foreground">
                      {association.objet}
                    </p>
                  )}
                  <Link
                    href={`/association/${encodeURIComponent(association.id)}`}
                    className={cn(
                      buttonVariants(),
                      "mt-2 rounded-2xl font-heading text-white",
                      accent.cta
                    )}
                  >
                    en savoir plus
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}
    </div>
  )
}
