import { z } from "zod"

export const PAGE_SIZE = 18
// search_associations ranks at most this many matches per query.
export const MAX_RESULTS = 1000

const text = (max: number) =>
  z.preprocess((v) => (typeof v === "string" ? v.trim().slice(0, max) : ""), z.string())

// Parsed from untrusted query strings: anything malformed falls back to the default.
export const SearchParamsSchema = z.object({
  q: text(200),
  lieu: text(100),
  theme: z.preprocess((v) => (typeof v === "string" && /^\d{6}$/.test(v) ? v : ""), z.string()),
  dissoutes: z.preprocess((v) => v === "1", z.boolean()),
  page: z.preprocess(
    (v) => Math.min(Math.max(Number.parseInt(String(v), 10) || 1, 1), Math.ceil(MAX_RESULTS / PAGE_SIZE)),
    z.number()
  ),
})

export type SearchParams = z.infer<typeof SearchParamsSchema>

export function hasSearchCriteria(p: SearchParams): boolean {
  return Boolean(p.q || p.lieu || p.theme)
}

export function searchHref(p: Partial<SearchParams>): string {
  const params = new URLSearchParams()
  if (p.q) params.set("q", p.q)
  if (p.lieu) params.set("lieu", p.lieu)
  if (p.theme) params.set("theme", p.theme)
  if (p.dissoutes) params.set("dissoutes", "1")
  if (p.page && p.page > 1) params.set("page", String(p.page))
  const query = params.toString()
  return query ? `/search?${query}` : "/search"
}
