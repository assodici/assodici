"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Search, Loader2 } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { InputGroupAddon } from "@/components/ui/input-group"
import { createBrowserClient } from "@/lib/supabase/client"

const SearchResultSchema = z.object({
  id: z.string(),
  titre: z.string(),
  objet: z.string().nullable(),
  adrs_libcommune: z.string().nullable(),
  adrs_codepostal: z.string().nullable(),
  rank: z.number(),
})

type SearchResult = z.infer<typeof SearchResultSchema>

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
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
    const parsed = z.array(SearchResultSchema).safeParse(data)
    if (!parsed.success) {
      console.error("search_associations returned an unexpected shape:", parsed.error)
    }
    setResults(parsed.success ? parsed.data : [])
    setOpen(true)
    setLoading(false)
  }, [])

  const handleInputValueChange = useCallback((value: string) => {
    setQuery(value)
    if (value.trim().length >= 2) setLoading(true)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  return (
    <Combobox
      items={results}
      filter={null}
      autoComplete="none"
      inputValue={query}
      onInputValueChange={handleInputValueChange}
      open={open}
      onOpenChange={setOpen}
      itemToStringLabel={(item: SearchResult) => item.titre}
      onValueChange={(item: SearchResult | null) => {
        if (item) router.push(`/association/${encodeURIComponent(item.id)}`)
      }}
    >
      <ComboboxInput
        placeholder="Rechercher une association..."
        showTrigger={false}
        className="w-full max-w-2xl"
      >
        <InputGroupAddon align="inline-start">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>Aucun résultat pour &laquo;&nbsp;{query.trim()}&nbsp;&raquo;</ComboboxEmpty>
        <ComboboxList>
          {(item: SearchResult) => (
            <ComboboxItem key={item.id} value={item} className="flex-col items-start gap-0.5">
              <p className="w-full truncate text-sm font-medium">{item.titre}</p>
              <div className="flex w-full items-center gap-2">
                {item.adrs_libcommune && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.adrs_libcommune}
                    {item.adrs_codepostal ? ` (${item.adrs_codepostal})` : ""}
                  </span>
                )}
                {item.objet && (
                  <span className="truncate text-xs text-muted-foreground opacity-70">
                    {item.objet.slice(0, 90)}
                  </span>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
