import { cacheLife, cacheTag } from "next/cache"
import { z } from "zod"
import { createPublicClient } from "@/lib/supabase/server"
import { SearchResultSchema, type SearchResult } from "@/lib/schemas/search-result"
import { PAGE_SIZE, type SearchParams } from "@/lib/schemas/search-params"
import { sentenceCase } from "@/lib/format"

// Cache tags, invalidated by the profile actions.
export const SEARCH_TAG = "search"
export const associationTag = (id: string) => `association:${id}`

// RNA ids are "W" + 9 digits; older records use other short alphanumeric ids.
export const isAssociationId = (id: string) => /^[A-Z0-9]{1,20}$/i.test(id)

// Read functions throw on failure so an error is never cached; pages catch and degrade.
export async function searchAssociations(
  p: SearchParams
): Promise<{ results: SearchResult[]; total: number }> {
  "use cache"
  cacheTag(SEARCH_TAG)
  cacheLife("hours")

  const { data, error } = await createPublicClient().rpc("search_associations", {
    q: p.q,
    lieu: p.lieu,
    theme: p.theme,
    include_dissolved: p.dissoutes,
    lim: PAGE_SIZE,
    off: (p.page - 1) * PAGE_SIZE,
  })
  if (error) throw new Error(`search_associations failed: ${error.message}`)

  const results = z.array(SearchResultSchema).parse(data)
  return { results, total: results[0]?.total ?? 0 }
}

const OfficialSchema = z.object({
  id: z.string(),
  siret: z.string().nullable(),
  titre: z.string(),
  objet: z.string().nullable(),
  position: z.string().nullable(),
  objet_social1: z.string().nullable(),
  date_creat: z.string().nullable(),
  date_publi: z.string().nullable(),
  date_disso: z.string().nullable(),
  adrs_complement: z.string().nullable(),
  adrs_numvoie: z.string().nullable(),
  adrs_repetition: z.string().nullable(),
  adrs_typevoie: z.string().nullable(),
  adrs_libvoie: z.string().nullable(),
  adrs_codepostal: z.string().nullable(),
  adrs_libcommune: z.string().nullable(),
  siteweb: z.string().nullable(),
})

const ProfileRowSchema = z.object({
  owner_id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  postal_code: z.string().nullable(),
  city: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  updated_at: z.string(),
})

export type Association = NonNullable<Awaited<ReturnType<typeof getAssociation>>>

export async function getAssociation(id: string) {
  "use cache"
  cacheTag(associationTag(id))
  cacheLife("days")

  const supabase = createPublicClient()
  const [official, profile] = await Promise.all([
    supabase.from("associations").select(Object.keys(OfficialSchema.shape).join(", ")).eq("id", id).maybeSingle(),
    supabase.from("association_profiles").select(Object.keys(ProfileRowSchema.shape).join(", ")).eq("association_id", id).maybeSingle(),
  ])
  if (official.error) throw new Error(`association ${id} failed: ${official.error.message}`)
  if (profile.error) throw new Error(`profile ${id} failed: ${profile.error.message}`)
  if (!official.data) return null

  const a = OfficialSchema.parse(official.data)
  const p = profile.data ? ProfileRowSchema.parse(profile.data) : null

  const themes = await getThemeMap()
  const theme = a.objet_social1 ? themes[a.objet_social1] : undefined
  const parent = theme ? themes[theme.parentCode] : undefined

  const officialAddress = [
    a.adrs_complement,
    [a.adrs_numvoie, a.adrs_repetition, a.adrs_typevoie, a.adrs_libvoie].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ")

  return {
    id: a.id,
    siret: a.siret,
    officialName: a.titre,
    name: p?.name ?? a.titre,
    description: p?.description ?? a.objet,
    address: p?.address ?? (officialAddress || null),
    postalCode: p?.postal_code ?? a.adrs_codepostal,
    city: p?.city ?? a.adrs_libcommune,
    email: p?.email ?? null,
    phone: p?.phone ?? null,
    website: p?.website ?? a.siteweb,
    isActive: a.position === "A",
    foundedOn: a.date_creat,
    publishedOn: a.date_publi,
    dissolvedOn: a.date_disso,
    themeCode: parent ? (theme?.parentCode ?? null) : null,
    themeLabel: parent ? sentenceCase(parent.label) : null,
    subthemeLabel: theme && parent && theme !== parent ? sentenceCase(theme.label) : null,
    owner: p ? { id: p.owner_id, updatedAt: p.updated_at } : null,
  }
}

// The whole Waldec nomenclature (~300 rows), cached: theme lookups never hit the database per page.
// A plain object, not a Map: "use cache" does not round-trip Maps.
async function getThemeMap(): Promise<Record<string, { label: string; parentCode: string }>> {
  "use cache"
  cacheLife("weeks")

  const { data, error } = await createPublicClient().from("association_themes").select("code, label, parent_code")
  if (error) throw new Error(`association_themes failed: ${error.message}`)
  return Object.fromEntries(data.map((t) => [t.code, { label: t.label, parentCode: t.parent_code }]))
}

export async function getThemes(): Promise<{ code: string; label: string }[]> {
  const themes = await getThemeMap()
  return Object.entries(themes)
    .filter(([code, t]) => code === t.parentCode)
    .map(([code, t]) => ({ code, label: sentenceCase(t.label) }))
    .sort((x, y) => x.label.localeCompare(y.label, "fr"))
}

export async function getLastIngestion(): Promise<{ importedAt: string; rowCount: number } | null> {
  "use cache"
  cacheLife("hours")

  const { data } = await createPublicClient()
    .from("ingestion_runs")
    .select("imported_at, row_count")
    .eq("status", "success")
    .order("imported_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.imported_at && data.row_count ? { importedAt: data.imported_at, rowCount: data.row_count } : null
}
