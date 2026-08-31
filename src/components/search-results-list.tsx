"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { createBrowserClient } from "@/lib/supabase/client"
import { SearchResultSchema, type SearchResult } from "@/lib/schemas/search-result"

const PAGE_SIZE = 12

type SearchResultsListProps = {
  initialResults: SearchResult[]
  query: string
}

export function SearchResultsList({ initialResults, query }: SearchResultsListProps) {
  const [results, setResults] = useState(initialResults)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialResults.length === PAGE_SIZE)

  const loadMore = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.rpc("search_associations", {
        query,
        lim: PAGE_SIZE,
        offset_val: results.length,
      })
      if (error) throw error
      const parsed = z.array(SearchResultSchema).safeParse(data)
      if (!parsed.success) {
        console.error("search_associations returned an unexpected shape:", parsed.error)
        setHasMore(false)
        return
      }
      setResults((prev) => [...prev, ...parsed.data])
      setHasMore(parsed.data.length === PAGE_SIZE)
    } catch (err) {
      console.error("search_associations request failed:", err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground">
        Aucun résultat pour &laquo;&nbsp;{query}&nbsp;&raquo;
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {results.map((result) => (
          <Card key={result.id}>
            <CardContent>
              <Link href={`/association/${encodeURIComponent(result.id)}`} className="block">
                <p className="font-medium">{result.titre}</p>
                <div className="mt-1 flex items-center gap-2">
                  {result.adrs_libcommune && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {result.adrs_libcommune}
                      {result.adrs_codepostal ? ` (${result.adrs_codepostal})` : ""}
                    </span>
                  )}
                  {result.objet && (
                    <span className="truncate text-xs text-muted-foreground opacity-70">
                      {result.objet.slice(0, 120)}
                    </span>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <Button variant="outline" onClick={loadMore} disabled={loading} className="self-center">
          {loading && <Spinner className="h-4 w-4" />}
          Charger plus
        </Button>
      )}
    </div>
  )
}
