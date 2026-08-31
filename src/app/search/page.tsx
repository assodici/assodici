import { Suspense } from "react"
import { z } from "zod"
import { createPublicClient } from "@/lib/supabase/server"
import { SearchResultSchema } from "@/lib/schemas/search-result"
import { SearchResultsList } from "@/components/search-results-list"
import { SearchBar } from "@/components/search-bar"

const PAGE_SIZE = 12

async function SearchResults({ query }: { query: string }) {
  if (query.trim().length < 2) {
    return <p className="text-muted-foreground">Tapez au moins 2 caractères pour rechercher.</p>
  }

  const supabase = createPublicClient()
  const { data, error } = await supabase.rpc("search_associations", {
    query,
    lim: PAGE_SIZE,
    offset_val: 0,
  })

  if (error) {
    console.error("search_associations request failed:", error)
    return <p className="text-muted-foreground">La recherche a échoué. Réessayez.</p>
  }

  const parsed = z.array(SearchResultSchema).safeParse(data)
  if (!parsed.success) {
    console.error("search_associations returned an unexpected shape:", parsed.error)
    return <p className="text-muted-foreground">La recherche a échoué. Réessayez.</p>
  }

  return <SearchResultsList key={query} initialResults={parsed.data} query={query} />
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}
      >
        {searchParams.then(({ q }) => {
          const query = (q ?? "").trim()
          return (
            <>
              <SearchBar key={query} initialQuery={query} />
              <h1 className="text-2xl font-bold tracking-tight">
                Résultats pour &laquo;&nbsp;{query}&nbsp;&raquo;
              </h1>
              <SearchResults query={query} />
            </>
          )
        })}
      </Suspense>
    </div>
  )
}
