"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { safeNextPath, siteUrl } from "@/lib/url"

const loginSchema = z.object({
  email: z.email("Adresse email invalide."),
})

type LoginState = { error: string } | { success: true } | null

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Send the user back where they were (e.g. the association they want to claim).
  const next = safeNextPath(formData.get("next")?.toString())
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    return { error: "Impossible d'envoyer le lien. Réessayez." }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/?toast=loggedout")
}
