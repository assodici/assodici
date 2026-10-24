import { z } from "zod"

export const SearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  city: z.string().nullable(),
  postal_code: z.string().nullable(),
  theme_code: z.string().nullable(),
  theme_label: z.string().nullable(),
  subtheme_label: z.string().nullable(),
  is_active: z.boolean(),
  founded_on: z.string().nullable(),
  is_claimed: z.boolean(),
  rank: z.number(),
  total: z.number(),
})

export type SearchResult = z.infer<typeof SearchResultSchema>
