"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createBrowserClient } from "@/lib/supabase/client"

interface SearchResult {
  id: string
  titre: string
  objet: string | null
  adrs_libcommune: string | null
  adrs_codepostal: string | null
  rank: number
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const supabase = createBrowserClient()
    const { data } = await supabase.rpc("search_associations", {
      query: trimmed,
      lim: 8,
    })
    setResults((data as SearchResult[]) ?? [])
    setOpen(true)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length >= 2) setLoading(true)
    debounceRef.current = setTimeout(() => search(query), 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const noResults = open && !loading && results.length === 0 && query.trim().length >= 2

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative">
        {loading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Rechercher une association..."
          className="pl-9"
          autoComplete="off"
        />
      </div>

      {(open || noResults) && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
          {results.map((r, i) => (
            <Link
              key={r.id}
              href={`/association/${encodeURIComponent(r.id)}`}
              className={`block px-4 py-3 hover:bg-accent transition-colors ${i < results.length - 1 ? "border-b" : ""}`}
              onClick={() => setOpen(false)}
            >
              <p className="font-medium text-sm truncate">{r.titre}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {r.adrs_libcommune && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {r.adrs_libcommune}
                    {r.adrs_codepostal ? ` (${r.adrs_codepostal})` : ""}
                  </span>
                )}
                {r.objet && (
                  <span className="text-xs text-muted-foreground truncate opacity-70">
                    {r.objet.slice(0, 90)}
                  </span>
                )}
              </div>
            </Link>
          ))}

          {noResults && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Aucun résultat pour &laquo;&nbsp;{query.trim()}&nbsp;&raquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
