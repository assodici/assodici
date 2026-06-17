"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3001")}/auth/confirm`,
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
