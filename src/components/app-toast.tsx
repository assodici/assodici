"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

const PARAM_TOASTS: Record<string, { type: "success" | "error"; message: string }> = {
  loggedin: { type: "success", message: "Connexion réussie." },
  loggedout: { type: "success", message: "Déconnexion réussie." },
  auth_failed: { type: "error", message: "Lien invalide ou expiré. Demandez-en un nouveau." },
}

const HASH_ERROR_MESSAGES: Record<string, string> = {
  otp_expired: "Le lien de connexion a expiré. Demandez-en un nouveau.",
  access_denied: "Lien invalide ou déjà utilisé. Demandez-en un nouveau.",
}

export function AppToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const key = searchParams.get("toast")
    if (key) {
      const entry = PARAM_TOASTS[key]
      if (entry) {
        entry.type === "success" ? toast.success(entry.message) : toast.error(entry.message)
      }
      const params = new URLSearchParams(searchParams.toString())
      params.delete("toast")
      router.replace(params.size > 0 ? `${pathname}?${params}` : pathname)
    }
  }, [searchParams, router, pathname])

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const errorCode = hash.get("error_code")
    const errorDesc = hash.get("error_description")
    if (errorCode) {
      toast.error(
        HASH_ERROR_MESSAGES[errorCode] ??
          decodeURIComponent(errorDesc?.replace(/\+/g, " ") ?? "Une erreur est survenue.")
      )
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [])

  return null
}
