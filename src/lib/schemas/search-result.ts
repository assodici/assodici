import { z } from "zod"

export const SearchResultSchema = z.object({
  id: z.string(),
  titre: z.string(),
  objet: z.string().nullable(),
  adrs_libcommune: z.string().nullable(),
  adrs_codepostal: z.string().nullable(),
  rank: z.number(),
})

export type SearchResult = z.infer<typeof SearchResultSchema>
