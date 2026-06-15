import { cacheLife, cacheTag } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"

export async function getCommunesByPostalCode(codePostal: string) {
  "use cache"
  cacheLife("weeks")
  cacheTag("communes", `commune-${codePostal}`)

  const { data, error } = await createServerClient()
    .from("communes")
    .select("nom_commune")
    .eq("code_postal", codePostal)

  if (error) throw new Error(error.message)
  return data ?? []
}
