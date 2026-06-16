"use client"

import { useEffect, useState } from "react"

const ERROR_MESSAGES: Record<string, string> = {
  otp_expired: "Le lien de connexion a expiré. Demandez-en un nouveau.",
  access_denied: "Lien invalide ou déjà utilisé. Demandez-en un nouveau.",
}

export function AuthErrorBanner() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const errorCode = hash.get("error_code")
    const errorDesc = hash.get("error_description")
    if (errorCode) {
      setMessage(ERROR_MESSAGES[errorCode] ?? decodeURIComponent(errorDesc?.replace(/\+/g, " ") ?? "Une erreur est survenue."))
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [])

  if (!message) return null

  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  )
}
