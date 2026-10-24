"use server"

import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient, getUser } from "@/lib/supabase/server"
import { associationTag, isAssociationId, SEARCH_TAG } from "@/lib/associations"
import { PROFILE_FIELDS, ProfileSchema, type Profile } from "@/lib/schemas/profile"

// Authorization lives in RLS (association_profiles policies); these actions only validate and route.

const associationPath = (id: string) => `/association/${encodeURIComponent(id)}`

function invalidate(id: string) {
  updateTag(associationTag(id))
  updateTag(SEARCH_TAG)
}

export async function claimAssociation(id: string) {
  if (!(await getUser())) redirect(`/login?next=${encodeURIComponent(associationPath(id))}`)
  if (!isAssociationId(id)) redirect("/")

  const supabase = await createServerClient()
  const { error } = await supabase.from("association_profiles").insert({ association_id: id })
  if (error) {
    // 23505: primary key taken, someone already owns it. Otherwise the RLS check refused (claim limit).
    redirect(`${associationPath(id)}?toast=${error.code === "23505" ? "already_claimed" : "claim_failed"}`)
  }

  invalidate(id)
  redirect(`${associationPath(id)}/edit?toast=claimed`)
}

export type ProfileFormState = {
  error?: string
  fieldErrors?: Partial<Record<keyof Profile, string>>
} | null

export async function updateProfile(
  id: string,
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  if (!(await getUser())) return { error: "Votre session a expiré. Reconnectez-vous." }
  if (!isAssociationId(id)) return { error: "Association inconnue." }

  const parsed = ProfileSchema.safeParse(Object.fromEntries(PROFILE_FIELDS.map((f) => [f, formData.get(f)])))
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof Profile, string>> = {}
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as keyof Profile] ??= issue.message
    return { error: "Certains champs sont à corriger.", fieldErrors }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("association_profiles")
    .update(parsed.data)
    .eq("association_id", id)
    .select("association_id")
  if (error) return { error: "Enregistrement impossible. Réessayez." }
  // RLS turns someone else's row into "0 rows updated" rather than an error.
  if (!data.length) return { error: "Vous ne gérez pas cette association." }

  invalidate(id)
  redirect(`${associationPath(id)}?toast=saved`)
}
