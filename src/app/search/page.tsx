import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { AssociationCard } from "@/components/association-card"
import { Pagination } from "@/components/pagination"
import { SearchForm } from "@/components/search-form"
import { getThemes, searchAssociations } from "@/lib/associations"
import { numberFormatter } from "@/lib/format"
import {
  hasSearchCriteria,
  MAX_RESULTS,
  PAGE_SIZE,
  searchHref,
  SearchParamsSchema,
  type SearchParams,
} from "@/lib/schemas/search-params"
import { isSupabaseConfigured } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Rechercher une association",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
}

type RawParams = Promise<Record<string, string | string[] | undefined>>

function Message({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-xl font-bold">{title}</p>
      {children && <div className="mt-3 text-muted-foreground">{children}</div>}
    </div>
  )
}

async function SearchBarWithFilters({ params }: { params: SearchParams }) {
  const themes = isSupabaseConfigured() ? await getThemes().catch(() => []) : []
  return <SearchForm size="bar" values={params} themes={themes} />
}

async function Results({ params }: { params: SearchParams }) {
  if (!hasSearchCriteria(params)) {
    return (
      <Message title="Que cherchez-vous ?">
        Tapez le nom d&apos;une association, une activité (football, chorale, aide aux devoirs…) ou une ville.
      </Message>
    )
  }
  if (!isSupabaseConfigured()) {
    return <Message title="Recherche momentanément indisponible">Réessayez dans quelques minutes.</Message>
  }

  let found: Awaited<ReturnType<typeof searchAssociations>>
  try {
    found = await searchAssociations(params)
  } catch (error) {
    console.error(error)
    return (
      <Message title="La recherche a échoué">
        <Link href={searchHref(params)} className="font-semibold text-primary underline">
          Réessayer
        </Link>
      </Message>
    )
  }

  const { results, total } = found
  if (results.length === 0) {
    return (
      <Message title="Aucune association ne correspond">
        <p>Vérifiez l&apos;orthographe ou essayez moins de mots.</p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-4">
          {params.lieu && (
            <Link href={searchHref({ ...params, lieu: "", page: 1 })} className="font-semibold text-primary underline">
              Chercher partout en France
            </Link>
          )}
          {params.theme && (
            <Link href={searchHref({ ...params, theme: "", page: 1 })} className="font-semibold text-primary underline">
              Tous les thèmes
            </Link>
          )}
          {!params.dissoutes && (
            <Link href={searchHref({ ...params, dissoutes: true, page: 1 })} className="font-semibold text-primary underline">
              Inclure les dissoutes
            </Link>
          )}
        </p>
      </Message>
    )
  }

  const capped = total >= MAX_RESULTS
  const pageCount = Math.ceil(Math.min(total, MAX_RESULTS) / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        <span className="font-bold text-foreground">
          {capped ? "Plus de 1 000" : numberFormatter.format(total)} association{total > 1 ? "s" : ""}
        </span>
        {params.q && <> pour « {params.q} »</>}
        {params.lieu && <> {/^\d{2,3}$/.test(params.lieu) ? "dans le" : "à"} {params.lieu}</>}
        {capped && " · précisez un lieu ou un thème pour affiner"}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <li key={result.id} className="flex">
            <AssociationCard result={result} />
          </li>
        ))}
      </ul>
      <Pagination params={params} pageCount={pageCount} />
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Chargement des résultats">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-48 animate-pulse rounded-xl bg-card ring-1 ring-border" />
      ))}
    </div>
  )
}

async function SearchContent({ searchParams }: { searchParams: RawParams }) {
  const params = SearchParamsSchema.parse(await searchParams)
  return (
    <>
      <section className="bg-shell">
        <div className="page-container py-6 sm:py-8">
          <h1 className="sr-only">Rechercher une association</h1>
          <Suspense fallback={<SearchForm size="bar" values={params} />}>
            <SearchBarWithFilters params={params} />
          </Suspense>
        </div>
      </section>
      <div className="page-container py-8">
        <Suspense key={searchHref(params)} fallback={<ResultsSkeleton />}>
          <Results params={params} />
        </Suspense>
      </div>
    </>
  )
}

export default function SearchPage({ searchParams }: { searchParams: RawParams }) {
  return (
    <Suspense fallback={<section className="h-32 bg-shell" />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  )
}
