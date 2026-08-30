import Image from "next/image"
import Link from "next/link"
import { createPublicClient } from "@/lib/supabase/server"
import { SearchBar } from "@/components/search-bar"

const CATEGORIES = ["Toutes", "Engagement & Solidarité", "Sports & Activités", "Arts & Culture"]

const CARD_ACCENTS = ["bg-brand-blue", "bg-brand-orange", "bg-brand-yellow"] as const

type FeaturedAssociation = {
  id: string
  titre: string
  objet: string | null
  adrs_libcommune: string | null
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" })
const numberFormatter = new Intl.NumberFormat("fr-FR")

export default async function Home() {
  const supabase = createPublicClient()

  let lastRun: { imported_at: string | null; row_count: number | null } | null = null
  let featured: FeaturedAssociation[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
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
              {CATEGORIES.map((label, i) => (
                <span
                  key={label}
                  className={
                    i === 0
                      ? "rounded-full bg-brand-blue px-5 py-2 text-sm font-medium text-white"
                      : "rounded-full bg-white px-5 py-2 text-sm font-medium text-muted-foreground"
                  }
                >
                  {label}
                </span>
              ))}
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
          {featured.map((association, i) => (
            <div
              key={association.id}
              className={`flex flex-col overflow-hidden rounded-2xl ${CARD_ACCENTS[i % CARD_ACCENTS.length]}/20`}
            >
              <div className={`h-24 ${CARD_ACCENTS[i % CARD_ACCENTS.length]}/40`} />
              <div className="flex flex-1 flex-col gap-2 p-4">
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
                  className={`mt-2 rounded-2xl ${CARD_ACCENTS[i % CARD_ACCENTS.length]} py-2 text-center font-heading text-sm text-white`}
                >
                  en savoir plus
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
